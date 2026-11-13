// Validation: replays the real matches with the models of both players and collects the same statistics as realstats.mjs.
const E = require('./engine.js');

const CLASSES = ['winner', 'in_attack', 'opponent_error', 'neutral', 'error', 'fe', 'in_defence', 'opponent_winner', 'x_err', 'x_win'];
const GROUP = { winner: 'hot', in_attack: 'hot', opponent_error: 'hot', neutral: 'neutral', error: 'cold', fe: 'cold', in_defence: 'cold', opponent_winner: 'cold' };
const WING = p => (p === 'volleys' ? 'vol' : p === 'drop_shots' ? 'drop' : p.startsWith('backhand') ? 'bh' : 'fh');
const DROP_FH = .65; // drop shots hit with the forehand (data: 65% of points ended by a drop shot), to compare with point_end

// Small seeded random generator: repeatable simulations
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const newStats = () => ({
  servePts: 0, serveWon: 0, first: 0, firstIn: 0, firstWon: 0, second: 0, secondWon: 0, aces: 0, dfs: 0,
  retPts: 0, retWon: 0, ret1: 0, ret1Won: 0, ret2: 0, ret2Won: 0, retIn1: 0, retInDen1: 0, retIn2: 0, retInDen2: 0,
  pts: 0, won: 0, rlSum: 0, rlN: 0, b04: 0, b04W: 0, b58: 0, b58W: 0, b9: 0, b9W: 0,
  fh_win: 0, bh_win: 0, vol_win: 0, ret_win: 0, fh_ue: 0, bh_ue: 0, vol_ue: 0, ret_ue: 0, fh_fe: 0, bh_fe: 0, vol_fe: 0, ret_fe: 0,
  ret_ue1: 0, ret_ue2: 0, ret_fe1: 0, ret_fe2: 0,
  netPts: 0, netWon: 0, drops: 0, rallyPts: 0, conv: 0, convDen: 0, steal: 0, stealDen: 0, attShots: 0, rallyShots: 0,
  se1: {}, se1Den: 0, se2: {}, se2Den: 0, plays: {}, s1: { deuce: { fh: 0, bh: 0 }, ad: { fh: 0, bh: 0 } },
  post: { ue: 0, fe: 0, win: 0 },
});
const BAND = L => (L <= 4 ? 'b04' : L <= 8 ? 'b58' : 'b9');

