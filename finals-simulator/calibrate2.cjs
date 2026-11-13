// Full calibration on the real matches (replayed with the models of both players).
// 1) raking: per-player, per-play correctors (play frequency, hot/neutral/cold outcomes), forehand corrector on the third shot,
//    corrector by shot number and serve (how points end by shot number);
// 2) grid search over k (control-state strength) and advantage persistence, redoing the raking for each pair.
// Usage: node calibrate2.cjs <model with all players> <output calib.json>
const fs = require('fs');
const E = require('./engine.js');
const V = require('./vallib.cjs');
const RS0 = require('./data/real_stats.json');
// HOLDOUT: matches excluded from the calibration (out-of-sample validation)
const HOLD = new Set((process.env.HOLDOUT || '').split(',').filter(Boolean).map(Number));
const RS = { matches: RS0.matches.filter(m => !HOLD.has(m.id)) };
const M = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3] || 'calib.json', DEF = process.env.DEF || 'alt'; // definition of points in attack used as target
const XERR = .92, XWIN = .92; E.setExtreme(XERR, XWIN); // game cap: a ball in play never has a certain outcome
const ids = Object.keys(M.players), T = new Set(M.target);
const real = V.sumReal(RS);
const GROUPS = { hot: ['winner', 'in_attack', 'opponent_error'], neutral: ['neutral'], cold: ['error', 'fe', 'in_defence', 'opponent_winner'] };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// how points end by shot number, real (summed over all matches), per 100 serves in play
const CELLS = []; for (const sn of ['1', '2']) for (const n of [3, 4, 5, 6, 7]) for (const c of ['W', 'UE', 'FE', 'XW', 'XE']) CELLS.push({ sn, n, c, who: n % 2 ? 'srv' : 'rcv' });
const cellKey = (sn, n, who, c) => `${sn}|${n >= 9 ? '9+' : n}|${who}|${c}`;
function endTable(statsByPlayer, div = 1) {
  const t = {}, inCourt = { 1: 0, 2: 0 };
  for (const s of Object.values(statsByPlayer)) {
    inCourt[1] += s.firstIn / div; inCourt[2] += (s.second - s.dfs) / div;
    for (const C of CELLS) { const ks = C.n === 7 ? ['7', '8', '9+'].map(x => `${C.sn}|${x}|`) : [`${C.sn}|${C.n}|`]; let v = 0; for (const k of ks) for (const who of ['srv', 'rcv']) v += (s.endIdx?.[`${k}${who}|${C.c}`] || 0); t[`${C.sn}|${C.n}|${C.c}`] = (t[`${C.sn}|${C.n}|${C.c}`] || 0) + v / div; }
  }
  for (const k in t) t[k] /= inCourt[k[0]];
  return t;
}
const realEnd = endTable(real);
// class corrected for each cell: W/UE/FE on shot n; XW/XE on shot n-1 (the "opponent_winner"/"opponent_error" shot that sets them up)
const CLS = { W: 'winner', UE: 'error', FE: 'fe', XW: 'opponent_winner', XE: 'opponent_error' };

function rake(k, persist, iters, rep, shotMod, log = false) {
  for (let it = 0; it < iters; it++) {
    E.setShotMod(shotMod);
    const sim = V.simulate(M, RS, { k, persist, rep, seed: 11 + it });
    // corrector by shot number (global)
    const se = endTable(sim, rep);
    let dev = 0;
    for (const C of CELLS) { const key = `${C.sn}|${C.n}|${C.c}`, r = realEnd[key], s = se[key]; if (!s || !r) continue; const nn = C.c[0] === 'X' ? C.n - 1 : C.n; if (nn < 3) continue; const m = (shotMod[`${nn}|${C.sn}`] ??= {}); m[CLS[C.c]] = clamp((m[CLS[C.c]] || 1) * (r / s) ** .8, .2, 5); dev += Math.abs(r - s) * 100; }
    // per player
    let devP = 0;
    for (const id of ids) {
      const pm = M.players[id], s = sim[id]; if (!s) continue;
      const tot = Object.values(s.plays).reduce((a, c) => a + c.n, 0), uTot = Object.values(pm.plays).reduce((a, p) => a + p.usage, 0);
      pm.playMult ??= {};
      for (const [pl, P] of Object.entries(pm.plays)) {
        const c = s.plays[pl]; const n = c?.n || 0, target = P.usage / uTot, simShare = n / tot;
        if (n >= 5) { const w = n / (n + 40); pm.playMult[pl] = clamp((pm.playMult[pl] || 1) * (target / simShare) ** (.8 * w), .1, 10); }
        // hot/neutral/cold outcomes on the "normal" shots
        const g = { hot: 0, neutral: 0, cold: 0 }; for (const [G, cl] of Object.entries(GROUPS)) for (const x of cl) g[G] += c?.[x] || 0;
        const nn = g.hot + g.neutral + g.cold; if (nn < 20) continue;
        P.corr ??= { hot: 1, neutral: 1, cold: 1 };
        const w = nn / (nn + 60);
        for (const G of ['hot', 'neutral', 'cold']) { const sh = (g[G] + .5) / (nn + 1.5); P.corr[G] = clamp(P.corr[G] * (P.vol[G] / sh) ** (.8 * w), .2, 5); if (T.has(id)) devP += Math.abs(P.vol[G] - sh) * nn; }
      }
      // forehand on the server's third shot: target = real share blended with the simulated one (10 observations)
      const r3 = pm.real3rd; pm.thirdFH ??= { deuce: 1, ad: 1 };
      for (const side of ['deuce', 'ad']) {
        const sf = s.s1[side].fh, sb = s.s1[side].bh, ns = sf + sb, nr = r3[side].fh + r3[side].bh; if (ns < 20) continue;
        const simP = (sf + .5) / (ns + 1), target = (r3[side].fh + 10 * simP) / (nr + 10);
        const odds = p => p / (1 - p);
        pm.thirdFH[side] = clamp(pm.thirdFH[side] * (odds(target) / odds(simP)) ** .8, .1, 10);
      }
    }
    if (log) console.log(`  raking ${it + 1}: point-ending gap ${dev.toFixed(1)} per 100 points | outcome gap (8 players) ${devP.toFixed(0)} shots`);
  }
  return shotMod;
}

