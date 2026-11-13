// Simulation engine: pure logic, no UI dependencies (labels and texts live in the game).
// Zones: L/M/R always in the frame of the player who hits (their left / middle / their right).

// The 9 rally play types tracked by TennisViz
const PLAYS = ['forehand_crosscourt', 'forehand_line', 'forehand_from_the_middle', 'forehand_inside_in_out',
  'backhand_crosscourt', 'backhand_line', 'backhand_from_the_middle', 'volleys', 'drop_shots'];
const GROUND_PLAYS = ['forehand_crosscourt', 'forehand_line', 'forehand_from_the_middle', 'forehand_inside_in_out',
  'backhand_crosscourt', 'backhand_line', 'backhand_from_the_middle'];
const MIN_SHARE = 0.05; // a play is possible from a zone if at least 5% of the player's shots from there are of that type

function pick(dist, rng = Math.random) {
  const tot = Object.values(dist).reduce((a, b) => a + b, 0);
  let r = rng() * tot;
  for (const [k, w] of Object.entries(dist)) if ((r -= w) <= 0) return k;
  return Object.keys(dist).at(-1);
}

// --- When a volley can be played ---
// prevOwn / prevOpp: last shot of the hitter and of the opponent, { kind: 'serve'|'return'|'shot', play, attack }
// Cases: after one's own serve, after one's own drop shot, after an opponent's volley,
// after one's own shot that led to attack. Never when hitting in defence.
function volleyAllowed(phase, prevOwn, prevOpp) {
  if (isDef(phase) || !prevOwn) return false;
  return prevOwn.kind === 'serve' || prevOwn.play === 'drop_shots' || prevOwn.attack === true || (!!prevOpp && prevOpp.play === 'volleys');
}
const VOLLEY_BOOST = 3; // volleys are allowed in few situations: weight boosted towards the real share (fine-tuned per player by playMult)

// --- Possible plays given the incoming zone and the phase ---
// Returns {playId: weight}: the weight is the player's real frequency from that zone (used by the computer)
// fhMult: forehand multiplier (only on the server's third shot, calibrated on serve_plus_one)
function allowedPlays(pm, zone, phase, fhMult = 1, canVolley = false) {
  const from = pm.from[zone] || {};
  const nZone = GROUND_PLAYS.reduce((a, g) => a + (from[g] || 0), 0) || 1;
  const w = {};
  for (const g of GROUND_PLAYS) if ((from[g] || 0) / nZone >= MIN_SHARE) w[g] = from[g];
  if (isDef(phase)) delete w.forehand_inside_in_out;                 // no running around the ball in defence
  if (canVolley && pm.plays.volleys) w.volleys = pm.plays.volleys.usage * nZone * (pm.volBoost ?? VOLLEY_BOOST); // volleys only in the allowed situations (see volleyAllowed)
  if (!isDef(phase) && pm.plays.drop_shots) w.drop_shots = pm.plays.drop_shots.usage * nZone * (pm.dropBoost ?? 1);
  if (!Object.keys(w).length) { // fallback: the most frequent play from that zone
    const best = GROUND_PLAYS.reduce((a, g) => ((from[g] || 0) > (from[a] || 0) ? g : a));
    w[best] = 1;
  }
  for (const id in w) { if (id.startsWith('forehand')) w[id] *= fhMult; if (pm.playMult?.[id]) w[id] *= pm.playMult[id]; } // playMult: play-frequency corrector (calibration)
  return w;
}

// --- Serve, in two steps: first the serve, then (if needed) the return ---
function resolveServe(server, returner, sn, side, zone, rng = Math.random) {
  const s = server.serve[sn];
  if (rng() > s.pIn) return { type: sn === '1' ? 'fault' : 'double_fault' };
  const unret = Math.min(0.9, s.zones[side][zone].unret * returner.retIdx); // corrector: quality of the returner
  const pAce = unret * s.aceShare;
  if (rng() < pAce) return { type: 'ace' };
  return { type: 'returnable', pErr: (unret - pAce) / (1 - pAce) }; // base probability of a return error
}

// Return direction: dir = landing zone in the server's frame (L/M/R)
function resolveReturn(server, returner, sn, side, dir, pErr, rng = Math.random) {
  const R = returner.ret[side], d = R.dirs[dir];
  if (rng() < Math.min(0.95, pErr * d.err / R.errAvg)) return { type: 'return_error' };
  // Tilt the starting state by the returner's points-won share with that direction (approximation)
  const a = server.serve[sn].afterReturn, w = d.win, wb = R.winAvg;
  const st = pick({
    attack: a.attack * (1 - w) / (1 - wb), neutral: a.neutral,
    defence: a.defence * w / wb, return_winner: a.return_winner * w / wb,
  }, rng);
  if (st === 'return_winner') return { type: 'return_winner' };
  return { type: 'rally', serverPhase: st, zone: dir };
}
const cpuServeZone = (pm, sn, side, rng) =>
  pick(Object.fromEntries(Object.entries(pm.serve[sn].zones[side]).map(([z, v]) => [z, v.usage])), rng);