// Adds a simulated point to the statistics of the server (SA) and of the returner (SB)
function addPoint(SA, SB, p, side) {
  const inf = p.info, S = { A: SA, B: SB }, w = p.winner, sn = inf.sn;
  SA.servePts++; SB.retPts++; if (w === 'A') SA.serveWon++; else SB.retWon++;
  SA.first++;
  if (inf.df) { SA.dfs++; SA.second++; SB.ret2++; if (w === 'B') SB.ret2Won++; }
  else if (sn === '1') { SA.firstIn++; if (w === 'A') SA.firstWon++; SB.ret1++; if (w === 'B') SB.ret1Won++; }
  else { SA.second++; if (w === 'A') SA.secondWon++; SB.ret2++; if (w === 'B') SB.ret2Won++; }
  if (inf.ace) SA.aces++;
  if (!inf.df) { const k = sn === '1' ? '1' : '2'; SB['retInDen' + k]++; if (!inf.unret) SB['retIn' + k]++; }
  // serve effectiveness (same breakdown as serve_effectiveness)
  if (!inf.df) {
    const k = 'se' + sn, b = inf.ace ? 'aces' : inf.unret ? 'unreturned' : inf.rally ? inf.serverPhase : 'return_winners';
    SA[k][b] = (SA[k][b] || 0) + 1; SA[k + 'Den']++;
  } else { SA.se2.double_faults = (SA.se2.double_faults || 0) + 1; SA.se2Den++; } // the double fault counts in the second-serve denominator
  const L = inf.len;
  // how points end by shot number: key = serve|shot number|who ends|type (XW / XE: winner / error in an extreme phase)
  if (inf.end && inf.end.play !== 'return' && !inf.end.play.endsWith('_return')) { const lp = inf.log.at(-1)[2], xp = lp === 'xattack' || lp === 'xdefence', kind = xp ? (inf.end.type === 'W' ? 'XW' : 'XE') : inf.end.type, n = inf.end.type === 'W' ? L : L + 1, key = `${sn}|${n >= 9 ? '9+' : n}|${inf.end.by === 'A' ? 'srv' : 'rcv'}|${kind}`; SA.endIdx ??= {}; SA.endIdx[key] = (SA.endIdx[key] || 0) + 1; }
  if (L >= 3) { const b = 'sr' + sn + BAND(L); SA[b] = (SA[b] || 0) + 1; if (w === 'A') SA[b + 'W'] = (SA[b + 'W'] || 0) + 1; }
  const hotBy = { A: false, B: false }; for (const [who, , , , key] of inf.log) if (key === 'winner' || key === 'opponent_error' || key === 'in_attack') hotBy[who] = true;
  for (const who of ['A', 'B']) {
    const s = S[who], won = w === who;
    s.pts++; if (won) s.won++;
    if (L) { s.rlSum += L; s.rlN++; const b = BAND(L); s[b]++; if (won) s[b + 'W']++; if (L >= 3) s.rallyPts++; }
    if (inf.net[who]) { s.netPts++; if (won) s.netWon++; }
    if (p.track[who].att) { s.convDen++; if (won) s.conv++; }
    if (p.track[who].def) { s.stealDen++; if (won) s.steal++; }
    // alternative definition: also "in attack" whoever plays a positive shot (winner, forced error, shot that leads to attack)
    const oth = who === 'A' ? 'B' : 'A';
    if (p.track[who].att || hotBy[who]) { s.convDen2 = (s.convDen2 || 0) + 1; if (won) s.conv2 = (s.conv2 || 0) + 1; }
    if (p.track[who].def || hotBy[oth]) { s.stealDen2 = (s.stealDen2 || 0) + 1; if (won) s.steal2 = (s.steal2 || 0) + 1; }
    s.attShots += inf.att[who]; s.rallyShots += inf.shots[who];
    const ph = inf.ph[who]; s['ph_' + ph] = (s['ph_' + ph] || 0) + 1; if (!won) s['phL_' + ph] = (s['phL_' + ph] || 0) + 1;
  }
  if (inf.end) {
    const e = inf.end, s = S[e.by], kind = e.type === 'W' ? 'win' : e.type === 'UE' ? 'ue' : 'fe';
    const wing = e.play === 'return' || e.play.endsWith('_return') ? 'ret' : WING(e.play);
    s[wing + '_' + kind] = (s[wing + '_' + kind] || 0) + 1;
    if (wing === 'ret' && kind !== 'win') s['ret_' + kind + (sn === '2' ? 2 : 1)]++;
    if (wing !== 'ret' && kind !== 'win') { const ph = inf.ph[e.by] === 'xdefence' ? 'extreme_defence' : inf.ph[e.by]; s['errPh_' + kind + '_' + ph] = (s['errPh_' + kind + '_' + ph] || 0) + 1; }
  }
  // rally shots: class as in classify.mjs
  const n = inf.log.length;
  inf.log.forEach(([who, play, phase, t, key], i) => {
    const s = S[who], c = (s.plays[play] ??= { n: 0 }); c.n++;
    if (play === 'drop_shots') s.drops++;
    let cls;
    if (phase === 'xdefence' || phase === 'xattack') {
      cls = i === n - 1 && inf.end ? (inf.end.type === 'W' ? 'x_win' : 'x_err') : 'x_cont'; // x_cont: extreme-phase shot that does not end the point
      if (cls === 'x_err') s.post[inf.end.type === 'UE' ? 'ue' : 'fe']++; else if (cls === 'x_win') s.post.win++;
    } else cls = key ?? 'neutral';
    c[cls] = (c[cls] || 0) + 1;
  });
  if (p.third) { const f = p.third.startsWith('forehand') ? 'fh' : p.third.startsWith('backhand') ? 'bh' : null; if (f) SA.s1[side][f]++; }
}

