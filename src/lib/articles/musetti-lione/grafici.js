// @ts-nocheck  (i dati arrivano da un JSON senza tipi: qui si leggono per chiave)
/**
 * DATI DEI GRAFICI: qui i numeri di dati.json diventano le "righe" che i
 * componenti in componenti/ sanno disegnare. Nessun numero e scritto a mano:
 * se un dato cambia, si corregge dati.json e i grafici si aggiornano.
 */
import datiGrezzi from "./dati.json";
import { num, perc, migliaia, segno } from "./formato.js";

const dati = datiGrezzi;
const B = dati.blocks;

/* Le cinque partite, in ordine di turno: R1, R2, QF, SF, F. */
export const partite = dati.matches.map((/** @type {any} */ m) => ({
  key: m.key,
  // "Matteo Arnaldi" -> "Arnaldi", "Luca Van Assche" -> "Van Assche"
  cognome: m.opponent.split(" ").slice(1).join(" "),
  turno: m.round,
}));

/* =========================================================================
   A1 - Punti vinti con la seconda (dumbbell: Musetti e avversario per riga)
   ========================================================================= */
const sp = B.A1.second_serve_points_won;

export const a1 = {
  tabella: /** @type {any} */ (null), // si riempie in fondo al file
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
  riferimenti: [
    {
      value: sp.reference_pct.musetti_52w_avg,
      tipo: "musetti",
      nome: "Sua media",
      testo: perc(sp.reference_pct.musetti_52w_avg),
    },
    {
      value: sp.reference_pct.tour_avg,
      tipo: "tour",
      nome: "Media Tour",
      testo: perc(sp.reference_pct.tour_avg),
    },
  ],
  summary:
    "Percentuale di punti vinti con la propria seconda di servizio. " +
    sp.musetti
      .map(
        (m, i) =>
          `Contro ${partite[i].cognome}: Musetti ${perc(m.pct)} (${m.won}/${m.played}), avversario ${perc(sp.opponent[i].pct)} (${sp.opponent[i].won}/${sp.opponent[i].played}).`,
      )
      .join(" ") +
    ` Nel torneo Musetti ha vinto il ${perc(sp.tournament.pct, 1)} (${sp.tournament.won}/${sp.tournament.played}); la sua media delle ultime 52 settimane è ${sp.reference_pct.musetti_52w_avg}% e quella del Tour ${sp.reference_pct.tour_avg}%.`,
};

/* =========================================================================
   A3 - Dove va la seconda (barre al 100%, torneo e finale)
   ========================================================================= */
const z = B.A3;

/**
 * Tre segmenti: zona rovescio, zona dritto, corpo (il corpo non e attribuito).
 * @param {any} c  conteggi per zona (bh_zone, fh_zone, body, total)
 */
function zone(c) {
  return [
    { nome: "rovescio", count: c.bh_zone, tono: 5 },
    { nome: "dritto", count: c.fh_zone, tono: 3 },
    { nome: "corpo", count: c.body, tono: 1 },
  ].map((s) => ({ ...s, value: (s.count / c.total) * 100 }));
}

export const a3 = {
  tabella: /** @type {any} */ (null), // si riempie in fondo al file
  barre: [
    {
      key: "torneo",
      label: `Media del torneo · ${z.tournament_incl_final.counts.total} seconde in campo`,
      decimali: 1,
      totale: z.tournament_incl_final.counts.total,
      parti: zone(z.tournament_incl_final.counts),
    },
    {
      key: "finale",
      label: `Finale con Fritz · ${z.final.counts.total} seconde`,
      decimali: 0,
      totale: z.final.counts.total,
      parti: zone(z.final.counts),
    },
  ],
  summary:
    `Dove sono andate le seconde di servizio di Musetti, rispetto all'avversario destrimane. ` +
    `Nel torneo (${z.tournament_incl_final.counts.total} seconde): ${z.tournament_incl_final.counts.bh_zone} in zona rovescio (${perc(z.tournament_incl_final.opponent_stroke_zone_pct.backhand, 1)}), ${z.tournament_incl_final.counts.fh_zone} in zona dritto (${perc(z.tournament_incl_final.opponent_stroke_zone_pct.forehand, 1)}), ${z.tournament_incl_final.counts.body} al corpo (${perc(z.tournament_incl_final.opponent_stroke_zone_pct.body_unattributed, 1)}). ` +
    `In finale contro Fritz (${z.final.counts.total} seconde): ${z.final.counts.bh_zone} in zona rovescio (${perc(z.final.opponent_stroke_zone_pct.backhand)}), ${z.final.counts.fh_zone} in zona dritto, ${z.final.counts.body} al corpo. La zona è una stima.`,
};

/* =========================================================================
   A4 - Da dove risponde alla seconda (barre al 100% per partita)
   ========================================================================= */
const pos = B.A4.second_serve_return_position_pct;
const fasce = B.A4.bands; // dentro il campo / 0-2 m dietro / oltre 2 m

/** @param {number[]} v  quote in % */
const fasceA4 = (v) =>
  v.map((value, i) => ({
    nome: fasce[i],
    value,
    count: null,
    tono: [1, 3, 5][i],
  }));

