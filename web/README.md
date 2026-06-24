# IronPal landing page (`web/`)

Pre-launch, email-capture landing page for IronPal. Built with **Astro**
(static, zero-framework) — stack mirrors `../gitnfit/gitnfit-landing-page`.
Implements [`docs/ironpal-landing-page-plan.md`](../docs/ironpal-landing-page-plan.md).

## Stack
- **Astro 4** — component-based, pure static output (HTML + CSS + a little vanilla JS)
- Self-hosted variable fonts via `@fontsource-variable/{inter,montserrat}`
- No SSR, no React/Vue runtime — drops onto any static host

## Develop
```bash
cd web
npm install
npm run dev        # http://localhost:4321
```

## Build / preview
```bash
npm run build      # → dist/  (static)
npm run preview
```

## Structure
```
src/
  layouts/Page.astro      # <head>, OG/Twitter meta, global nav+reveal+email script
  styles/tokens.css       # Stealth Teal design tokens (docs/color-schemes.md)
  styles/global.css       # fonts, reset, shared classes (.btn .capture .reveal …)
  components/             # one .astro per section (Hero, FeatureRows, …)
  pages/index.astro       # assembles the page
public/assets/            # product stills, athlete shots (S2–S7), reveal.mp4
```

## Wire up email capture
Forms validate + confirm client-side but don't send anywhere yet. In
`src/layouts/Page.astro` set `ESP_ENDPOINT` to a POST URL accepting
`{ email, source }` (free tier of MailerLite / Buttondown / ConvertKit),
or replace the `<form>` with the ESP's hosted embed.

## Deploy
`npm run build`, then publish `dist/` to a static host (Cloudflare Pages /
Netlify) and point `ironpal.co` at it.

## Follow-ups (from the plan / grilling)
- Swap the AI-generated marketing images for founder/photographed footage
  per `docs/founder-led-production-strategy.md` before the public campaign.
- Replace the HUD stand-in with the real UI-overlay loop.
- Confirm the discount % and cap before publishing.
- Add analytics (Plausible / Cloudflare Web Analytics) + signup conversion event.
