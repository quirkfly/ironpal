#!/bin/bash
# Deploys the IronPal landing page (Astro static build) to the production
# web server shared with trolless.app, handlr.chat and gitnfit.dev.
# Serves ironpal.co (canonical) with www.ironpal.co 301 → apex, over SSL.
#
# Modelled on ../gitnfit/deployment/deploy.sh — same Digital Ocean droplet
# (IP 45.55.36.33, hostname handlr-web), same Cloudflare-origin SSL pattern,
# same www-data permissions. Pure static (no API backend).
#
# Usage:
#   ./deployment/deploy.sh             # build + deploy (HTTPS)
#   ./deployment/deploy.sh --no-build  # skip the npm build (re-push existing dist)
#   ./deployment/deploy.sh --http-only # write HTTP-only nginx config (no SSL)
#
# SSL: if a Cloudflare origin cert is not present on the server, this script
# auto-generates a self-signed origin cert at the paths below. That serves
# real TLS on :443 and works with Cloudflare SSL/TLS mode = "Full".
# For "Full (strict)", replace it with a Cloudflare Origin Certificate
# (dashboard → SSL/TLS → Origin Server) at the same paths and re-run.
#
# Prerequisites:
#   - SSH access as root@45.55.36.33
#   - Nginx + openssl on the remote; Node + npm + rsync + ssh locally
#   - Cloudflare DNS: A @ → 45.55.36.33 (proxied), CNAME www → ironpal.co

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────
SERVER="${SERVER:-root@45.55.36.33}"
CANONICAL_HOST="ironpal.co"
ALIAS_HOSTS=("www.ironpal.co")
REMOTE_WEB="/var/www/${CANONICAL_HOST}"
REMOTE_API="/opt/ironpal-api"
API_PORT=3003
API_SERVICE="ironpal-api"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SITE_DIR="${REPO_ROOT}/web"

CLOUDFLARE_CERT="${CLOUDFLARE_CERT:-/etc/ssl/certs/cloudflare-ironpal.pem}"
CLOUDFLARE_KEY="${CLOUDFLARE_KEY:-/etc/ssl/private/cloudflare-ironpal.key}"

# ── CLI args ──────────────────────────────────────────────────────────────
DO_BUILD=1
USE_SSL=1
DO_API=1
for arg in "$@"; do
  case "$arg" in
    --no-build)  DO_BUILD=0 ;;
    --http-only) USE_SSL=0 ;;
    --no-api)    DO_API=0 ;;
    -h|--help)   sed -n '1,30p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

