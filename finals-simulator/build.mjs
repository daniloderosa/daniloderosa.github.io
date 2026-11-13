// Builds a per-player model from the raw TennisViz JSON files.
// Usage: node build.mjs <file1> <file2> ...
// Accepts single-match files (.json) and player files with several matches (.json or .json.gz, `matches` field).
// Repeated matches (same match_id) are counted once. If player files are given, the model only contains
// those players (unless ALL=1); the opponents are still used for the indices.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { classifyMatch, GROUP, REASONS } from './classify.mjs';

// Prior weights in the shrinkage (pseudo-observations), per parameter group; chosen by cross-validation (kfold.mjs, oos.mjs)
const ENVM = (k, d) => +(process.env[k] || process.env.SHRINK || d);
const MW = { play: ENVM('SHRINK_PLAY', 10), serve: ENVM('SHRINK_SERVE', 10), dir: ENVM('SHRINK_DIR', 30), ret: ENVM('SHRINK_RET', 40), misc: ENVM('SHRINK_MISC', 10) };
let M = MW.misc;
const shrinkW = (w, k, n, p0) => (k + w * p0) / (n + w);    // Bayesian mean: k successes out of n, prior p0 (0-1), weight w
const shrink = (k, n, p0) => shrinkW(M, k, n, p0);
const pa = (o, def = null) => { const v = o?.player_average ?? o?.tour_average; return v == null ? def : v / 100; }; // 52-week player average (or tour average)
const MPH = 0.44704;                                 // from mph (API unit) to m/s
// mean and standard deviation, rounded
const stats = v => { if (!v.length) return null; const m = v.reduce((a, b) => a + b, 0) / v.length; return { m: +m.toFixed(2), sd: +Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length).toFixed(2), n: v.length }; };
const MID = 1.37;                                    // half-width of the middle band (thirds of the singles court)
const zoneOf = x => (x < -MID ? 'L' : x > MID ? 'R' : 'M');
const mirror = { L: 'R', M: 'M', R: 'L' };
const GROUND = ['forehand_crosscourt', 'forehand_line', 'forehand_from_the_middle', 'forehand_inside_in_out',
  'backhand_crosscourt', 'backhand_line', 'backhand_from_the_middle'];

// Serve zones (checked by crossing serve_direction with return_placement/serve_location)
const SZONES = {
  deuce: { wide: 'deuce_right', body: 'deuce_middle', t: 'deuce_left' },
  ad: { wide: 'advantage_left', body: 'advantage_middle', t: 'advantage_right' },
};
const SIDE_LOCS = { ad: ['1', '2', '3'], deuce: ['4', '5', '6'] };

// Per-player accumulators (key: player_id), filled match by match
const P = {};
const acc = id => (P[id] ??= {
  matches: [], serve: { 1: newServe(), 2: newServe() },
  ret: { deuce: newRet(), ad: newRet() }, plays: {},
  from: { L: {}, M: {}, R: {} },
  def: { hotObs: 0, hotExp: 0, coldObs: 0, coldExp: 0 }, // opponents' shots against this player
  retIdx: { obs: 0, exp: 0 },                            // opponents' unreturned serves against this player
  spd: { serve: { 1: [], 2: [] }, ret: { 1: [], 2: [] } }, // speeds in mph (serve and return), point by point
  spin: { fh: [], bh: [] },                              // rpm and slice share, one entry per match
});
function newServe() {
  const z = {};
  for (const s in SZONES) for (const k of Object.values(SZONES[s])) z[k] = { n: 0, unret: 0 };
  return { nTot: 0, nIn: 0, zones: z, eff: {}, effTot: 0 };
}
function newRet() { return { L: { won: 0, lost: 0, err: 0 }, M: { won: 0, lost: 0, err: 0 }, R: { won: 0, lost: 0, err: 0 } }; }

