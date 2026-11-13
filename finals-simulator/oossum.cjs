// Out-of-sample summary: sums the folds and compares the metrics (simulated / real)
const fs = require('fs'), V = require('./vallib.cjs');
const add = (a, b) => { for (const [k, v] of Object.entries(b)) { if (typeof v === 'number') a[k] = (a[k] || 0) + v; else if (v && typeof v === 'object') add((a[k] ??= {}), v); } return a; };
const KEYS = ['serve points won', 'return points won', '1st serve points won', '2nd serve points won', '1st serve in', 'aces / serve point', 'double faults / serve point', 'returns in play, 1st', 'returns in play, 2nd',
  'mean rally length', 'rally share b04', 'rally share b58', 'rally share b9', 'rally winners /100', 'rally unforced /100', 'rally forced /100', 'conversion', 'steal', 'shots in attack', 'mix volleys', 'mix drop_shots', 'third shot forehand deuce', 'third shot forehand ad'];
const out = {};
for (const f of process.argv.slice(2)) {
  const R = JSON.parse(fs.readFileSync(f, 'utf8')); let sq = {}, tot = { s: {}, r: {} };
  for (const id of Object.keys(R.simAll)) {
    const s = R.simAll[id].reduce((a, b) => add(a, b), {}), r = R.realAll[id].reduce((a, b) => add(a, b), {});
    for (const k of ['se1', 'se2', 'plays', 's1', 'post']) { s[k] ??= {}; r[k] ??= {}; }
    s.s1.deuce ??= { fh: 0, bh: 0 }; s.s1.ad ??= { fh: 0, bh: 0 }; r.s1.deuce ??= { fh: 0, bh: 0 }; r.s1.ad ??= { fh: 0, bh: 0 };
    const ms = V.metrics(s), mr = V.metrics(r, true);
    // with the alternative definition of points in attack
    ms.conversion = ms['conversion (alt. definition)']; ms.steal = ms['steal (alt. definition)'];
    for (const k of KEYS) { (sq[k] ??= []).push(ms[k] - mr[k]); }
  }
  out[f] = sq;
}
const files = Object.keys(out);
console.log('Out-of-sample mean absolute error (sim - real) over the 8 players:');
console.log(''.padEnd(32) + files.map(f => f.split('/').at(-1).padStart(14)).join(''));
for (const k of KEYS) console.log(k.padEnd(32) + files.map(f => (out[f][k].reduce((a, b) => a + Math.abs(b), 0) / out[f][k].length).toFixed(3).padStart(14)).join('') + '   (mean signed: ' + files.map(f => (out[f][k].reduce((a, b) => a + b, 0) / out[f][k].length).toFixed(3)).join(' / ') + ')');
