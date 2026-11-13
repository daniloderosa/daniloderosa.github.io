// Cross-validation of the opponent correctors (defensive index and return index), pseudo-counts cDef and cRet.
// For each fold: the player's indices are estimated without the fold's matches; we measure how well they explain the shots
// and serves of the player's opponents in the held-out matches (opponent model: full estimate).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const RS = JSON.parse(fs.readFileSync('data/real_stats.json', 'utf8'));
const files = fs.readdirSync('data/raw').filter(f => f.endsWith('.json.gz')).map(f => 'data/raw/' + f);
const TMP = process.env.TMPDIR_K || '/tmp', K = 5, ids = RS.matches.map(m => m.id);
const full = `${TMP}/kf_full.json`;
execFileSync('node', ['build.mjs', ...files], { env: { ...process.env, ALL: '1', OUT: full } });
const F = JSON.parse(fs.readFileSync(full, 'utf8'));
const G = { winner: 'hot', in_attack: 'hot', opponent_error: 'hot', neutral: 'neutral', error: 'cold', fe: 'cold', in_defence: 'cold', opponent_winner: 'cold' };
const folds = [];
for (let f = 0; f < K; f++) { const hold = ids.filter((_, i) => i % K === f), out = `${TMP}/kf_${f}.json`; execFileSync('node', ['build.mjs', ...files], { env: { ...process.env, HOLDOUT: hold.join(','), ALL: '1', OUT: out } }); folds.push({ hold, mod: JSON.parse(fs.readFileSync(out, 'utf8')) }); }
const lg = Math.log;
for (const c of [0, 10, 30, 100, 300, 1000, 1e9]) {
  let Ld = 0, Lr = 0;
  for (const { hold, mod } of folds) for (const m of RS.matches.filter(x => hold.includes(x.id))) m.players.forEach((pid, i) => {
    const me = mod.players[String(pid)]; if (!me || !mod.target.includes(String(pid))) return;
    const D = me.defRaw, R = me.retRaw, dh = (D.hotObs + c) / (D.hotExp + c), dc = (D.coldObs + c) / (D.coldExp + c), ri = (R.obs + c) / (R.exp + c);
    const opp = F.players[String(m.players[1 - i])], so = m.stats[1 - i]; if (!opp) return;
    for (const [pl, cnt] of Object.entries(so.plays)) {
      const P = opp.plays[pl]; if (!P) continue;
      const h = P.vol.hot * dh, n = P.vol.neutral, cl = P.vol.cold * dc, t = h + n + cl, g = { hot: 0, neutral: 0, cold: 0 };
      for (const [k, x] of Object.entries(cnt)) if (G[k]) g[G[k]] += x;
      Ld += g.hot * lg(h / t) + g.neutral * lg(n / t) + g.cold * lg(cl / t);
    }
    for (const sn of ['1', '2']) {
      const e = opp.serve[sn].eff, tot = Object.entries(e).filter(([b]) => b !== 'double_faults').reduce((a, [, v]) => a + v, 0);
      const pU = Math.min(.9, (e.aces + e.unreturned) / tot * ri), s = so['se' + sn];
      const u = (s.aces || 0) + (s.unreturned || 0), rest = Object.entries(s).filter(([b]) => !['aces', 'unreturned', 'double_faults'].includes(b)).reduce((a, [, v]) => a + v, 0);
      Lr += u * lg(pU) + rest * lg(1 - pU);
    }
  });
  console.log(`pseudo-count ${c >= 1e9 ? 'infinite (index = 1)' : c}: defensive index ${Ld.toFixed(1)} | return index ${Lr.toFixed(1)}`);
}