// Simulates all the real matches: for each match, rep times each player's real serve points
function simulate(M, RS, { k, persist, rep = 3, seed = 1, only = null } = {}) {
  const rng = mulberry(seed), out = {}; // out[playerId] = statistics summed over the player's matches
  for (const m of RS.matches) {
    if (only && !m.players.some(id => only.has(String(id)))) continue;
    const [a, b] = m.players.map(String), PA = M.players[a], PB = M.players[b];
    if (!PA || !PB) continue;
    const SA = (out[a] ??= newStats()), SB = (out[b] ??= newStats());
    for (const [srv, rcv, Ss, Sr, nReal] of [[PA, PB, SA, SB, m.stats[0].servePts], [PB, PA, SB, SA, m.stats[1].servePts]]) {
      const n = Math.round(nReal * rep);
      for (let i = 0; i < n; i++) { const side = i % 2 ? 'ad' : 'deuce'; addPoint(Ss, Sr, E.simPoint(srv, rcv, side, k, rng, persist), side); }
    }
  }
  return out;
}

// Real statistics summed per player
function sumReal(RS, only = null) {
  const out = {};
  for (const m of RS.matches) m.players.map(String).forEach((id, i) => {
    if (only && !only.has(id)) return;
    const s = m.stats[i], o = (out[id] ??= { ...newStats(), bopSum: 0, bopN: 0, matches: 0 });
    o.matches++;
    for (const [key, v] of Object.entries(s)) {
      if (key === 'bop') { if (v != null) { o.bopSum += v; o.bopN++; } }
      else if (typeof v === 'number') o[key] = (o[key] || 0) + v;
      else if (key === 'se1' || key === 'se2') for (const [b, x] of Object.entries(v)) o[key][b] = (o[key][b] || 0) + x;
      else if (key === 'plays') for (const [pl, c] of Object.entries(v)) { const t = (o.plays[pl] ??= { n: 0 }); for (const [cl, x] of Object.entries(c)) t[cl] = (t[cl] || 0) + x; }
      else if (key === 's1') for (const sd of ['deuce', 'ad']) for (const f of ['fh', 'bh']) o.s1[sd][f] += v[sd][f];
      else if (key === 'post') for (const f of ['ue', 'fe', 'win']) o.post[f] += v[f] || 0;
      else if (key === 'endIdx') { o.endIdx ??= {}; for (const [b, x] of Object.entries(v)) o.endIdx[b] = (o.endIdx[b] || 0) + x; }
    }
  });
  return out;
}

