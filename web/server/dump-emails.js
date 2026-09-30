#!/usr/bin/env node
// Read the IronPal early-bird list off the server:
//   ssh root@45.55.36.33 "cd /opt/ironpal-api && node server/dump-emails.js"
//   ssh root@45.55.36.33 "cd /opt/ironpal-api && node server/dump-emails.js --csv" > emails.csv
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dbPath = join(dirname(fileURLToPath(import.meta.url)), 'emails.db');
const csv = process.argv.includes('--csv');

try {
  const db = new Database(dbPath, { readonly: true });
  const rows = db.prepare('SELECT id, email, source, created_at FROM emails ORDER BY created_at DESC').all();
  db.close();

  if (csv) {
    console.log('id,email,source,created_at');
    for (const r of rows) console.log(`${r.id},${r.email},${r.source},${r.created_at}`);
    process.exit(0);
  }

  if (rows.length === 0) {
    console.log('No emails collected yet.');
    process.exit(0);
  }

  const bySource = rows.reduce((a, r) => ({ ...a, [r.source]: (a[r.source] || 0) + 1 }), {});
  console.log(`\n  IronPal early-bird list: ${rows.length}`);
  console.log(`  ${Object.entries(bySource).map(([s, n]) => `${s}: ${n}`).join('  ·  ')}\n`);
  console.log('  ID   | Email                                  | Source               | Date');
  console.log('  ' + '-'.repeat(96));
  for (const r of rows) {
    console.log(`  ${String(r.id).padEnd(4)} | ${r.email.padEnd(38)} | ${(r.source || '').padEnd(20)} | ${r.created_at}`);
  }
  console.log();
} catch (err) {
  if (err.code === 'SQLITE_CANTOPEN') console.error(`Database not found: ${dbPath}`);
  else console.error('Error:', err.message);
  process.exit(1);
}
