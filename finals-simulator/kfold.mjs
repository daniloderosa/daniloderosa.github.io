// Shrinkage weights chosen by 5-fold cross-validation: the model is estimated without the matches of one fold
// and the log-likelihood of those matches' data is measured (the 8 players only), per parameter group.
// Usage: MS=3,10,30 [VARY=SHRINK_DIR] [FIX="SHRINK_PLAY=320"] node kfold.mjs
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const RS = JSON.parse(fs.readFileSync('data/real_stats.json', 'utf8'));
const files = fs.readdirSync('data/raw').filter(f => f.endsWith('.json.gz')).map(f => 'data/raw/' + f);
const TMP = process.env.TMPDIR_K || '/tmp', VARY = process.env.VARY || 'SHRINK';
const FIX = Object.fromEntries((process.env.FIX || '').split(';').filter(Boolean).map(x => x.split('=')));
const Ms = (process.env.MS || '3,10,30,100,300,1000').split(',').map(Number);
const ids = RS.matches.map(m => m.id), K = 5;
const GROUP = { winner: 'hot', in_attack: 'hot', opponent_error: 'hot', neutral: 'neutral', error: 'cold', fe: 'cold', in_defence: 'cold', opponent_winner: 'cold' };
const lg = Math.log;
for (const M of Ms) {
  const L = { outcomes: 0, frequency: 0, serve: 0, direction: 0, return: 0 };
  for (let f = 0; f < K; f++) {
    const hold = ids.filter((_, i) => i % K === f), out = `${TMP}/kf_${f}.json`;
    execFileSync('node', ['build.mjs', ...files], { env: { ...process.env, ...FIX, [VARY]: String(M), HOLDOUT: hold.join(','), ALL: '1', OUT: out } });
    const mod = JSON.parse(fs.readFileSync(out, 'utf8')), T = new Set(mod.target);
    for (const m of RS.matches.filter(x => hold.includes(x.id))) m.players.forEach((pid, i) => {
      const pm = mod.players[String(pid)]; if (!pm || !T.has(String(pid))) return;
      const s = m.stats[i], uTot = Object.values(pm.plays).reduce((a, p) => a + p.usage, 0);
      for (const [pl, c] of Object.entries(s.plays)) {
        const P = pm.plays[pl]; if (!P) continue;
        L.frequency += c.n * lg(P.usage / uTot);
        for (const [cl, x] of Object.entries(c)) { if (!GROUP[cl]) continue; const g = GROUP[cl]; L.outcomes += x * lg(g === 'neutral' ? P.vol.neutral : P.vol[g] * P.outs[g][cl]); }
        for (const [z, c2] of Object.entries(s.dir?.[pl] || {})) { const v = P.dir?.[z]?.vol || P.vol; for (const g of ['hot', 'neutral', 'cold']) L.direction += c2[g] * lg(v[g]); }
      }
      for (const sn of ['1', '2']) {
        const S = pm.serve[sn], p = S.pIn;
        L.serve += sn === '1' ? s.firstIn * lg(p) + (s.first - s.firstIn) * lg(1 - p) : (s.second - s.dfs) * lg(p) + s.dfs * lg(1 - p);
        const eff = S.eff, tot = Object.entries(eff).filter(([b]) => b !== 'double_faults').reduce((a, [, v]) => a + v, 0);
        for (const [b, x] of Object.entries(s['se' + sn])) if (b !== 'double_faults' && eff[b]) L.serve += x * lg(eff[b] / tot);
      }
      for (const side of ['deuce', 'ad']) for (const [z, c] of Object.entries(s.retDir?.[side] || {})) {
        const d = pm.ret[side].dirs[z], n = c.won + c.lost + c.err;
        L.return += n * lg(d.usage) + c.err * lg(d.err) + (c.won + c.lost) * lg(1 - d.err) + c.won * lg(d.win) + c.lost * lg(1 - d.win);
      }
    });
  }
  console.log(`${VARY}=${String(M).padStart(4)} | ` + Object.entries(L).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(' | '));
}