// loss function: standardized gaps on phase, serve and rally statistics, for the 8 players
const r = (a, b) => a / b;
function loss(sim, rep, detail = false) {
  let L = 0; const rows = [];
  const term = (name, ps, pr, n) => { const se2 = Math.max(pr * (1 - pr), .01) / n; const z2 = (ps - pr) ** 2 / se2; L += z2; rows.push([name, ps, pr, z2]); };
  for (const id of T) {
    const s = sim[id], q = real[id], nm = M.players[id].name.split(' ').at(-1);
    const A2 = DEF === 'alt' ? '2' : '';
    term(`${nm} conversion`, r(s['conv' + A2], s['convDen' + A2]), r(q.conv, q.convDen), q.convDen);
    term(`${nm} steal`, r(s['steal' + A2], s['stealDen' + A2]), r(q.steal, q.stealDen), q.stealDen);
    term(`${nm} points with an advantage`, r(s['convDen' + A2], s.pts), r(q.convDen, q.pts), q.pts);
    term(`${nm} shots in attack`, r(s.attShots, s.rallyShots), q.bopSum / q.bopN / 100, q.rallyShots || 1000);
    term(`${nm} serve points won`, r(s.serveWon, s.servePts), r(q.serveWon, q.servePts), q.servePts);
    term(`${nm} return points won`, r(s.retWon, s.retPts), r(q.retWon, q.retPts), q.retPts);
    for (const b of ['b04', 'b58', 'b9']) term(`${nm} rally share ${b}`, r(s[b], s.rlN), r(q[b], q.rlN), q.rlN);
  }
  return detail ? { L, rows } : L;
}

const t0 = Date.now(), res = [];
const save = () => Object.fromEntries(ids.map(id => [id, { playMult: { ...M.players[id].playMult }, thirdFH: { ...M.players[id].thirdFH }, corr: Object.fromEntries(Object.entries(M.players[id].plays).map(([pl, P]) => [pl, P.corr ? { ...P.corr } : null])) }]));
const load = st => { for (const id of ids) { const pm = M.players[id]; pm.playMult = { ...st[id].playMult }; pm.thirdFH = { ...st[id].thirdFH }; for (const [pl, P] of Object.entries(pm.plays)) P.corr = st[id].corr[pl] ? { ...st[id].corr[pl] } : undefined; } };
if (process.env.FIXED) { // raking only, with given k and persistence
  const [k, persist] = process.env.FIXED.split(',').map(Number), sm = rake(k, persist, 8, 4, {}, false);
  const out = { k, persist, xErr: XERR, xWin: XWIN, shotMod: sm, players: {} };
  for (const id of ids) { const pm = M.players[id]; out.players[id] = { thirdFH: pm.thirdFH, playMult: pm.playMult, corr: Object.fromEntries(Object.entries(pm.plays).filter(([, P]) => P.corr).map(([pl, P]) => [pl, P.corr])) }; }
  fs.writeFileSync(OUT, JSON.stringify(out)); process.exit(0);
}
// start: raking with intermediate values
let shotMod = rake(.3, .7, 8, 4, {}, true);
const start = save(), startMod = JSON.parse(JSON.stringify(shotMod));
for (const k of (process.env.KS || '.1,.2,.3,.4,.5').split(',').map(Number)) for (const persist of (process.env.PS || '.6,.7,.8').split(',').map(Number)) {
  load(start); const sm = rake(k, persist, 4, 4, JSON.parse(JSON.stringify(startMod)));
  const RE = +(process.env.REP_EVAL || 6);
  E.setShotMod(sm); const sim = V.simulate(M, RS, { k, persist, rep: RE, seed: 99 });
  const L = loss(sim, RE); res.push({ k, persist, L, st: save(), sm });
  console.log(`k ${k} persistence ${persist}: loss ${L.toFixed(1)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
res.sort((a, b) => a.L - b.L);
const best = res[0];
console.log(`\nBest: k ${best.k}, persistence ${best.persist}`);
// refinement: longer raking on the best pair
load(best.st); shotMod = rake(best.k, best.persist, 6, 8, best.sm, true);
E.setShotMod(shotMod);
const sim = V.simulate(M, RS, { k: best.k, persist: best.persist, rep: 10, seed: 5 });
const d = loss(sim, 10, true);
console.log(`final loss ${d.L.toFixed(1)} over ${d.rows.length} terms`);
for (const [n, ps, pr, z2] of d.rows) console.log(`${n.padEnd(40)} sim ${ps.toFixed(3)} real ${pr.toFixed(3)} z ${Math.sign(ps - pr) * Math.sqrt(z2) >= 0 ? '+' : ''}${(Math.sign(ps - pr) * Math.sqrt(z2)).toFixed(1)}`);
const out = { k: best.k, persist: best.persist, xErr: XERR, xWin: XWIN, shotMod, grid: res.map(x => ({ k: x.k, persist: x.persist, L: +x.L.toFixed(1) })), players: {} };
for (const id of ids) { const pm = M.players[id]; out.players[id] = { thirdFH: pm.thirdFH, playMult: pm.playMult, corr: Object.fromEntries(Object.entries(pm.plays).filter(([, P]) => P.corr).map(([pl, P]) => [pl, P.corr])) }; }
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('written', OUT, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
