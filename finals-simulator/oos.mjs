// Out-of-sample validation of match statistics: model and calibration estimated without one fold of matches,
// then the held-out matches are replayed and compared with the real data (5 folds). Opponents: full (calibrated) model.
// Usage: FULL=<full model> CAL=<full calib> [SHRINK_PLAY=..] node oos.mjs <output file>
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const E = require('./engine.js'), V = require('./vallib.cjs');
const RS = JSON.parse(fs.readFileSync('data/real_stats.json', 'utf8'));
const files = fs.readdirSync('data/raw').filter(f => f.endsWith('.json.gz')).map(f => 'data/raw/' + f);
const TMP = process.env.TMPDIR_K || '/tmp', K = 5, ids = RS.matches.map(m => m.id);
const applyCal = (M, C) => { for (const [id, c] of Object.entries(C.players)) { const p = M.players[id]; if (!p) continue; p.thirdFH = c.thirdFH; p.playMult = c.playMult; for (const [pl, v] of Object.entries(c.corr || {})) if (p.plays[pl]) p.plays[pl].corr = v; } };
const FULL = JSON.parse(fs.readFileSync(process.env.FULL, 'utf8')), CF = JSON.parse(fs.readFileSync(process.env.CAL, 'utf8'));
applyCal(FULL, CF);
const T = new Set(FULL.target), simAll = {}, realAll = {};
const k = CF.k, persist = CF.persist;
for (let f = 0; f < K; f++) {
  const hold = ids.filter((_, i) => i % K === f), mo = `${TMP}/oos_m${f}.json`, co = `${TMP}/oos_c${f}.json`;
  execFileSync('node', ['build.mjs', ...files], { env: { ...process.env, HOLDOUT: hold.join(','), ALL: '1', OUT: mo } });
  execFileSync('node', ['calibrate2.cjs', mo, co], { env: { ...process.env, HOLDOUT: hold.join(','), FIXED: `${k},${persist}` } });
  const Mt = JSON.parse(fs.readFileSync(mo, 'utf8')); applyCal(Mt, JSON.parse(fs.readFileSync(co, 'utf8')));
  // players: the 8 from the model without the fold, the opponents from the full model
  const Mx = { players: { ...FULL.players }, target: FULL.target };
  for (const id of T) if (Mt.players[id]) Mx.players[id] = Mt.players[id];
  E.setExtreme(CF.xErr, CF.xWin); E.setShotMod(JSON.parse(fs.readFileSync(co, 'utf8')).shotMod);
  const RSf = { matches: RS.matches.filter(m => hold.includes(m.id)) };
  const sim = V.simulate(Mx, RSf, { k, persist, rep: 10, seed: 3 + f, only: T });
  const real = V.sumReal(RSf, T);
  for (const id of T) {
    if (!sim[id]) continue;
    (simAll[id] ??= []).push(sim[id]); (realAll[id] ??= []).push(real[id]);
  }
  console.error(`fold ${f + 1}/${K} done`);
}
fs.writeFileSync(process.argv[2], JSON.stringify({ simAll, realAll, k, persist }));
