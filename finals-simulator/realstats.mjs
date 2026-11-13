// Real statistics for validation: per match and per player, counts with the same definitions used by the simulator.
// Usage: node realstats.mjs data/raw/*.json.gz  ->  data/real_stats.json
import fs from 'node:fs';
import zlib from 'node:zlib';
import { classifyMatch } from './classify.mjs';

const out = { matches: [] }, seen = new Set();
const BANDS = L => (L <= 4 ? 'b04' : L <= 8 ? 'b58' : 'b9');

for (const file of process.argv.slice(2)) {
  const buf = fs.readFileSync(file), d = JSON.parse((file.endsWith('.gz') ? zlib.gunzipSync(buf) : buf).toString('utf8'));
  for (const m of d.matches || [d]) {
    const id = m.export_info.match_id; if (seen.has(id)) continue; seen.add(id);
    const R = m.responses, get = (ep, p = {}) => R.find(r => r.endpoint === ep && Object.entries(p).every(([k, v]) => r.params[k] === v))?.data;
    const meta = get('/'), pbp = get('/point_by_point'), perf = get('/performance', { set: 'all', averages: 'no' })?.performance;
    const pk = ['player1', 'player2'], pid = Object.fromEntries(pk.map(k => [k, meta.player_details[k].member1.player_id])), other = k => (k === 'player1' ? 'player2' : 'player1');
    const S = Object.fromEntries(pk.map(k => [k, {
      servePts: 0, serveWon: 0, first: 0, firstIn: 0, firstWon: 0, second: 0, secondWon: 0, aces: 0, dfs: 0,
      retPts: 0, retWon: 0, ret1: 0, ret1Won: 0, ret2: 0, ret2Won: 0, retIn1: 0, retInDen1: 0, retIn2: 0, retInDen2: 0,
      pts: 0, won: 0, rlSum: 0, rlN: 0, b04: 0, b04W: 0, b58: 0, b58W: 0, b9: 0, b9W: 0,
      ret_ue1: 0, ret_ue2: 0, ret_fe1: 0, ret_fe2: 0, svcWin: 0,
      fh_win: 0, bh_win: 0, vol_win: 0, ret_win: 0, fh_ue: 0, bh_ue: 0, vol_ue: 0, ret_ue: 0, fh_fe: 0, bh_fe: 0, vol_fe: 0, ret_fe: 0,
      netPts: 0, netWon: 0, drops: 0, rallyPts: 0,
      conv: 0, convDen: 0, steal: 0, stealDen: 0, bop: null,
      se1: {}, se1Den: 0, se2: {}, se2Den: 0, plays: {}, s1: { deuce: { fh: 0, bh: 0 }, ad: { fh: 0, bh: 0 } },
    }]));
    const CL = classifyMatch(R);
    // --- point by point ---
    for (const st of pbp.sets) for (const g of st.games) for (const p of g.points) {
      const pi = p.point_info; if (!pi) continue;
      const sv = p.server, rv = other(sv), w = p.point_winner, sn = pi.serve_number, oc = pi.outcome, pe = pi.point_end || {};
      const L = pi.speed_rally?.rally_length;
      S[sv].servePts++; if (w === sv) S[sv].serveWon++;
      { // point ending by number of the final shot (n = shot that ends it: winner = L, error = L+1), serve, who ends it, type
        const t = pe.type || '', fc = CL.finals[`S${st.set_number}, G${g.game_number}, P${p.point_number}`];
        // XW / XE: winner / error after an "opponent_winner" / "opponent_error" shot (outcome of the extreme phase)
        const kind = fc === 'x_win' ? 'XW' : fc === 'x_err' ? 'XE' : /_win$/.test(t) ? 'W' : /_ue$/.test(t) ? 'UE' : /_fe$/.test(t) ? 'FE' : null;
        const n0 = /_win$/.test(t) ? L : L + 1;
        if (kind && L != null && !t.startsWith('ret')) { const n = n0, key = `${sn === 2 ? 2 : 1}|${n >= 9 ? '9+' : n}|${pe.player === sv ? 'srv' : 'rcv'}|${kind}`; S[sv].endIdx ??= {}; S[sv].endIdx[key] = (S[sv].endIdx[key] || 0) + 1; }
      }
      if (L >= 3) { const b = 'sr' + (sn === 2 ? 2 : 1) + BANDS(L); S[sv][b] = (S[sv][b] || 0) + 1; if (w === sv) S[sv][b + 'W'] = (S[sv][b + 'W'] || 0) + 1; } // serve points with a rally, by band
      S[rv].retPts++; if (w === rv) S[rv].retWon++;
      if (oc === 'double_fault') { S[sv].dfs++; S[sv].first++; S[sv].second++; S[rv].ret2++; if (w === rv) S[rv].ret2Won++; }
      else {
        const first = sn === 1 || oc === '1st_serve' || (oc === 'ace' && sn === 1);
        if (first) { S[sv].first++; S[sv].firstIn++; if (w === sv) S[sv].firstWon++; S[rv].ret1++; if (w === rv) S[rv].ret1Won++; }
        else { S[sv].first++; S[sv].second++; if (w === sv) S[sv].secondWon++; S[rv].ret2++; if (w === rv) S[rv].ret2Won++; }
        if (oc === 'ace') S[sv].aces++;
        // returns in play: serves in play minus aces minus missed returns
        const retErr = pe.player === rv && (pe.type === 'ret_ue' || pe.type === 'ret_fe');
        if (first) { S[rv].retInDen1++; if (oc !== 'ace' && !retErr) S[rv].retIn1++; } else { S[rv].retInDen2++; if (oc !== 'ace' && !retErr) S[rv].retIn2++; }
      }
      if (pe.player && /^(fh|bh|vol)_(ue|fe)$/.test(pe.type)) { const ph = pi.phase?.[pe.player]?.type || 'none'; S[pe.player]['errPh_' + pe.type.split('_')[1] + '_' + ph] = (S[pe.player]['errPh_' + pe.type.split('_')[1] + '_' + ph] || 0) + 1; }
      for (const k of pk) {
        const ph = pi.phase?.[k]?.type || 'none'; S[k]['ph_' + ph] = (S[k]['ph_' + ph] || 0) + 1; if (w !== k) S[k]['phL_' + ph] = (S[k]['phL_' + ph] || 0) + 1;
        S[k].pts++; if (w === k) S[k].won++;
        if (L) { S[k].rlSum += L; S[k].rlN++; const b = BANDS(L); S[k][b]++; if (w === k) S[k][b + 'W']++; if (L >= 3) S[k].rallyPts++; }
        const net = pi.speed_rally?.net_point?.[k]?.score, drop = pi.speed_rally?.drop_shots?.[k]?.score;
        if (net) { S[k].netPts++; if (w === k) S[k].netWon++; }
        if (drop) S[k].drops += drop;
      }
      if (pe.type && pe.player && S[pe.player][pe.type] !== undefined) S[pe.player][pe.type]++;
      if (/^ret_(ue|fe)$/.test(pe.type) && pe.player) S[pe.player][pe.type + (sn === 2 ? 2 : 1)]++;
      if (!pe.type && oc !== 'ace' && oc !== 'double_fault' && L === 1) S[sv].svcWin++; // unreturned serve that is not an ace
    }
    // --- phases, serve effectiveness ---
    if (perf) {
      const cap = perf.comparison_metrics.capitalisation, bop = perf.battles.balance_of_power;
      for (const k of pk) {
        S[k].conv = cap.conversion[k].frequency || 0; S[k].convDen = cap.conversion[k].frequency_total || 0;
        S[k].steal = cap.steal[k].frequency || 0; S[k].stealDen = cap.steal[k].frequency_total || 0;
        S[k].bop = bop[k].score;
        for (const [sn, key] of [['1', '1st_serve'], ['2', '2nd_serve']]) {
          const bs = perf.breakdown_metrics.serve_effectiveness[key].breakdown_scores;
          S[k]['se' + sn + 'Den'] = bs[0][k].frequency_total || 0;
          for (const b of bs) S[k]['se' + sn][b.id] = b[k].frequency || 0;
        }
      }
    }
    // --- rally shots: frequency and outcome by play type ---
    for (const k of pk) {
      // outcomes by direction (landing zone in the receiver's frame; net shots excluded), as in build.mjs
      const G = { winner: 'hot', in_attack: 'hot', opponent_error: 'hot', neutral: 'neutral', error: 'cold', fe: 'cold', in_defence: 'cold', opponent_winner: 'cold' };
      S[k].dir = {};
      for (const s of CL.shots[k]) { if (!G[s.cls] || s.to_x == null || s.to_y == null || Math.abs(s.to_y) < 1) continue; const z = { L: 'R', M: 'M', R: 'L' }[s.to_x < -1.37 ? 'L' : s.to_x > 1.37 ? 'R' : 'M']; const c = ((S[k].dir[s.play] ??= {})[z] ??= { hot: 0, neutral: 0, cold: 0 }); c[G[s.cls]]++; }
      // returns by side and direction: won, lost, missed (return_placement)
      S[k].retDir = { deuce: {}, ad: {} };
      for (const [side, locs] of [['ad', ['1', '2', '3']], ['deuce', ['4', '5', '6']]]) for (const sn of ['1', '2']) for (const loc of locs) {
        const dd = get('/court_graphics', { graphic_type: 'return_placement', player: k, serve: sn, serve_location: loc, pressure_break: 'all', averages: 'no', out_shots: 'yes' });
        for (const s of dd?.shots || []) { const z = s.x < -1.37 ? 'L' : s.x > 1.37 ? 'R' : 'M', c = (S[k].retDir[side][z] ??= { won: 0, lost: 0, err: 0 }); if (s.display_type === 'error') c.err++; else if (s.display_type === 'lost') c.lost++; else c.won++; }
      }
      // reclassified rally shots (classify.mjs): counts by play and class
      for (const s of CL.shots[k]) { const c = (S[k].plays[s.play] ??= { n: 0 }); c.n++; c[s.cls] = (c[s.cls] || 0) + 1; }
      S[k].post = CL.post[k];
      for (const sn of ['1', '2']) for (const [side, da] of [['deuce', 'deuce'], ['ad', 'advantage']]) {
        const dd = get('/court_graphics', { graphic_type: 'serve_plus_one', player: k, serve: sn, deuce_advantage: da, pressure_break: 'all', averages: 'no' });
        if (dd) { S[k].s1[side].fh += dd.forehand.usage.frequency || 0; S[k].s1[side].bh += dd.backhand.usage.frequency || 0; }
      }
    }
    out.matches.push({ id, date: meta.date, surface: meta.surface, result: m.export_info.result, players: pk.map(k => pid[k]), stats: pk.map(k => S[k]) });
  }
}
fs.writeFileSync('data/real_stats.json', JSON.stringify(out));
console.log('ok:', out.matches.length, 'matches');