export const a4 = {
  tabella: /** @type {any} */ (null), // si riempie in fondo al file
  legenda: [
    "Dentro il campo",
    "0-2 m dietro la linea",
    "Oltre 2 m dietro la linea",
  ].map((nome, i) => ({
    nome,
    tono: [1, 3, 5][i],
  })),
  barre: [
    ...partite.map((p) => ({
      key: p.key,
      label: p.cognome,
      sub: p.turno,
      parti: fasceA4(pos[p.key]),
    })),
    // Due barre di riferimento, staccate dalle partite
    {
      key: "media",
      label: "Sua media",
      sub: "52 sett.",
      riferimento: true,
      parti: fasceA4(B.A4.reference.musetti_52w_avg),
    },
    {
      key: "tour",
      label: "Media Tour",
      sub: "52 sett.",
      riferimento: true,
      parti: fasceA4(B.A4.reference.tour_approx),
    },
  ],
  summary:
    "Dove Musetti colpisce la risposta alla seconda di servizio: dentro il campo, entro 2 metri dietro la linea di fondo, oltre 2 metri. " +
    partite
      .map((p) => `Contro ${p.cognome}: ${pos[p.key].join("%, ")}%.`)
      .join(" ") +
    ` Media personale ${B.A4.reference.musetti_52w_avg.join("%, ")}%; Tour circa ${B.A4.reference.tour_approx.join("%, ")}%.`,
};

/* =========================================================================
   B1 - Colpi di variazione (dumbbell, solo percentuali)
   ========================================================================= */
const vr = B.B1.variation_shots_pct;

export const b1 = {
  tabella: /** @type {any} */ (null), // si riempie in fondo al file
  domain: [10, 45],
  ticks: [20, 30, 40],
  righe: partite.map((p) => ({
    key: p.key,
    label: p.cognome,
    sub: p.turno,
    a: {
      value: vr.musetti[p.key],
      text: perc(vr.musetti[p.key], 1),
    },
    b: {
      value: vr.opponent[p.key],
      text: perc(vr.opponent[p.key], 1),
    },
  })),
  riferimenti: [
    {
      value: B.B1.reference_pct.musetti_52w_avg,
      tipo: "musetti",
      nome: "Sua media",
      testo: perc(B.B1.reference_pct.musetti_52w_avg),
    },
    {
      value: B.B1.reference_pct.tour_avg,
      tipo: "tour",
      nome: "Media Tour",
      testo: perc(B.B1.reference_pct.tour_avg, 1),
    },
  ],
  summary:
    "Quota di colpi di variazione sul totale dei colpi, partita per partita. " +
    partite
      .map(
        (p) =>
          `Contro ${p.cognome}: Musetti ${perc(vr.musetti[p.key], 1)}, avversario ${perc(vr.opponent[p.key], 1)}.`,
      )
      .join(" ") +
    ` Nel torneo Musetti ${perc(B.B1.tournament.pct, 1)} (${B.B1.tournament.variation} su ${migliaia(B.B1.tournament.total_shots)}); media personale ${B.B1.reference_pct.musetti_52w_avg}%, Tour ${num(B.B1.reference_pct.tour_avg, 1)}%.`,
};

/* =========================================================================
   B3 - Impatto del rovescio incrociato (barre divergenti)
   Impatto = quota di colpi hot meno quota di colpi cold.
   ========================================================================= */
const bc = B.B3.backhand_crosscourt;
const rc = B.B3.all_schemes_tournament[0].per_match; // colpi, hot, cold per partita

/** @param {string} key */
const contro = (key) => /** @type {any} */ (partite.find((p) => p.key === key));

/** Impatto di un avversario: (hot - cold) / colpi, in punti percentuali. */
/** @param {any} o */
const impattoAvv = (o) => ((o.hot - o.cold) / o.plays) * 100;

/* Impatto del rovescio incrociato di Arnaldi e Kouamé: valori forniti
   dall'autore (Hot and Cold Plays, lettura diretta del sito), senza i conteggi
   hot/cold che ci sono invece per gli altri tre avversari. */
const impattoAvvAutore = { R1: 5, R2: -5 };

/** Impatto dell'avversario in una partita, in punti percentuali (o undefined). */
function impattoAvversarioPartita(key) {
  const avv = bc.opponents_same_scheme.find((o) => o.match === key);
  if (avv) return impattoAvv(avv);
  return impattoAvvAutore[key];
}

// Media semplice dei cinque avversari: va nella riga del torneo.
const impattiAvversari = partite.map((p) => impattoAvversarioPartita(p.key));
const mediaAvversari =
  impattiAvversari.reduce((somma, v) => somma + v, 0) / impattiAvversari.length;