// Comparable metrics (same definition for real and simulated)
function metrics(s, real = false) {
  const r = (a, b) => (b ? a / b : NaN), P = s.pts, m = {};
  m['1st serve in'] = r(s.firstIn, s.first);
  m['aces / serve point'] = r(s.aces, s.servePts);
  m['double faults / serve point'] = r(s.dfs, s.servePts);
  m['1st serve points won'] = r(s.firstWon, s.firstIn);
  m['2nd serve points won'] = r(s.secondWon, s.second);
  m['serve points won'] = r(s.serveWon, s.servePts);
  m['return points won'] = r(s.retWon, s.retPts);
  m['returns in play, 1st'] = r(s.retIn1, s.retInDen1);
  m['returns in play, 2nd'] = r(s.retIn2, s.retInDen2);
  for (const sn of ['1', '2']) {
    const d = s['se' + sn], den = Object.values(d).reduce((a, b) => a + b, 0);
    for (const b of ['aces', 'unreturned', 'attack', 'neutral', 'defence', 'return_winners', ...(sn === '2' ? ['double_faults'] : [])]) m[`serve ${sn}: ${b}`] = r(d[b] || 0, den);
  }
  for (const sn of ['1', '2']) for (const b of ['b04', 'b58', 'b9']) { m[`serve ${sn}, rally ${b}: share`] = r(s['sr' + sn + b] || 0, sn === '1' ? s.firstIn : s.second); m[`serve ${sn}, rally ${b}: won`] = r(s['sr' + sn + b + 'W'] || 0, s['sr' + sn + b] || 0); }
  m['mean rally length'] = r(s.rlSum, s.rlN);
  for (const b of ['b04', 'b58', 'b9']) { m[`rally share ${b}`] = r(s[b], s.rlN); m[`won in rallies ${b}`] = r(s[b + 'W'], s[b]); }
  const cnt = (w, k) => (s[`${w}_${k}`] || 0) + (w === 'fh' ? DROP_FH : w === 'bh' ? 1 - DROP_FH : 0) * (s[`drop_${k}`] || 0);
  for (const w of ['fh', 'bh', 'vol', 'ret']) for (const k of ['win', 'ue', 'fe']) m[`${w}_${k} /100 points`] = 100 * r(cnt(w, k), P);
  const sum = k => ['fh', 'bh', 'vol'].reduce((a, w) => a + cnt(w, k), 0);
  m['rally winners /100'] = 100 * r(sum('win'), P);
  m['rally unforced /100'] = 100 * r(sum('ue'), P);
  m['rally forced /100'] = 100 * r(sum('fe'), P);
  m['total winners /100 (with aces)'] = 100 * r(sum('win') + s.ret_win + s.aces, P);
  m['total unforced /100 (with returns and DFs)'] = 100 * r(sum('ue') + s.ret_ue + s.dfs, P);
  m['missed returns unforced, 1st'] = r(s.ret_ue1, s.ret_ue1 + s.ret_fe1);
  m['missed returns unforced, 2nd'] = r(s.ret_ue2, s.ret_ue2 + s.ret_fe2);
  m['conversion'] = r(s.conv, s.convDen);
  m['steal'] = r(s.steal, s.stealDen);
  m['points with an advantage / points'] = r(s.convDen, P);
  if (!real) { m['conversion (alt. definition)'] = r(s.conv2, s.convDen2); m['steal (alt. definition)'] = r(s.steal2, s.stealDen2); m['points with an advantage (alt. definition)'] = r(s.convDen2, P); }
  m['shots in attack'] = real ? r(s.bopSum, s.bopN) / 100 : r(s.attShots, s.rallyShots);
  for (const ph of ['none', 'defence', 'extreme_defence']) {
    const key = real ? ph : ph === 'extreme_defence' ? 'xdefence' : ph;
    m[`points in phase ${ph}`] = r(s['ph_' + key] || 0, P); m[`lost in phase ${ph}`] = r(s['phL_' + key] || 0, s['ph_' + key] || 0);
  }
  for (const k of ['ue', 'fe']) { const tot = ['none', 'defence', 'extreme_defence'].reduce((a, ph) => a + (s[`errPh_${k}_${ph}`] || 0), 0); for (const ph of ['none', 'defence', 'extreme_defence']) m[`${k} errors in phase ${ph}`] = r(s[`errPh_${k}_${ph}`] || 0, tot); }
  m['net points (volley) / points'] = r(s.netPts, P);
  m['net points won'] = r(s.netWon, s.netPts);
  m['drop shots / 100 points'] = 100 * r(s.drops, P);
  const tot = Object.values(s.plays).reduce((a, c) => a + c.n, 0);
  const cls = {}; for (const c of Object.values(s.plays)) for (const [k, v] of Object.entries(c)) if (k !== 'n') cls[k] = (cls[k] || 0) + v;
  m['rally shots / point'] = r(tot, P);
  for (const pl of E.PLAYS) m[`mix ${pl}`] = r(s.plays[pl]?.n || 0, tot);
  const norm = tot - (cls.x_err || 0) - (cls.x_win || 0) - (cls.x_cont || 0);
  for (const c of CLASSES.slice(0, 8)) m[`outcome ${c}`] = r(cls[c] || 0, norm);
  m['after opponent_error: unforced share'] = r(s.post.ue, s.post.ue + s.post.fe);
  for (const sd of ['deuce', 'ad']) m[`third shot forehand ${sd}`] = r(s.s1[sd].fh, s.s1[sd].fh + s.s1[sd].bh);
  return m;
}

module.exports = { simulate, sumReal, metrics, newStats, mulberry, CLASSES, GROUP };
