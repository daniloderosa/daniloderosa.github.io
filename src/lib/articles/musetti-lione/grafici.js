// @ts-nocheck  (i dati arrivano da un JSON senza tipi: qui si leggono per chiave)
/**
 * DATI DEI GRAFICI: qui i numeri di dati.json diventano le "righe" che i
 * componenti in componenti/ sanno disegnare. I numeri non sono scritti a mano:
 * se un dato cambia, si corregge dati.json e i grafici si aggiornano.
 *
 * `creaGrafici(lang)` costruisce i dati nella lingua scelta ('it' o 'en'):
 * stessi numeri, ma scritte, riassunti per i lettori di schermo, tabelle e
 * formati (virgola o punto decimale) nella lingua della pagina.
 *   - le piccole scritte stanno in etichette.js
 *   - le frasi lunghe (riassunti, note delle tabelle) stanno qui sotto, in `FRASI`
 */
import datiGrezzi from './dati.json';
import { formati } from './formato.js';
import { etichette } from './etichette.js';

const dati = datiGrezzi;
const B = dati.blocks;

/* =========================================================================
   FRASI per i lettori di schermo e per le tabelle, nelle due lingue.
   Sono funzioni: ricevono i numeri gia scritti nel formato della lingua.
   ========================================================================= */
const FRASI = {
  it: {
    a1: {
      intro: 'Percentuale di punti vinti con la propria seconda di servizio. ',
      partita: (c, m, o) => `Contro ${c}: Musetti ${m}, avversario ${o}.`,
      chiusura: (tp, tw, tn, me, tour) =>
        ` Nel torneo Musetti ha vinto il ${tp} (${tw}/${tn}); la sua media delle ultime 52 settimane è ${me}% e quella del Tour ${tour}%.`,
      tabIntest: ['Partita', 'Musetti', 'Avversario'],
      tabNota: 'Punti vinti con la propria seconda di servizio, con il conteggio tra parentesi. Medie delle ultime 52 settimane.',
    },
    a3: {
      intro: "Dove sono andate le seconde di servizio di Musetti, rispetto all'avversario destrimane. ",
      torneo: (n, bh, bhp, fh, fhp, bo, bop) =>
        `Nel torneo (${n} seconde): ${bh} in zona rovescio (${bhp}), ${fh} in zona dritto (${fhp}), ${bo} al corpo (${bop}). `,
      finale: (n, bh, bhp, fh, bo) =>
        `In finale contro Fritz (${n} seconde): ${bh} in zona rovescio (${bhp}), ${fh} in zona dritto, ${bo} al corpo. La zona è una stima.`,
      tabNota: 'Quota delle seconde in campo per zona del colpo avversario, con il numero di seconde. La zona è una stima; il servizio al corpo non è attribuito a rovescio o dritto.',
    },
    a4: {
      intro: 'Dove Musetti colpisce la risposta alla seconda di servizio: dentro il campo, entro 2 metri dietro la linea di fondo, oltre 2 metri. ',
      partita: (c, v) => `Contro ${c}: ${v}%.`,
      chiusura: (me, tour) => ` Media personale ${me}%; Tour circa ${tour}%.`,
      tabIntest: 'Partita',
      tabNota: "Quota delle risposte alla seconda di servizio di Musetti, per posizione al momento dell'impatto rispetto alla linea di fondo. Le ultime due righe sono le medie delle ultime 52 settimane (Tour: valori approssimati).",
    },
    b1: {
      intro: 'Quota di colpi di variazione sul totale dei colpi, partita per partita. ',
      partita: (c, m, o) => `Contro ${c}: Musetti ${m}, avversario ${o}.`,
      chiusura: (tp, v, t, me, tour) =>
        ` Nel torneo Musetti ${tp} (${v} su ${t}); media personale ${me}%, Tour ${tour}%.`,
      tabNota: 'Quota di colpi di variazione sul totale dei colpi. Medie delle ultime 52 settimane.',
    },
    b3: {
      intro: (imp, colpi, media) =>
        `Impatto del rovescio incrociato, cioè quota di colpi hot meno quota di colpi cold. Musetti nel torneo: ${imp}% su ${colpi} colpi (60 hot, 100 cold); media dei cinque avversari ${media}%. `,
      partita: (turno, c, m, o) => `${turno} contro ${c}: Musetti ${m}%, avversario ${o}%.`,
      chiusura: (me, tour) => ` Media personale di Musetti circa ${me}%, Tour circa ${tour}%.`,
      tabIntest: ['Partita', 'Impatto di Musetti', "Impatto dell'avversario", 'Colpi di Musetti: hot / cold / totale'],
      tabNota: (medie) =>
        `Impatto del rovescio incrociato: quota di colpi hot meno quota di colpi cold. Nella riga del torneo l'impatto dell'avversario è la media dei cinque avversari. Medie delle ultime 52 settimane: ${medie} (valori stimati).`,
    },
  },

  en: {
    a1: {
      intro: "Percentage of points won on a player's own second serve. ",
      partita: (c, m, o) => `Against ${c}: Musetti ${m}, opponent ${o}.`,
      chiusura: (tp, tw, tn, me, tour) =>
        ` In the tournament Musetti won ${tp} (${tw}/${tn}); his 52-week average is ${me}% and the Tour average ${tour}%.`,
      tabIntest: ['Match', 'Musetti', 'Opponent'],
      tabNota: 'Points won on a player\'s own second serve, with the count in parentheses. 52-week averages.',
    },
    a3: {
      intro: "Where Musetti's second serves went, relative to a right-handed opponent. ",
      torneo: (n, bh, bhp, fh, fhp, bo, bop) =>
        `In the tournament (${n} second serves): ${bh} to the backhand side (${bhp}), ${fh} to the forehand side (${fhp}), ${bo} at the body (${bop}). `,
      finale: (n, bh, bhp, fh, bo) =>
        `In the final against Fritz (${n} second serves): ${bh} to the backhand side (${bhp}), ${fh} to the forehand side, ${bo} at the body. The zone is an estimate.`,
      tabNota: 'Share of second serves in, by zone of the opponent\'s shot, with the number of serves. The zone is an estimate; body serves are not attributed to the backhand or the forehand.',
    },
    a4: {
      intro: "Where Musetti hits his return of second serve: inside the baseline, within 2 meters behind the baseline, more than 2 meters behind. ",
      partita: (c, v) => `Against ${c}: ${v}%.`,
      chiusura: (me, tour) => ` Personal average ${me}%; Tour approximately ${tour}%.`,
      tabIntest: 'Match',
      tabNota: "Share of Musetti's returns of second serve, by position at the moment of contact relative to the baseline. The last two rows are 52-week averages (Tour: approximate values).",
    },
    b1: {
      intro: 'Share of variation shots out of all shots, match by match. ',
      partita: (c, m, o) => `Against ${c}: Musetti ${m}, opponent ${o}.`,
      chiusura: (tp, v, t, me, tour) =>
        ` In the tournament Musetti ${tp} (${v} of ${t}); personal average ${me}%, Tour ${tour}%.`,
      tabNota: 'Share of variation shots out of all shots. 52-week averages.',
    },
    b3: {
      intro: (imp, colpi, media) =>
        `Impact of the crosscourt backhand, meaning the share of hot shots minus the share of cold shots. Musetti in the tournament: ${imp}% over ${colpi} shots (60 hot, 100 cold); average of the five opponents ${media}%. `,
      partita: (turno, c, m, o) => `${turno} against ${c}: Musetti ${m}%, opponent ${o}%.`,
      chiusura: (me, tour) => ` Musetti's personal average about ${me}%, Tour about ${tour}%.`,
      tabIntest: ['Match', "Musetti's impact", "Opponent's impact", "Musetti's shots: hot / cold / total"],
      tabNota: (medie) =>
        `Impact of the crosscourt backhand: share of hot shots minus share of cold shots. In the tournament row, the opponent's impact is the average of the five opponents. 52-week averages: ${medie} (estimated values).`,
    },
  },
};

