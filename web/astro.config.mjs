import { defineConfig } from 'astro/config';

// Pure static build — no SSR adapter, no JS framework integration.
// Output is plain HTML + CSS + a little vanilla JS, so the site drops onto
// any static host (Cloudflare Pages, Netlify, GitHub Pages, S3).
// Stack mirrors ../gitnfit/gitnfit-landing-page.
export default defineConfig({
  site: 'https://ironpal.co',
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
});