# ── Colours ───────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; NC='\033[0m'
step() { echo -e "${BLUE}▶ $*${NC}"; }
ok()   { echo -e "${GREEN}✅ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }
die()  { echo -e "${RED}❌ $*${NC}" >&2; exit 1; }

# ── Pre-flight ────────────────────────────────────────────────────────────
[ -d "${SITE_DIR}" ] || die "Site dir not found: ${SITE_DIR}"
ssh -o BatchMode=yes -o ConnectTimeout=8 "${SERVER}" true \
  || die "SSH to ${SERVER} failed."

# ── 1. Build ──────────────────────────────────────────────────────────────
if [ "${DO_BUILD}" -eq 1 ]; then
  step "Building Astro site in ${SITE_DIR}…"
  ( cd "${SITE_DIR}" && npm install --silent && npm run build )
  ok "Build complete: ${SITE_DIR}/dist/"
else
  [ -d "${SITE_DIR}/dist" ] || die "--no-build used but ${SITE_DIR}/dist/ does not exist"
  warn "Skipping build (using existing dist/)"
fi

# ── 2. Backup existing deployment ─────────────────────────────────────────
step "Backing up current deployment (if any)…"
ssh "${SERVER}" "test -d ${REMOTE_WEB} && cp -a ${REMOTE_WEB} ${REMOTE_WEB}.backup-\$(date +%Y%m%d-%H%M%S) || true"

# ── 3. Sync the built site ────────────────────────────────────────────────
step "Syncing dist/ → ${SERVER}:${REMOTE_WEB}/…"
ssh "${SERVER}" "mkdir -p ${REMOTE_WEB}"
rsync -avz --delete "${SITE_DIR}/dist/" "${SERVER}:${REMOTE_WEB}/"

step "Setting permissions…"
ssh "${SERVER}" "chown -R www-data:www-data ${REMOTE_WEB} && chmod -R u=rwX,go=rX ${REMOTE_WEB}"


# ── 3b. Deploy the email API ──────────────────────────────────────────────
if [ "${DO_API}" -eq 1 ]; then
  step "Deploying email API → ${SERVER}:${REMOTE_API} (port ${API_PORT})…"
  ssh "${SERVER}" "mkdir -p ${REMOTE_API}/server"
  # NOTE: no --delete, and emails.db is excluded. The live subscriber list lives in
  # ${REMOTE_API}/server/emails.db and must survive every redeploy.
  rsync -avz --exclude 'emails.db*' "${SITE_DIR}/server/" "${SERVER}:${REMOTE_API}/server/"
  rsync -avz "${SITE_DIR}/package.json" "${SERVER}:${REMOTE_API}/"

  step "Installing API dependencies on the server…"
  ssh "${SERVER}" "cd ${REMOTE_API} && npm install --omit=dev --silent --no-audit --no-fund"

  step "Writing systemd unit (${API_SERVICE})…"
  ssh "${SERVER}" "cat > /etc/systemd/system/${API_SERVICE}.service <<'SYSTEMD_EOF'
[Unit]
Description=IronPal Early-Bird Email API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${REMOTE_API}
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=API_PORT=${API_PORT}

NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=${REMOTE_API}/server
ProtectHome=true

StandardOutput=journal
StandardError=journal
SyslogIdentifier=${API_SERVICE}

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF"

  ssh "${SERVER}" "chown -R www-data:www-data ${REMOTE_API}"
  ssh "${SERVER}" "systemctl daemon-reload && systemctl enable ${API_SERVICE} >/dev/null 2>&1 && systemctl restart ${API_SERVICE}"
  sleep 2
  if [ "$(ssh "${SERVER}" "systemctl is-active ${API_SERVICE}")" = "active" ]; then
    ok "API service running"
  else
    ssh "${SERVER}" "journalctl -u ${API_SERVICE} -n 25 --no-pager"
    die "API service failed to start"
  fi
else
  warn "Skipping API deploy (--no-api)"
fi

# ── 4. Ensure an SSL cert exists (auto-generate self-signed if missing) ────
HAS_CERT=0
if [ "${USE_SSL}" -eq 1 ]; then
  if ssh "${SERVER}" "test -f ${CLOUDFLARE_CERT} && test -f ${CLOUDFLARE_KEY}"; then
    HAS_CERT=1
    ok "Found origin cert on server (${CLOUDFLARE_CERT})"
  else
    warn "No origin cert found — generating a self-signed one (works with Cloudflare 'Full')…"
    ssh "${SERVER}" "openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
      -keyout ${CLOUDFLARE_KEY} -out ${CLOUDFLARE_CERT} \
      -subj '/CN=${CANONICAL_HOST}/O=IronPal' \
      -addext 'subjectAltName=DNS:${CANONICAL_HOST},DNS:*.${CANONICAL_HOST}' \
      && chmod 600 ${CLOUDFLARE_KEY} && chmod 644 ${CLOUDFLARE_CERT}"
    HAS_CERT=1
    ok "Generated self-signed origin cert. Set Cloudflare SSL/TLS mode to 'Full'."
  fi
fi

# ── 5. Write nginx vhost ──────────────────────────────────────────────────
step "Writing nginx vhost (/etc/nginx/sites-available/${CANONICAL_HOST})…"
REDIRECT_HOSTS="$(IFS=' '; echo "${ALIAS_HOSTS[*]}")"

if [ "${HAS_CERT}" -eq 1 ]; then
  ssh "${SERVER}" "cat > /etc/nginx/sites-available/${CANONICAL_HOST} <<'NGINX_EOF'
# HTTP → HTTPS for all hosts
server {
    listen 80;
    listen [::]:80;
    server_name ${CANONICAL_HOST} ${REDIRECT_HOSTS};
    return 301 https://${CANONICAL_HOST}\$request_uri;
}

# HTTPS aliases → canonical
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${REDIRECT_HOSTS};

    ssl_certificate     ${CLOUDFLARE_CERT};
    ssl_certificate_key ${CLOUDFLARE_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;

    return 301 https://${CANONICAL_HOST}\$request_uri;
}

# HTTPS canonical — the actual site
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${CANONICAL_HOST};

    ssl_certificate     ${CLOUDFLARE_CERT};
    ssl_certificate_key ${CLOUDFLARE_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    root ${REMOTE_WEB};
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json image/svg+xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp4)\$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # Early-bird email API (systemd: ${API_SERVICE})
    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    # HTML is not fingerprinted — always revalidate so fixes ship immediately
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control \"no-cache\";
    }

    add_header X-Frame-Options          \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options   \"nosniff\"    always;
    add_header X-XSS-Protection         \"1; mode=block\" always;
    add_header Referrer-Policy          \"strict-origin-when-cross-origin\" always;
    add_header Permissions-Policy       \"interest-cohort=()\" always;
}
NGINX_EOF"
else
  ssh "${SERVER}" "cat > /etc/nginx/sites-available/${CANONICAL_HOST} <<'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ${REDIRECT_HOSTS};
    return 301 http://${CANONICAL_HOST}\$request_uri;
}
server {
    listen 80;
    listen [::]:80;
    server_name ${CANONICAL_HOST};

    root ${REMOTE_WEB};
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json image/svg+xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp4)\$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # Early-bird email API (systemd: ${API_SERVICE})
    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    add_header X-Frame-Options        \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\"    always;
    add_header Referrer-Policy        \"strict-origin-when-cross-origin\" always;
}
NGINX_EOF"
fi

