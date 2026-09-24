// Prints every JS chunk in dist/ with its gzip size and fails on any chunk
// over the budget. Run after `npm run build`:  node scripts/bundle-report.mjs
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 200;
const dir = 'frontend/dist/assets';

const files = (await readdir(dir)).filter((file) => file.endsWith('.js'));
const rows = [];
for (const file of files) {
  const bytes = await readFile(path.join(dir, file));
  rows.push({ file, raw: bytes.length, gzip: gzipSync(bytes).length });
}
rows.sort((a, b) => b.gzip - a.gzip);

const kb = (n) => (n / 1024).toFixed(1).padStart(7);
console.log(`${'chunk'.padEnd(44)} ${'raw KB'.padStart(7)} ${'gzip KB'.padStart(7)}`);
for (const row of rows) {
  const flag = row.gzip > BUDGET_KB * 1024 ? '  <-- over budget' : '';
  console.log(`${row.file.padEnd(44)} ${kb(row.raw)} ${kb(row.gzip)}${flag}`);
}
const total = rows.reduce((sum, row) => sum + row.gzip, 0);
console.log(`${'total'.padEnd(44)} ${''.padStart(7)} ${kb(total)}`);

const over = rows.filter((row) => row.gzip > BUDGET_KB * 1024);
if (over.length > 0) {
  console.error(`\n${String(over.length)} chunk(s) over ${String(BUDGET_KB)} KB gzip.`);
  process.exit(1);
}