/**
 * Costruisce i dati di tutti i grafici nella lingua scelta.
 * @param {'it' | 'en'} lang
 */
export function creaGrafici(lang) {
  const { num, perc, migliaia, segno } = formati(lang);
  const E = etichette[lang];
  const F = FRASI[lang];

  /* Le cinque partite, in ordine di turno: R1, R2, QF, SF, F. */
  const partite = dati.matches.map((/** @type {any} */ m) => ({
    key: m.key,
    // "Matteo Arnaldi" -> "Arnaldi", "Luca Van Assche" -> "Van Assche"
    cognome: m.opponent.split(' ').slice(1).join(' '),
    turno: E.turni[m.key],
  }));

  /** Le due linee di riferimento (media di Musetti e media del Tour). */
  const riferimenti = (valoreMusetti, valoreTour, testo) => [
    { value: valoreMusetti, tipo: 'musetti', nome: E.suaMediaBreve, nomeLungo: E.suaMedia, testo: testo(valoreMusetti) },
    { value: valoreTour, tipo: 'tour', nome: E.mediaTourBreve, nomeLungo: E.mediaTour, testo: testo(valoreTour) },
  ];

  /* =======================================================================
     A1 - Punti vinti con la seconda (dumbbell: Musetti e avversario per riga)
     ======================================================================= */
  const sp = B.A1.second_serve_points_won;

  const a1 = {
    tabella: null, // si riempie in fondo
    domain: [20, 80],
    ticks: [40, 60, 80],
    righe: partite.map((p, i) => {
      const m = sp.musetti[i];
      const o = sp.opponent[i];
      return {
        key: p.key,
        label: p.cognome,
        sub: p.turno,
        a: {
          value: m.pct, // posizione sull'asse: il valore esatto, non l'arrotondato
          text: `${perc(m.pct)} (${m.won}/${m.played})`,
        },
        b: {
          value: o.pct,
          text: `${perc(o.pct)} (${o.won}/${o.played})`,
        },
      };
    }),
    riferimenti: riferimenti(sp.reference_pct.musetti_52w_avg, sp.reference_pct.tour_avg, (v) => perc(v)),
    summary:
      F.a1.intro +
      sp.musetti
        .map((m, i) =>
          F.a1.partita(
            partite[i].cognome,
            `${perc(m.pct)} (${m.won}/${m.played})`,
            `${perc(sp.opponent[i].pct)} (${sp.opponent[i].won}/${sp.opponent[i].played})`,
          ),
        )
        .join(' ') +
      F.a1.chiusura(
        perc(sp.tournament.pct),
        sp.tournament.won,
        sp.tournament.played,
        sp.reference_pct.musetti_52w_avg,
        sp.reference_pct.tour_avg,
      ),
  };

  /* =======================================================================
     A3 - Dove va la seconda (barre al 100%, torneo e finale)
     ======================================================================= */
  const z = B.A3;
  const zt = z.tournament_incl_final;

  /**
   * Tre segmenti: zona rovescio, zona dritto, corpo (il corpo non e attribuito).
   * @param {any} c  conteggi per zona (bh_zone, fh_zone, body, total)
   */
  function zone(c) {
    return [
      { nome: E.zone[0], count: c.bh_zone, tono: 5 },
      { nome: E.zone[1], count: c.fh_zone, tono: 3 },
      { nome: E.zone[2], count: c.body, tono: 1 },
    ].map((s) => ({ ...s, value: (s.count / c.total) * 100 }));
  }

  const a3 = {
    tabella: null,
    barre: [
      {
        key: 'torneo',
        label: E.barraTorneo(zt.counts.total),
        totale: zt.counts.total,
        parti: zone(zt.counts),
      },
      {
        key: 'finale',
        label: E.barraFinale(z.final.counts.total),
        totale: z.final.counts.total,
        parti: zone(z.final.counts),
      },
    ],
    summary:
      F.a3.intro +
      F.a3.torneo(
        zt.counts.total,
        zt.counts.bh_zone,
        perc(zt.opponent_stroke_zone_pct.backhand),
        zt.counts.fh_zone,
        perc(zt.opponent_stroke_zone_pct.forehand),
        zt.counts.body,
        perc(zt.opponent_stroke_zone_pct.body_unattributed),
      ) +
      F.a3.finale(
        z.final.counts.total,
        z.final.counts.bh_zone,
        perc(z.final.opponent_stroke_zone_pct.backhand),
        z.final.counts.fh_zone,
        z.final.counts.body,
      ),
  };

  /* =======================================================================
     A4 - Da dove risponde alla seconda (barre al 100% per partita)
     ======================================================================= */
  const pos = B.A4.second_serve_return_position_pct;

  /** @param {number[]} v  quote in % */
  const fasceA4 = (v) =>
    v.map((value, i) => ({
      nome: E.fasce[i],
      value,
      count: null,
      tono: [1, 3, 5][i],
    }));

  const a4 = {
    tabella: null,
    legenda: E.fasce.map((nome, i) => ({ nome, tono: [1, 3, 5][i] })),
    barre: [
      ...partite.map((p) => ({
        key: p.key,
        label: p.cognome,
        sub: p.turno,
        parti: fasceA4(pos[p.key]),
      })),
      // Due barre di riferimento, staccate dalle partite
      {
        key: 'media',
        label: E.suaMedia,
        sub: E.sett52,
        riferimento: true,
        parti: fasceA4(B.A4.reference.musetti_52w_avg),
      },
      {
        key: 'tour',
        label: E.mediaTour,
        sub: E.sett52,
        riferimento: true,
        parti: fasceA4(B.A4.reference.tour_approx),
      },
    ],
    summary:
      F.a4.intro +
      partite.map((p) => F.a4.partita(p.cognome, pos[p.key].join('%, '))).join(' ') +
      F.a4.chiusura(B.A4.reference.musetti_52w_avg.join('%, '), B.A4.reference.tour_approx.join('%, ')),
  };

  /* =======================================================================
     B1 - Colpi di variazione (dumbbell, solo percentuali)
     ======================================================================= */
  const vr = B.B1.variation_shots_pct;

  const b1 = {
    tabella: null,
    domain: [10, 45],
    ticks: [20, 30, 40],
    righe: partite.map((p) => ({
      key: p.key,
      label: p.cognome,
      sub: p.turno,
      a: { value: vr.musetti[p.key], text: perc(vr.musetti[p.key]) },
      b: { value: vr.opponent[p.key], text: perc(vr.opponent[p.key]) },
    })),
    riferimenti: [
      {
        value: B.B1.reference_pct.musetti_52w_avg,
        tipo: 'musetti',
        nome: E.suaMediaBreve,
        nomeLungo: E.suaMedia,
        testo: perc(B.B1.reference_pct.musetti_52w_avg),
      },
      {
        value: B.B1.reference_pct.tour_avg,
        tipo: 'tour',
        nome: E.mediaTourBreve,
        nomeLungo: E.mediaTour,
        testo: perc(B.B1.reference_pct.tour_avg),
      },
    ],
    summary:
      F.b1.intro +
      partite
        .map((p) => F.b1.partita(p.cognome, perc(vr.musetti[p.key]), perc(vr.opponent[p.key])))
        .join(' ') +
      F.b1.chiusura(
        perc(B.B1.tournament.pct),
        B.B1.tournament.variation,
        migliaia(B.B1.tournament.total_shots),
        B.B1.reference_pct.musetti_52w_avg,
        num(B.B1.reference_pct.tour_avg),
      ),
  };

  /* =======================================================================
     B3 - Impatto del rovescio incrociato (barre divergenti)
     Impatto = quota di colpi hot meno quota di colpi cold.
     ======================================================================= */
  const bc = B.B3.backhand_crosscourt;
  const rc = B.B3.all_schemes_tournament[0].per_match; // colpi, hot, cold per partita
  const rif = bc.reference_impact_pct_approx;

  /** Impatto di un avversario: (hot - cold) / colpi, in punti percentuali. */
  /** @param {any} o */
  const impattoAvv = (o) => ((o.hot - o.cold) / o.plays) * 100;

  /* Impatto del rovescio incrociato di Arnaldi e Kouame: valori forniti
     dall'autore (Hot and Cold Plays, lettura diretta del sito), senza i conteggi
     hot/cold che ci sono invece per gli altri tre avversari. */
  const impattoAvvAutore = { R1: 5, R2: -5 };

  /** Impatto dell'avversario in una partita, in punti percentuali. */
  function impattoAvversarioPartita(key) {
    const avv = bc.opponents_same_scheme.find((o) => o.match === key);
    if (avv) return impattoAvv(avv);
    return impattoAvvAutore[key];
  }

  // Media semplice dei cinque avversari: va nella riga del torneo.
  const impattiAvversari = partite.map((p) => impattoAvversarioPartita(p.key));
  const mediaAvversari = impattiAvversari.reduce((somma, v) => somma + v, 0) / impattiAvversari.length;

  const b3 = {
    tabella: null,
    domain: [-30, 4],
    ticks: [-20, -10, 0],
    righe: [
      {
        key: 'torneo',
        // Le due righe del nome nella colonna a sinistra: "Torneo" / "5 partite"
        nomi: [E.torneoNome[0], E.torneoNome[1](partite.length)],
        musetti: { impatto: bc.tournament.impact_pct },
        avversario: { impatto: mediaAvversari },
      },
      ...partite.map((p) => ({
        key: p.key,
        nomi: [p.turno, p.cognome],
        musetti: { impatto: bc.per_match_site_impact_pct[p.key] },
        avversario: { impatto: impattoAvversarioPartita(p.key) },
      })),
    ],
    riferimenti: riferimenti(rif.musetti_52w_avg, rif.tour_avg, (v) => `${segno(v)}%`),
    summary:
      F.b3.intro(segno(bc.tournament.impact_pct), bc.tournament.plays, segno(mediaAvversari)) +
      partite
        .map((p) =>
          F.b3.partita(
            p.turno,
            p.cognome,
            segno(bc.per_match_site_impact_pct[p.key]),
            segno(impattoAvversarioPartita(p.key)),
          ),
        )
        .join(' ') +
      F.b3.chiusura(segno(rif.musetti_52w_avg), segno(rif.tour_avg)),
  };

  /* =======================================================================
     TABELLE DEI DATI
     Ogni grafico ha anche la sua tabella: si apre dall'icona della tabella
     sotto il grafico (vedi TabellaDati.svelte). Serve a chi usa lettore di
     schermo o tastiera, che nel disegno non puo "entrare", e a chiunque voglia i
     numeri esatti. { intestazioni, righe, nota }: la prima cella di ogni riga e
     il nome della riga.
     ======================================================================= */

  /** Tabella per i grafici a punti (A1, B1): una riga per partita. */
  function tabellaDumbbell(g, intestazioni, nota) {
    return {
      intestazioni,
      righe: g.righe.map((r) => [`${r.sub}, ${r.label}`, r.a.text, r.b.text]),
      nota: `${nota} ${g.riferimenti.map((r) => `${r.nomeLungo}: ${r.testo}.`).join(' ')}`,
    };
  }

  a1.tabella = tabellaDumbbell(a1, F.a1.tabIntest, F.a1.tabNota);
  b1.tabella = tabellaDumbbell(b1, F.a1.tabIntest, F.b1.tabNota);

  a3.tabella = {
    intestazioni: ['', ...E.zoneIntestazioni],
    righe: a3.barre.map((b) => [
      b.label,
      ...b.parti.map((p) => `${perc(p.value)} (${p.count}/${b.totale})`),
    ]),
    nota: F.a3.tabNota,
  };

  a4.tabella = {
    intestazioni: [F.a4.tabIntest, ...a4.legenda.map((v) => v.nome)],
    righe: a4.barre.map((b) => [`${b.label}, ${b.sub}`, ...b.parti.map((p) => `${p.value}%`)]),
    nota: F.a4.tabNota,
  };

  b3.tabella = {
    intestazioni: F.b3.tabIntest,
    righe: b3.righe.map((r, i) => {
      const conteggi =
        i === 0
          ? `${bc.tournament.hot} / ${bc.tournament.cold} / ${bc.tournament.plays}`
          : `${rc[i - 1].hot} / ${rc[i - 1].cold} / ${rc[i - 1].plays}`;
      return [
        r.nomi.join(', '),
        `${segno(r.musetti.impatto)}%`,
        `${segno(r.avversario.impatto)}%`,
        conteggi,
      ];
    }),
    nota: F.b3.tabNota(b3.riferimenti.map((r) => `${r.nomeLungo}: ${r.testo}`).join('; ')),
  };

  return { partite, a1, a3, a4, b1, b3 };
}