ssh "${SERVER}" "ln -sf /etc/nginx/sites-available/${CANONICAL_HOST} /etc/nginx/sites-enabled/${CANONICAL_HOST}"

# ── 6. Validate and reload nginx ──────────────────────────────────────────
step "Validating nginx config…"
ssh "${SERVER}" "nginx -t" || die "nginx -t failed — vhost not reloaded"
ssh "${SERVER}" "systemctl reload nginx"
ok "Nginx reloaded"

# ── 7. Verify ─────────────────────────────────────────────────────────────
step "Smoke-testing over loopback…"
if [ "${HAS_CERT}" -eq 1 ]; then
  HEAD=$(ssh "${SERVER}" "curl -skI --resolve ${CANONICAL_HOST}:443:127.0.0.1 https://${CANONICAL_HOST}/")
else
  HEAD=$(ssh "${SERVER}" "curl -sI -H 'Host: ${CANONICAL_HOST}' http://127.0.0.1/")
fi
echo "${HEAD}" | head -1 | grep -qE 'HTTP/[0-9.]+ (200|301)' \
  && ok "Loopback: $(echo "${HEAD}" | head -1 | tr -d '\r')" \
  || warn "Unexpected loopback response: $(echo "${HEAD}" | head -1 | tr -d '\r')"

# ── 7b. Verify email collection end to end ────────────────────────────────
if [ "${DO_API}" -eq 1 ]; then
  step "Testing email collection through nginx…"
  HEALTH=$(ssh "${SERVER}" "curl -sf http://127.0.0.1:${API_PORT}/api/health" || true)
  echo "${HEALTH}" | grep -q '"ok"' && ok "API health: ${HEALTH}" || die "API health check failed"

  PROBE="deploy-probe-$(date +%s)@ironpal.co"
  RESULT=$(ssh "${SERVER}" "curl -sf -k --resolve ${CANONICAL_HOST}:443:127.0.0.1 -X POST https://${CANONICAL_HOST}/api/collect-email -H 'Content-Type: application/json' -d '{\"email\":\"${PROBE}\",\"source\":\"landing_page\"}'" || true)
  echo "${RESULT}" | grep -q 'collected successfully' \
    && ok "Email collection working end to end (nginx → API → SQLite)" \
    || die "Email collection FAILED through nginx: ${RESULT}"

  # The probe is a real row; drop it so the list stays clean.
  ssh "${SERVER}" "cd ${REMOTE_API} && node -e \"const D=require('better-sqlite3');const d=new D('server/emails.db');d.prepare('DELETE FROM emails WHERE email=?').run('${PROBE}');d.close()\"" 2>/dev/null \
    && ok "Probe row removed" || warn "Could not remove probe row ${PROBE}"
fi

echo ""
ok "Deployment complete!"
echo -e "${GREEN}🌐 https://${CANONICAL_HOST}${NC}"
[ "${HAS_CERT}" -eq 1 ] && echo -e "${GREEN}🔁 https://www.${CANONICAL_HOST} → https://${CANONICAL_HOST}${NC}"
[ "${DO_API}" -eq 1 ] && echo -e "${GREEN}📧 Emails:   ssh ${SERVER} \"cd ${REMOTE_API} && node server/dump-emails.js\"${NC}"
