// Reclassification of rally shots based on how the point actually ends.
// In the TennisViz data:
// - the final unforced error is tagged cold/error, the final forced error is tagged neutral (no reason);
// - "opponent_error" and "opponent_winner" sit on the second-to-last shot: they say the next shot is an error / a winner.
// The engine generates those final shots with the extreme phases: here they are separated, so they are not counted twice.
// Classes: winner, in_attack, opponent_error, neutral, fe (forced error), error (unforced error), in_defence,
// opponent_winner, x_err / x_win (final shot after opponent_error / opponent_winner: outcome of the extreme phase).

const FAM = p => (p.startsWith('forehand') ? 'fh' : p.startsWith('backhand') ? 'bh' : p === 'volleys' ? 'vol' : 'drop');
const other = k => (k === 'player1' ? 'player2' : 'player1');
const TAG_OK = { win: 'winner', ue: 'error', fe: null }; // expected reason on the final shot

export function classifyMatch(R) {
  const get = (ep, p = {}) => R.find(r => r.endpoint === ep && Object.entries(p).every(([k, v]) => r.params[k] === v))?.data;
  const pbp = get('/point_by_point'), byPt = {}, all = { player1: [], player2: [] };
  for (const k of ['player1', 'player2']) for (const p of get('/hot_and_cold_plays', { player: k, set: 'all', averages: 'no' }) || []) for (const s of p.shots) {
    const x = { ...s, play: p.play_id, cls: null };
    all[k].push(x); ((byPt[s.set_game_point] ??= { player1: [], player2: [] })[k]).push(x);
  }
  // outcome of errors and winners after an "opponent_error" / "opponent_winner" shot, for the player who receives it
  const post = { player1: { ue: 0, fe: 0, win: 0, other: 0 }, player2: { ue: 0, fe: 0, win: 0, other: 0 } };
  const stat = { found: 0, notFound: 0 };
  const finals = {}; // per point (set_game_point): class of the final shot
  for (const st of pbp.sets) for (const g of st.games) for (const p of g.points) {
    const pi = p.point_info, sh = byPt[`S${st.set_number}, G${g.game_number}, P${p.point_number}`];
    if (!pi || !sh) continue;
    const pe = pi.point_end || {}, t = pe.type || '';
    let fin = null, kind = null;
    if (/^(fh|bh|vol)_/.test(t)) {
      const [f0, k0] = t.split('_'); kind = k0;
      const mine = sh[pe.player], fam = s => FAM(s.play) === f0 || FAM(s.play) === 'drop';
      const tagOk = s => s.hot_cold_reason === TAG_OK[kind];
      // final shot: same speed and same family (forehand/backhand/volley); on ties, the reason consistent with the outcome
      let c = mine.filter(s => s.shot_speed === pe.speed && fam(s));
      if (c.length > 1 && c.some(tagOk)) c = c.filter(tagOk);
      if (!c.length) c = mine.filter(s => tagOk(s) && fam(s));
      fin = c[0] || null;
      if (fin) stat.found++; else stat.notFound++;
    }
    const oppTags = r => (fin ? sh[other(pe.player)].some(s => s.hot_cold_reason === r) : false);
    for (const k of ['player1', 'player2']) for (const s of sh[k]) {
      if (s === fin) {
        if ((kind === 'ue' || kind === 'fe') && oppTags('opponent_error')) { s.cls = 'x_err'; post[k][kind]++; }
        else if (kind === 'win' && oppTags('opponent_winner')) { s.cls = 'x_win'; post[k].win++; }
        else s.cls = kind === 'win' ? 'winner' : kind === 'ue' ? 'error' : 'fe';
        finals[s.set_game_point] = s.cls;
      } else {
        // non-final shot: the reason stays; "winner" and "error" on a non-final shot (very rare) become neutral
        const r = s.hot_cold_reason;
        s.cls = r == null || r === 'winner' || r === 'error' ? 'neutral' : r;
      }
    }
  }
  // shots of points missing from point_by_point: keep the original reason
  for (const k of ['player1', 'player2']) for (const s of all[k]) if (!s.cls) s.cls = s.hot_cold_reason ?? 'neutral';
  return { shots: all, post, stat, finals };
}

export const GROUP = { winner: 'hot', in_attack: 'hot', opponent_error: 'hot', neutral: 'neutral', error: 'cold', fe: 'cold', in_defence: 'cold', opponent_winner: 'cold' };
export const REASONS = { hot: ['winner', 'in_attack', 'opponent_error'], cold: ['error', 'fe', 'in_defence', 'opponent_winner'] };