export const b3 = {
  tabella: /** @type {any} */ (null), // si riempie in fondo al file
  domain: [-30, 4],
  ticks: [-20, -10, 0],
  righe: [
    {
      key: "torneo",
      label: "Torneo, cinque partite",
      musetti: { impatto: bc.tournament.impact_pct, decimali: 1 },
      avversario: { impatto: mediaAvversari, decimali: 1 },
    },
    ...partite.map((p) => ({
      key: p.key,
      label: `${p.turno} · ${p.cognome}`,
      musetti: { impatto: bc.per_match_site_impact_pct[p.key], decimali: 0 },
      avversario: { impatto: impattoAvversarioPartita(p.key), decimali: 0 },
    })),
  ],
  riferimenti: [
    {
      value: bc.reference_impact_pct_approx.musetti_52w_avg,
      tipo: "musetti",
      nome: "Sua media",
      testo: `${segno(bc.reference_impact_pct_approx.musetti_52w_avg)}%`,
    },
    {
      value: bc.reference_impact_pct_approx.tour_avg,
      tipo: "tour",
      nome: "Media Tour",
      testo: `${segno(bc.reference_impact_pct_approx.tour_avg)}%`,
    },
  ],
  summary:
    `Impatto del rovescio incrociato, cioè quota di colpi hot meno quota di colpi cold. Musetti nel torneo: ${segno(bc.tournament.impact_pct, 1)}% su ${bc.tournament.plays} colpi (60 hot, 100 cold); media dei cinque avversari ${segno(mediaAvversari, 1)}%. ` +
    partite
      .map(
        (p) =>
          `${p.turno} contro ${p.cognome}: Musetti ${segno(bc.per_match_site_impact_pct[p.key])}%, avversario ${segno(impattoAvversarioPartita(p.key))}%.`,
      )
      .join(" ") +
    ` Media personale di Musetti circa ${segno(bc.reference_impact_pct_approx.musetti_52w_avg)}%, Tour circa ${segno(bc.reference_impact_pct_approx.tour_avg)}%.`,
};

/* =========================================================================
   TABELLE DEI DATI
   Ogni grafico ha anche la sua tabella: si apre dal pulsante "Dati in tabella"
   sotto il grafico (vedi TabellaDati.svelte). Serve a chi usa lettore di
   schermo o tastiera, che nel disegno non puo "entrare", e a chiunque voglia i
   numeri esatti. { intestazioni, righe, nota }: la prima cella di ogni riga e
   il nome della riga.
   ========================================================================= */

/** Tabella per i grafici a punti (A1, B1): una riga per partita. */
function tabellaDumbbell(g, intestazioni, nota) {
  return {
    intestazioni,
    righe: g.righe.map((r) => [`${r.sub}, ${r.label}`, r.a.text, r.b.text]),
    nota: `${nota} ${g.riferimenti.map((r) => `${r.nome}: ${r.testo}.`).join(" ")}`,
  };
}

a1.tabella = tabellaDumbbell(
  a1,
  ["Partita", "Musetti", "Avversario"],
  "Punti vinti con la propria seconda di servizio, con il conteggio tra parentesi. Medie delle ultime 52 settimane.",
);

b1.tabella = tabellaDumbbell(
  b1,
  ["Partita", "Musetti", "Avversario"],
  "Quota di colpi di variazione sul totale dei colpi. Medie delle ultime 52 settimane.",
);

a3.tabella = {
  intestazioni: ["", "Zona rovescio", "Zona dritto", "Al corpo"],
  righe: a3.barre.map((b) => [
    b.label,
    ...b.parti.map((p) => `${perc(p.value, b.decimali)} (${p.count}/${b.totale})`),
  ]),
  nota: "Quota delle seconde in campo per zona del colpo avversario, con il numero di seconde. La zona è una stima; il servizio al corpo non è attribuito a rovescio o dritto.",
};

a4.tabella = {
  intestazioni: ["Partita", ...a4.legenda.map((v) => v.nome)],
  righe: a4.barre.map((b) => [
    `${b.label}, ${b.sub}`,
    ...b.parti.map((p) => `${p.value}%`),
  ]),
  nota: "Quota delle risposte alla seconda di servizio di Musetti, per posizione al momento dell'impatto rispetto alla linea di fondo. Le ultime due righe sono le medie delle ultime 52 settimane (Tour: valori approssimati).",
};

b3.tabella = {
  intestazioni: [
    "Partita",
    "Impatto di Musetti",
    "Impatto dell'avversario",
    "Colpi di Musetti: hot / cold / totale",
  ],
  righe: b3.righe.map((r, i) => {
    const conteggi =
      i === 0
        ? `${bc.tournament.hot} / ${bc.tournament.cold} / ${bc.tournament.plays}`
        : `${rc[i - 1].hot} / ${rc[i - 1].cold} / ${rc[i - 1].plays}`;
    return [
      r.label,
      `${segno(r.musetti.impatto, r.musetti.decimali)}%`,
      `${segno(r.avversario.impatto, r.avversario.decimali)}%`,
      conteggi,
    ];
  }),
  nota: `Impatto del rovescio incrociato: quota di colpi hot meno quota di colpi cold. Nella riga del torneo l'impatto dell'avversario è la media dei cinque avversari. Medie delle ultime 52 settimane: ${b3.riferimenti.map((r) => `${r.nome}: ${r.testo}`).join("; ")} (valori stimati).`,
};