// Reading: list of unique matches
const MATCHES = [], seen = new Set(), TARGET = new Set();
// Pooled matrix original reason -> new class, per play (translates the 52-week averages, expressed with the original reasons)
const CONV = {}; const convAdd = (play, old, cls) => { const c = ((CONV[play] ??= {})[old] ??= {}); c[cls] = (c[cls] || 0) + 1; };
// HOLDOUT: matches to exclude (out-of-sample tests); ALL=1: model for the opponents too (validation); OUT: output file
const HOLD = new Set((process.env.HOLDOUT || '').split(',').filter(Boolean).map(Number)), ALL = process.env.ALL === '1', OUTF = process.env.OUT || 'model.json';
for (const file of process.argv.slice(2)) {
  const buf = fs.readFileSync(file), d = JSON.parse((file.endsWith('.gz') ? zlib.gunzipSync(buf) : buf).toString('utf8'));
  if (d.player) TARGET.add(d.player);
  for (const m of d.matches || [d]) {
    const id = m.export_info?.match_id ?? JSON.stringify(m.export_info);
    if (seen.has(id) || HOLD.has(id)) continue; seen.add(id); MATCHES.push({ R: m.responses, file: `${file} #${id}` });
  }
}
MATCHES.sort((a, b) => (a.R.find(r => r.endpoint === '/').data.date < b.R.find(r => r.endpoint === '/').data.date ? -1 : 1));

