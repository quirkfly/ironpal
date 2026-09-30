// IronPal early-bird email collection API.
//
// Same shape as ../handlr/handlr-web/server/index.js and the trolless one beside it on the same
// droplet — Express + better-sqlite3, one systemd unit, nginx proxies /api/ to it. Three
// deliberate differences:
//
//   * PORT 3003. 3001 is handlr-api, 3002 is trolless-api.
//   * The list is IronPal's own DB. Sharing handlr's would mix two products' subscribers.
//   * It stores `source`, not `platform`. The landing page posts { email, source } and there are
//     two forms on it (hero and footer CTA) — knowing which one converts is the only analytic
//     this page has.
import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.API_PORT || 3003;

app.use(express.json({ limit: '4kb' }));

const dbPath = join(__dirname, 'emails.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS emails (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,
    source     TEXT NOT NULL DEFAULT 'landing_page',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertEmail = db.prepare('INSERT INTO emails (email, source) VALUES (?, ?)');
const findEmail = db.prepare('SELECT id FROM emails WHERE email = ?');
const countEmails = db.prepare('SELECT COUNT(*) AS n FROM emails');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SOURCES = ['landing_page', 'landing_page_footer'];

// Crude per-IP throttle. The page is public and the endpoint writes to disk; without this a
// single script can fill the table. In-memory is fine — a restart losing the window costs nothing.
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
function throttled(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  rec.n += 1;
  return rec.n > MAX_PER_WINDOW;
}

app.post('/api/collect-email', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '?';
  if (throttled(ip)) return res.status(429).json({ error: 'Too many requests.' });

  const { email, source } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !EMAIL_RE.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  const normalizedSource = VALID_SOURCES.includes(source) ? source : 'landing_page';

  try {
    if (findEmail.get(normalizedEmail)) {
      // Not an error to the visitor: reserving twice should still say "you're in".
      return res.status(200).json({ message: 'Email already registered.', duplicate: true });
    }
    insertEmail.run(normalizedEmail, normalizedSource);
    console.log(`[email-collect] New email: ${normalizedEmail} (${normalizedSource})`);
    return res.status(201).json({ message: 'Email collected successfully.' });
  } catch (err) {
    console.error('[email-collect] Error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Count only — the address list is not exposed over HTTP. Read it on the box with dump-emails.js.
app.get('/api/health', (_req, res) => {
  try {
    res.json({ status: 'ok', emails: countEmails.get().n });
  } catch {
    res.status(500).json({ status: 'error' });
  }
});

process.on('SIGINT', () => { db.close(); process.exit(0); });
process.on('SIGTERM', () => { db.close(); process.exit(0); });

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[email-api] IronPal API on http://127.0.0.1:${PORT}`);
  console.log(`[email-api] Database: ${dbPath}`);
});