const cpuReturnDir = (pm, side, rng) =>
  pick(Object.fromEntries(Object.entries(pm.ret[side].dirs).map(([z, v]) => [z, v.usage])), rng);
// Return direction names for the returner (keys; the game translates them): from the deuce side the crosscourt
// return goes to the server's right, from the ad side to the server's left
const returnDirLabels = side => (side === 'deuce'
  ? { R: 'cross', M: 'middle', L: 'line' }
  : { L: 'cross', M: 'middle', R: 'line' });

// --- Rally shot ---
// hot/neutral/cold weights after the control state (strength k) and the opponent's defensive index.
// Phases: attack / neutral / defence, plus xattack / xdefence for the single shot that follows a very strong or very weak
// shot of the opponent (in the data: "opponent_error" and "opponent_winner"). The outcome is not decided: only the dice weights change.
// Shot in extreme defence (after a very strong opponent shot): error very likely, winner almost impossible.
// Shot in clear attack (after a very weak opponent shot): winner very likely, error rare.
// Otherwise the rally goes on. In the data the shot after "opponent_error" is an error 99% of the time and the one after
// "opponent_winner" a winner 99% of the time: in the game both stay below 100% (a ball in play never has a decided outcome).
// Winner in extreme defence and error in clear attack: observed frequencies (0.3% and 0.8%).
let XERR = .92, XWIN = .92;
const XWIN_IN_DEF = .003, XERR_IN_ATT = .008;
const setExtreme = (err, win) => { XERR = err; XWIN = win; };
// KFE: how much the phase shifts forced errors relative to the other negative outcomes (more in defence, less in attack)
let KFE = 0;
const setKfe = v => { KFE = v; };
// Error type, as in the data: unforced error (reason "error"), forced error (final shot with no reason, here "fe");
// after an opponent's "opponent_error" shot the unforced share is the one observed for the player who errs (xUE)
function endType(o, phase, pm, rng = Math.random) {
  if (o.reason === 'winner') return 'W';
  if (phase === 'xdefence') return rng() < (pm.xUE ?? .63) ? 'UE' : 'FE';
  return o.key === 'fe' ? 'FE' : 'UE';
}
// opponent indices recomputed with different pseudo-counts (calibration experiments)
function applyIndices(players, cDef, cRet) {
  for (const p of Object.values(players)) {
    if (p.defRaw) { const D = p.defRaw; p.defIdx = { hot: (D.hotObs + cDef) / (D.hotExp + cDef), cold: (D.coldObs + cDef) / (D.coldExp + cDef) }; }
    if (p.retRaw) p.retIdx = (p.retRaw.obs + cRet) / (p.retRaw.exp + cRet);
  }
}
const isDef = ph => ph === 'defence' || ph === 'xdefence', isAtt = ph => ph === 'attack' || ph === 'xattack';
// zone: chosen direction (L/M/R in the receiver's frame); when given, the outcomes of that direction are used
function shotDist(pm, defender, playId, phase, k, zone = null) {
  if (phase === 'xdefence') return { hot: XWIN_IN_DEF, neutral: 1 - XERR - XWIN_IN_DEF, cold: XERR };
  if (phase === 'xattack') return { hot: XWIN, neutral: 1 - XWIN - XERR_IN_ATT, cold: XERR_IN_ATT };
  const e = { attack: k, defence: -k }[phase] || 0;
  const P = pm.plays[playId], v = (zone && P.dir && P.dir[zone]) ? P.dir[zone].vol : P.vol, f = Math.exp(e), c = P.corr || { hot: 1, neutral: 1, cold: 1 }; // corr: calibration corrector
  const d = { hot: v.hot * c.hot * f * defender.defIdx.hot, neutral: v.neutral * c.neutral, cold: v.cold * c.cold / f * defender.defIdx.cold };
  const t = d.hot + d.neutral + d.cold;
  return { hot: d.hot / t, neutral: d.neutral / t, cold: d.cold / t };
}
// control: who leads after the shot ('hitter' | 'opponent' | 'same' = unchanged)
// forcedZone: imposed landing zone (used when the user picks a precise target)
// Corrector by shot number (3 = server's third shot, 4 = returner's first rally shot, ...) and by serve:
// multiplies the outcome classes. Calibrated on how points end by shot number (point by point).
let SHOTMOD = {};
const setShotMod = m => { SHOTMOD = m || {}; };
// Distribution over the eight classes: group (hot/neutral/cold) times the class share within the group, then the correctors
function classDist(p, g, phase, ctx) {
  const d = { neutral: g.neutral };
  for (const t of ['hot', 'cold']) for (const [r, x] of Object.entries(p.outs[t])) d[r] = g[t] * x;
  if (KFE && d.fe != null) d.fe *= Math.exp(isDef(phase) ? KFE : isAtt(phase) ? -KFE : 0);
  const sm = ctx && SHOTMOD[`${Math.min(ctx.n, 7)}|${ctx.sn}`];
  if (sm) for (const r in sm) if (d[r] != null) d[r] *= sm[r];
  return d;
}
// Positive / neutral / negative probabilities of a shot, with all correctors (for the game's option cards)
function outcomeDist(pm, defender, playId, phase, k, zone = null, ctx = null) {
  const g = shotDist(pm, defender, playId, phase, k, zone);
  if (phase === 'xdefence' || phase === 'xattack') return g;
  const p = pm.plays[playId], d = classDist(p, g, phase, ctx), o = { hot: 0, neutral: d.neutral, cold: 0 };
  for (const [r, x] of Object.entries(d)) if (r !== 'neutral') o[p.outs.hot[r] != null ? 'hot' : 'cold'] += x;
  const t = o.hot + o.neutral + o.cold;
  return { hot: o.hot / t, neutral: o.neutral / t, cold: o.cold / t };
}
// ctx: { n: shot number in the point, sn: '1' | '2' }
function resolveShot(pm, defender, playId, phase, k, rng = Math.random, forcedZone = null, ctx = null) {
  const p = pm.plays[playId], zone = forcedZone || pick(p.land, rng);
  const g = shotDist(pm, defender, playId, phase, k, zone);
  // in the extreme phases "positive" is the winner and "negative" the error
  if (phase === 'xdefence' || phase === 'xattack') {
    const t = pick(g, rng);
    if (t === 'neutral') return { result: 'continue', reason: 'neutral', control: 'same', zone, t, key: null };
    return t === 'hot' ? { result: 'win', reason: 'winner', control: 'same', zone, t, key: 'winner' } : { result: 'lose', reason: 'error', control: 'same', zone, t, key: 'error' };
  }
  const d = classDist(p, g, phase, ctx);
  const reason = pick(d, rng), t = reason === 'neutral' ? 'neutral' : p.outs.hot[reason] != null ? 'hot' : 'cold';
  if (reason === 'neutral') return { result: 'continue', reason: 'neutral', control: 'same', zone, t, key: null };
  // a ball that stays in play does not decide the next shot: "opponent_error" and "opponent_winner"
  // become an extreme disadvantage (or advantage) for the player who must reply
  // reason: outcome key for the game (winner, error, neutral, to_attack, opp_trouble, to_defence, opp_edge)
  const map = {
    winner: ['win', 'winner', 'same'], error: ['lose', 'error', 'same'], fe: ['lose', 'error', 'same'],
    in_attack: ['continue', 'to_attack', 'hitter'], opponent_error: ['continue', 'opp_trouble', 'hitter'],
    in_defence: ['continue', 'to_defence', 'opponent'], opponent_winner: ['continue', 'opp_edge', 'opponent'],
  };
  const [result, label, control] = map[reason];
  return { result, reason: label, control, strong: reason === 'opponent_error' || reason === 'opponent_winner', zone, t, key: reason };
}
const cpuPlay = (pm, zone, phase, rng, fhMult = 1, canVolley = false) => pick(allowedPlays(pm, zone, phase, fhMult, canVolley), rng);