for (const { R, file } of MATCHES) {
  const get = (endpoint, params = {}) => {
    const r = R.find(r => r.endpoint === endpoint && Object.entries(params).every(([k, v]) => r.params[k] === v));
    if (!r) throw new Error(`${file}: manca ${endpoint} ${JSON.stringify(params)}`);
    return r.data;
  };
  const meta = get('/');
  const perfAvg = get('/performance', { set: 'all', averages: 'yes' }).performance;
  const overview = get('/match_stats/overview', { averages: 'yes' }).match.stats;
  const pks = ['player1', 'player2'];
  const ids = Object.fromEntries(pks.map(pk => [pk, meta.player_details[pk].member1.player_id]));
  const other = pk => (pk === 'player1' ? 'player2' : 'player1');
  const hcCache = {}, CL = classifyMatch(R);
  for (const pk of pks) for (const s of CL.shots[pk]) convAdd(s.play, s.hot_cold_reason ?? 'neutral', s.cls);

  for (const pk of pks) {
    const m1 = meta.player_details[pk].member1, A = acc(ids[pk]);
    A.name = m1.full_name; A.last = m1.last_name; A.hand = m1.handedness;
    A.matches.push(meta.date); A.surf = A.surf || {}; A.surf[meta.surface] = (A.surf[meta.surface] || 0) + 1;
    // winners and unforced errors per point played (including aces and double faults), for calibration
    const ov = l => overview.find(x => x.label === l)?.[pk]?.score ?? 0, ptsPlayed = overview.find(x => x.label === 'Total Points Won')[pk].frequency_total;
    A.wu = { w: (A.wu?.w || 0) + ov('Total Winners'), ue: (A.wu?.ue || 0) + ov('Total Unforced Errors'), pts: (A.wu?.pts || 0) + ptsPlayed };
    const spw = overview.find(x => x.label === 'Serve Points Won')[pk];
    A.spw = { won: (A.spw?.won || 0) + spw.frequency, tot: (A.spw?.tot || 0) + spw.frequency_total };
    // Prior (52-week averages): keep the most recent match; the court-graphics averages
    // exist only in some matches, so the most recent one that has them is kept separately
    const hasCg = R.some(r => r.endpoint === '/court_graphics' && r.params.averages === 'yes' && r.params.player === pk && r.params.graphic_type === 'serve_direction');
    const pr = { perfAvg, overview, pk, get, date: meta.date };
    if (!A.prior || meta.date >= A.prior.date) A.prior = pr;
    if (hasCg && (!A.priorCg || meta.date >= A.priorCg.date)) A.priorCg = pr;

    // Serve
    for (const sn of ['1', '2']) {
      const S = A.serve[sn];
      const base = { graphic_type: 'serve_direction', player: pk, serve: sn, pressure_break: 'all', deuce_advantage: 'all', serve_location: '' };
      const all = get('/court_graphics', { ...base, out_shots: 'yes', averages: 'no' }).shots;
      S.nTot += all.length; S.nIn += all.filter(s => s.display_type !== 'error').length;
      const av = get('/court_graphics', { ...base, out_shots: 'no', averages: 'no' }).averages;
      for (const k in S.zones) {
        S.zones[k].n += av.placement[k].frequency || 0;
        S.zones[k].unret += av.unreturned[k].frequency || 0;
      }
      const se = perfAvg.breakdown_metrics.serve_effectiveness[sn === '1' ? '1st_serve' : '2nd_serve'].breakdown_scores;
      S.effTot += se[0][pk].frequency_total;
      for (const b of se) S.eff[b.id] = (S.eff[b.id] || 0) + b[pk].frequency;
      // Opponent's return index: observed vs expected unreturned serves (server's average)
      const ur = se.filter(b => b.id === 'aces' || b.id === 'unreturned');
      const R2 = acc(ids[other(pk)]).retIdx;
      R2.obs += ur.reduce((a, b) => a + b[pk].frequency, 0);
      R2.exp += ur.reduce((a, b) => a + pa(b[pk]), 0) * se[0][pk].frequency_total;
    }

    // Mean rally length (shots per point, serve included), for calibration
    A.rl ??= { s: 0, n: 0 };
    for (const st of get('/point_by_point').sets) for (const g of st.games) for (const p of g.points) { const L = p.point_info?.speed_rally?.rally_length; if (L) { A.rl.s += L; A.rl.n++; } }
    // Serve and return speeds from point_by_point
    for (const st of get('/point_by_point').sets) for (const g of st.games) for (const p of g.points) {
      const sr = p.point_info?.speed_rally, n = String(p.point_info?.serve_number || 1);
      if (!sr) continue; // untracked point
      for (const [sn, key] of [['1', '1st_serve_speed'], ['2', '2nd_serve_speed']]) if (sr[key]?.player === pk && sr[key].score) A.spd.serve[sn].push(sr[key].score);
      if (sr.return_speed?.player === pk && sr.return_speed.score) A.spd.ret[n].push(sr.return_speed.score);
    }
    // Spin (rpm) and slice share for forehand and backhand
    const rs = get('/match_stats/rally', { averages: 'no' }).match.stats, sc = l => rs.find(x => x.label === l)[pk].scores.map(q => q.score);
    const top = sc('Forehand / Backhand Topspin'), sl = sc('Forehand / Backhand Slice');
    A.spin.fh.push({ top: top[0], slice: sl[0], sliceShare: sc('Forehand Spin Topspin / Slice')[1] });
    A.spin.bh.push({ top: top[1], slice: sl[1], sliceShare: sc('Backhand Spin Topspin / Slice')[1] });

    // Server's third shot (serve_plus_one): forehands and backhands per side, for the calibration check
    A.s1 ??= { deuce: { fh: 0, bh: 0 }, ad: { fh: 0, bh: 0 } };
    for (const sn of ['1', '2']) for (const [side, da] of [['deuce', 'deuce'], ['ad', 'advantage']]) {
      const d = get('/court_graphics', { graphic_type: 'serve_plus_one', player: pk, serve: sn, deuce_advantage: da, pressure_break: 'all', averages: 'no' });
      A.s1[side].fh += d.forehand.usage.frequency || 0;
      A.s1[side].bh += d.backhand.usage.frequency || 0;
    }

    // Return (pk returns): direction = bounce band in the server's frame
    for (const side in SIDE_LOCS) for (const sn of ['1', '2']) for (const loc of SIDE_LOCS[side]) {
      const base = { graphic_type: 'return_placement', player: pk, serve: sn, serve_location: loc, pressure_break: 'all', averages: 'no' };
      for (const s of get('/court_graphics', { ...base, out_shots: 'yes' }).shots) {
        const c = A.ret[side][zoneOf(s.x)];
        if (s.display_type === 'error') c.err++;
        else if (s.display_type === 'lost') c.lost++;
        else c.won++; // won e winner
      }
    }

    // Outcome of the final shots after an opponent's "opponent_error" / "opponent_winner" (extreme phases)
    A.post ??= { ue: 0, fe: 0, win: 0 }; for (const k of ['ue', 'fe', 'win']) A.post[k] += CL.post[pk][k];
    // Missed returns: unforced or forced, on first and second serve (statistics only)
    A.retErr ??= { 1: { ue: 0, fe: 0 }, 2: { ue: 0, fe: 0 } };
    for (const st of get('/point_by_point').sets) for (const g of st.games) for (const p of g.points) {
      const pe = p.point_info?.point_end; if (pe?.player !== pk || !/^ret_(ue|fe)$/.test(pe.type)) continue;
      A.retErr[p.point_info.serve_number === 2 ? 2 : 1][pe.type.slice(4)]++;
    }

    // Rally shots (reclassified: see classify.mjs)
    const hc = get('/hot_and_cold_plays', { player: pk, set: 'all', averages: 'no' });
    const hcAvg = get('/hot_and_cold_plays', { player: pk, set: 'all', averages: 'yes' });
    hcCache[pk] = { hc, hcAvg };
    for (const p of hc) {
      const Q = (A.plays[p.play_id] ??= { shots: [], total: 0 });
      const mine = CL.shots[pk].filter(s => s.play === p.play_id);
      Q.shots.push(...mine);
      for (const s of mine) if (s.from_x != null) {
        const z = zoneOf(s.from_x);
        A.from[z][p.play_id] = (A.from[z][p.play_id] || 0) + 1;
      }
    }
  }

  // Defensive index: opponent's hot/cold shots observed vs expected from the opponent's per-play averages
  for (const pk of pks) {
    const D = acc(ids[other(pk)]).def, { hc, hcAvg } = hcCache[pk];
    for (const p of hc) {
      const a = hcAvg.find(x => x.play_id === p.play_id), n = p.shots.length;
      D.hotObs += p.shots.filter(s => s.shot_type === 'hot').length;
      D.coldObs += p.shots.filter(s => s.shot_type === 'cold').length;
      D.hotExp += n * pa(a.volume.hot);
      D.coldExp += n * pa(a.volume.cold);
    }
  }
}

