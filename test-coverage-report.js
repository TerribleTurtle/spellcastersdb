const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./coverage/coverage-final.json','utf8'));
const fileKey = Object.keys(d).find(k=>k.includes('useTeamEditor.ts'));
if(!fileKey) { console.log("Not found"); process.exit(1); }
const s = d[fileKey];
const bm = s.branchMap;
const b = s.b;
let missedCount = 0;
for(const k in b) {
  if(!b[k].every(c=>c>0)) {
    const i = bm[k];
    const missed = b[k].map((c,idx)=>c===0?idx:null).filter(x=>x!==null);
    console.log('Line ' + i.loc.start.line + ': ' + i.type + ' (missed branches: ' + missed.join(',') + ')');
    missedCount++;
  }
}
if(missedCount === 0) { console.log("All branches covered!"); }