// Control state: a single value, who leads the rally (null = neutral)
const phaseOf = (ctrl, who) => (ctrl === null ? 'neutral' : ctrl === who ? 'attack' : 'defence');
// phase of the shot, taking into account the extreme advantage just created (ext = { who, kind })
const phaseFor = (ctrl, ext, who) => (ext && ext.who === who ? ext.kind : phaseOf(ctrl, who));
// persist: probability that the advantage survives a neutral shot (calibrated: otherwise the advantage lasts too long)
function nextCtrl(ctrl, hitter, control, persist = 1, rng = Math.random) {
  if (control === 'same') return ctrl !== null && rng() > persist ? null : ctrl;
  const opp = hitter === 'A' ? 'B' : 'A';
  return control === 'hitter' ? hitter : opp;
}

// --- Punteggio ---
function gameScore(a, b) {
  const L = ['0', '15', '30', '40'];
  if (a >= 3 && b >= 3) return a === b ? 'Deuce' : a > b ? 'Ad A' : 'Ad B';
  return `${L[Math.min(a, 3)]}-${L[Math.min(b, 3)]}`;
}
const gameWinner = (a, b) => (a >= 4 && a - b >= 2 ? 'a' : b >= 4 && b - a >= 2 ? 'b' : null);
const sideFor = (a, b) => ((a + b) % 2 === 0 ? 'deuce' : 'ad');