// From accumulators to probabilities
function finalize(A) {
  const { perfAvg, overview, pk, get } = A.prior;
  const stat = l => overview.find(s => s.label === l)[pk];
  // court-graphics averages: from the most recent match that has them (if none, fall back on the player's data)
  const cgAvg = params => (A.priorCg ? A.priorCg.get('/court_graphics', { ...params, player: A.priorCg.pk, averages: 'yes' }).averages : null);
  const out = { name: A.name, hand: A.hand, matches: A.matches.length, surfaces: A.surf, serve: {}, ret: {}, plays: {}, from: {} };

  for (const sn of ['1', '2']) {
    const S = A.serve[sn];
    const avg = cgAvg({ graphic_type: 'serve_direction', serve: sn, pressure_break: 'all', deuce_advantage: 'all', serve_location: '' });
    let pInPrior;
    if (sn === '1') pInPrior = pa(stat('1st Serve In'));
    else { // assumption: 80 serve points per match
      const p1 = pa(stat('1st Serve In')), df = stat('Double Faults').player_average ?? stat('Double Faults').tour_average;
      pInPrior = 1 - df / (80 * (1 - p1));
    }
    const se = perfAvg.breakdown_metrics.serve_effectiveness[sn === '1' ? '1st_serve' : '2nd_serve'].breakdown_scores;
    const eff = {};
    M = MW.serve;
    for (const b of se) eff[b.id] = shrink(S.eff[b.id], S.effTot, pa(b[pk]));
    const tot = Object.values(eff).reduce((a, b) => a + b, 0);
    for (const k in eff) eff[k] /= tot;
    const zones = {};
    for (const side in SZONES) {
      zones[side] = {};
      const nSide = Object.values(SZONES[side]).reduce((a, k) => a + S.zones[k].n, 0);
      const nU = Object.values(SZONES[side]).reduce((a, k) => a + S.zones[k].unret, 0);
      for (const [z, k] of Object.entries(SZONES[side])) {
        zones[side][z] = {
          usage: shrink(S.zones[k].n, nSide, pa(avg?.placement[k], 1 / 3)),
          unret: shrink(S.zones[k].unret, S.zones[k].n, pa(avg?.unreturned[k], nU / Math.max(1, nSide))),
          n: S.zones[k].n,
        };
      }
      const s = Object.values(zones[side]).reduce((a, b) => a + b.usage, 0);
      for (const z in zones[side]) zones[side][z].usage /= s;
    }
    const rest = eff.attack + eff.neutral + eff.defence + eff.return_winners;
    out.serve[sn] = {
      eff, pIn: shrink(S.nIn, S.nTot, pInPrior), aceShare: eff.aces / (eff.aces + eff.unreturned), zones,
      afterReturn: { attack: eff.attack / rest, neutral: eff.neutral / rest, defence: eff.defence / rest, return_winner: eff.return_winners / rest },
    };
  }

  // Return: per side and direction, usage, error rate and points-won share (shrunk to the player's average)
  M = MW.ret;
  const rAvg = cgAvg({ graphic_type: 'return_placement', serve: '1', serve_location: '', pressure_break: 'all' });
  const VK = { L: 'left', M: 'middle', R: 'right' };
  for (const side in A.ret) {
    const C = A.ret[side], n = z => C[z].won + C[z].lost, all = ['L', 'M', 'R'];
    const errAll = all.reduce((a, z) => a + C[z].err, 0), totAll = all.reduce((a, z) => a + n(z) + C[z].err, 0);
    const errAvg = errAll / totAll;
    const o = {};
    for (const z of all) o[z] = {
      usage: shrink(n(z) + C[z].err, totAll, pa(rAvg?.placement.vertical[VK[z]], 1 / 3)),
      err: shrink(C[z].err, n(z) + C[z].err, errAvg),
      win: shrink(C[z].won, n(z), pa(rAvg?.win.vertical[VK[z]], .4)),
      n: n(z) + C[z].err,
    };
    const wAvg = all.reduce((a, z) => a + o[z].win * o[z].usage, 0) / all.reduce((a, z) => a + o[z].usage, 0);
    out.ret[side] = { dirs: o, errAvg, winAvg: wAvg };
  }

  // Rally shots
  const hcAvg = get('/hot_and_cold_plays', { player: pk, set: 'all', averages: 'yes' });
  const nAll = Object.values(A.plays).reduce((a, q) => a + q.shots.length, 0);
  for (const [id, Q] of Object.entries(A.plays)) {
    M = MW.play;
    const a = hcAvg.find(x => x.play_id === id), shAll = Q.shots;
    // "normal" shots: final shots generated by the extreme phases are excluded
    const sh = shAll.filter(s => s.cls !== 'x_err' && s.cls !== 'x_win'), n = sh.length;
    // prior: the player's 52-week averages (original reasons) translated into the new classes with the pooled matrix
    const q = {}; for (const c in GROUP) q[c] = 0;
    const oldP = { neutral: pa(a.volume.neutral) };
    for (const t of ['hot', 'cold']) for (const o of a.outcomes[t]) oldP[o.id] = pa(a.volume[t]) * pa(o);
    for (const [old, p] of Object.entries(oldP)) {
      const row = CONV[id]?.[old]; if (!row) { if (q[old] !== undefined) q[old] += p; continue; }
      const tot = Object.values(row).reduce((x, y) => x + y, 0);
      for (const [c, m] of Object.entries(row)) if (q[c] !== undefined) q[c] += p * m / tot;
    }
    const qt = Object.values(q).reduce((x, y) => x + y, 0); for (const c in q) q[c] /= qt;
    const qg = { hot: 0, neutral: 0, cold: 0 }; for (const c in q) qg[GROUP[c]] += q[c];
    const cnt = t => sh.filter(s => GROUP[s.cls] === t).length;
    const vol = {};
    for (const t of ['hot', 'neutral', 'cold']) vol[t] = shrink(cnt(t), n, qg[t]);
    const outs = {};
    for (const t of ['hot', 'cold']) {
      outs[t] = {};
      for (const c of REASONS[t]) outs[t][c] = shrink(sh.filter(s => s.cls === c).length, cnt(t), qg[t] ? q[c] / qg[t] : 1 / REASONS[t].length);
    }
    // Zone where the ball reaches the opponent (in their frame): only shots that do not end the point
    const land = { L: 1, M: 1, R: 1 };
    for (const s of sh) if (s.to_x != null && !['winner', 'error', 'fe'].includes(s.cls)) land[mirror[zoneOf(s.to_x)]]++; // shots that stayed in play
    // drop out-of-range speeds (mph): groundstrokes above 115, volleys/smashes above 130, drop shots above 60
    const [lo, hi] = id === 'volleys' ? [10, 130] : id === 'drop_shots' ? [10, 60] : [20, 115];
    const sp = shAll.map(x => x.shot_speed).filter(v => v >= lo && v <= hi).map(v => v * MPH);
    // Outcomes by direction (landing zone in the receiver's frame). Shots into the net do not say where they were aimed:
    // they are excluded, and only each direction's relative deviation (shrunk) is applied to the play's mean outcome
    const known = sh.filter(s => s.to_x != null && s.to_y != null && Math.abs(s.to_y) >= 1), cnt2 = (arr, t) => arr.filter(s => GROUP[s.cls] === t).length;
    const base = Object.fromEntries(['hot', 'neutral', 'cold'].map(t => [t, (cnt2(known, t) + 1) / (known.length + 3)])), dir = {};
    M = MW.dir;
    for (const z of ['L', 'M', 'R']) {
      const sz = known.filter(s => mirror[zoneOf(s.to_x)] === z), nz = sz.length, v = {};
      for (const t of ['hot', 'neutral', 'cold']) v[t] = vol[t] * shrink(cnt2(sz, t), nz, base[t]) / base[t];
      const tv = v.hot + v.neutral + v.cold;
      dir[z] = { n: nz, vol: { hot: v.hot / tv, neutral: v.neutral / tv, cold: v.cold / tv } };
    }
    M = MW.play;
    out.plays[id] = { usage: shrink(shAll.length, nAll, pa(a.total)), vol, outs, land, dir, n: shAll.length, spd: stats(sp) };
  }
  out.from = A.from; M = MW.misc;
  // extreme phases: unforced share among the errors after "opponent_error" (prior: all players' average)
  out.xUE = shrink(A.post.ue, A.post.ue + A.post.fe, POST.ue / (POST.ue + POST.fe));
  out.retUE = { 1: shrink(A.retErr[1].ue, A.retErr[1].ue + A.retErr[1].fe, RETE[1]), 2: shrink(A.retErr[2].ue, A.retErr[2].ue + A.retErr[2].fe, RETE[2]) };
  out.speed = { serve: { 1: stats(A.spd.serve[1].map(v => v * MPH)), 2: stats(A.spd.serve[2].map(v => v * MPH)) }, ret: { 1: stats(A.spd.ret[1].map(v => v * MPH)), 2: stats(A.spd.ret[2].map(v => v * MPH)) } };
  const avg = (arr, k) => { const v = arr.map(x => x[k]).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  out.spin = Object.fromEntries(['fh', 'bh'].map(w => [w, { top: avg(A.spin[w], 'top'), slice: avg(A.spin[w], 'slice'), sliceShare: avg(A.spin[w], 'sliceShare') / 100 }]));

  // Opponent indices (1 = average), with pseudo-counts so that little data does not overreact
  const D = A.def;
  out.defRaw = { ...D }; out.retRaw = { ...A.retIdx }; // raw counts: the engine can recompute the indices with another weight
  // pseudo-counts chosen by cross-validation (idxcv.mjs)
  const CD = +(process.env.C_DEF || 300), CR = +(process.env.C_RET || 100);
  out.defIdx = { hot: (D.hotObs + CD) / (D.hotExp + CD), cold: (D.coldObs + CD) / (D.coldExp + CD) };
  out.retIdx = (A.retIdx.obs + CR) / (A.retIdx.exp + CR);
  // Calibration targets (52-week averages)
  const cap = perfAvg.comparison_metrics.capitalisation;
  out.realServePtsWon = A.spw.won / A.spw.tot;
  out.real3rd = A.s1; // real forehand/backhand counts on the third shot, per side
  out.shrinkW = MW;
  out.targets = { conversion: pa(cap.conversion[pk]), steal: pa(cap.steal[pk]), attack: pa(perfAvg.battles.balance_of_power[pk]), winPP: A.wu.w / A.wu.pts, uePP: A.wu.ue / A.wu.pts, rally: A.rl.s / A.rl.n };
  return out;
}

// pooled averages for the xUE and retUE priors
const POST = { ue: 0, fe: 0 }, RETE = {};
for (const A of Object.values(P)) { POST.ue += A.post?.ue || 0; POST.fe += A.post?.fe || 0; }
for (const sn of [1, 2]) { let u = 0, f = 0; for (const A of Object.values(P)) { u += A.retErr?.[sn].ue || 0; f += A.retErr?.[sn].fe || 0; } RETE[sn] = u / (u + f); }
const model = { players: {} };
for (const [id, A] of Object.entries(P)) if (ALL || !TARGET.size || TARGET.has(A.last)) { try { model.players[id] = finalize(A); } catch (e) { console.warn('Model not built for', A.name, e.message); } }
model.target = Object.keys(model.players).filter(id => TARGET.has(P[id].last));
const missing = [...TARGET].filter(n => !Object.values(model.players).some(p => p.name.endsWith(n)));
if (missing.length) console.warn('Players without data:', missing.join(', '));
// Calibrated values from calib.json (if present): control-state strength, persistence, extreme phases, correctors
model.phaseK = 0.5; model.persist = 1; model.xErr = .7; model.xWin = .55;
if (fs.existsSync('calib.json')) {
  const c = JSON.parse(fs.readFileSync('calib.json', 'utf8'));
  model.phaseK = c.k; model.persist = c.persist ?? 1; model.xErr = c.xErr ?? .7; model.xWin = c.xWin ?? .55;
  model.shotMod = c.shotMod || {}; model.kfe = c.kfe ?? 0;
  for (const id in model.players) {
    const cp = c.players?.[id], pm = model.players[id];
    if (c.thirdFH?.[id]) pm.thirdFH = c.thirdFH[id];
    if (!cp) continue; // calibration correctors (calibrate2.cjs): third-shot forehand, play frequency, outcomes per play
    pm.thirdFH = cp.thirdFH; pm.playMult = cp.playMult;
    for (const [pl, v] of Object.entries(cp.corr || {})) if (pm.plays[pl]) pm.plays[pl].corr = v;
  }
}

fs.writeFileSync(OUTF, JSON.stringify(model, null, OUTF === 'model.json' ? 1 : 0));
if (OUTF !== 'model.json' || !fs.existsSync('template.html')) { console.log(`ok: ${MATCHES.length} matches, ${Object.keys(model.players).length} players -> ${OUTF}`); process.exit(0); } // template.html: text prototype (optional, not in the repository)
const html = fs.readFileSync('template.html', 'utf8')
  .replace('/*MODEL*/', `const MODEL = ${JSON.stringify(model)};`)
  .replace('/*ENGINE*/', fs.readFileSync('engine.js', 'utf8').replace(/^if \(typeof module.*$/m, ''));
fs.writeFileSync('index.html', html);
console.log(`ok: ${MATCHES.length} matches |`, Object.values(model.players).map(p => `${p.name} (${p.matches})`).join(', '), '| phaseK', model.phaseK);
