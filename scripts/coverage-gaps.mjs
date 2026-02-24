import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./coverage/coverage-final.json', 'utf8'));
const rows = [];

for (const [file, val] of Object.entries(data)) {
  const stmts = Object.values(val.s);
  const total = stmts.length;
  const hit = stmts.filter(x => x > 0).length;
  const pct = total ? Math.round(hit / total * 100) : 100;
  const rel = file.replace(/.*src[/\\]/, 'src/');
  if (pct < 50) rows.push({ pct, file: rel });
}

rows.sort((a, b) => a.pct - b.pct);
rows.forEach(r => console.log(`${String(r.pct).padStart(3)}%  ${r.file}`));
console.log(`\nTotal files under 50%: ${rows.length}`);