// --- Fully simulated point (validation, calibration, "simulate the rest"). A = server, B = returner ---
function simPoint(A, B, side, k, rng = Math.random, persist = 1) {
  const P = { A, B }, track = { A: { att: false, def: false }, B: { att: false, def: false } };
  let sn = '1', r;
  for (;;) {
    r = resolveServe(A, B, sn, side, cpuServeZone(A, sn, side, rng), rng);
    if (r.type === 'fault') { sn = '2'; continue; }
    break;
  }
  let third = null; // server's third shot, for the calibration check
  const plays = [];  // rally sequence [who, play]
  // info: how the point ended, for the statistics (A = server). end.type: W winner, UE unforced error, FE forced error
  // len: rally length as in the data (shots that stayed in play: the missed shot is not counted)
  // ph: hardest phase in which each player hit (none / defence / xdefence), like `phase` in point_by_point
  const info = { df: false, ace: false, unret: false, serveIn: true, rally: false, end: null, net: { A: false, B: false }, shots: { A: 0, B: 0 }, att: { A: 0, B: 0 }, sn, log: [], serverPhase: null, len: 0, ph: { A: 'none', B: 'none' } };
  const end = (winner, shots) => { info.len = shots; return { winner, shots, track, third, plays, info }; };
  if (r.type === 'double_fault') { info.df = true; info.serveIn = false; return end('B', 0); }
  if (r.type === 'ace') { info.ace = info.unret = true; return end('A', 1); }
  r = resolveReturn(A, B, sn, side, cpuReturnDir(B, side, rng), r.pErr, rng);
  if (r.type === 'return_error') { info.unret = true; info.retErr = sn; info.end = { type: rng() < (B.retUE?.[sn] ?? (sn === '1' ? .15 : .35)) ? 'UE' : 'FE', by: 'B', play: 'return' }; return end('A', 1); } // missed return: unforced or forced with the observed shares
  if (r.type === 'return_winner') { info.end = { type: 'W', by: 'B', play: rng() < .55 ? 'forehand_return' : 'backhand_return' }; return end('B', 2); }
  info.rally = true; info.serverPhase = r.serverPhase;
  let ctrl = r.serverPhase === 'attack' ? 'A' : r.serverPhase === 'defence' ? 'B' : null;
  let hitter = 'A', zone = r.zone, shots = 2, ext = null;
  const prev = { A: { kind: 'serve' }, B: { kind: 'return' } };
  // Mark who was in attack / in defence during the point (for conversion and steal)
  const mark = () => { if (ctrl) { track[ctrl].att = true; track[ctrl === 'A' ? 'B' : 'A'].def = true; } };
  mark();
  for (;;) {
    const opp = hitter === 'A' ? 'B' : 'A', phase = phaseFor(ctrl, ext, hitter);
    info.shots[hitter]++; if (isAtt(phase)) info.att[hitter]++;
    if (phase === 'xdefence') info.ph[hitter] = 'xdefence'; else if (phase === 'defence' && info.ph[hitter] === 'none') info.ph[hitter] = 'defence';
    const play = cpuPlay(P[hitter], zone, phase, rng, shots === 2 ? (A.thirdFH?.[side] ?? 1) : 1, volleyAllowed(phase, prev[hitter], prev[opp]));
    plays.push([hitter, play]);
    if (play === 'volleys') info.net[hitter] = true;
    if (shots === 2) third = play;
    const o = resolveShot(P[hitter], P[opp], play, phase, k, rng, null, { n: shots + 1, sn });
    info.log.push([hitter, play, phase, o.t, o.key]);
    shots++;
    if (o.result !== 'continue') {
      info.end = { type: endType(o, phase, P[hitter], rng), by: hitter, play };
      return end(o.result === 'win' ? hitter : opp, o.result === 'win' ? shots : shots - 1);
    }
    prev[hitter] = { kind: 'shot', play, attack: o.control === 'hitter' };
    ctrl = nextCtrl(ctrl, hitter, o.control, persist, rng); mark();
    ext = o.strong ? { who: opp, kind: o.control === 'hitter' ? 'xdefence' : 'xattack' } : null;
    hitter = opp; zone = o.zone;
  }
}

if (typeof module !== 'undefined') module.exports = { setExtreme, setKfe, setShotMod, outcomeDist, classDist, applyIndices, endType, isDef, isAtt, phaseFor, PLAYS, pick, allowedPlays, volleyAllowed, resolveServe, resolveReturn, cpuServeZone, cpuReturnDir, returnDirLabels, shotDist, resolveShot, cpuPlay, phaseOf, nextCtrl, gameScore, gameWinner, sideFor, simPoint };
