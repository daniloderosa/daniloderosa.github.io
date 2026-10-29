/**
 * Versione INGLESE dei testi dell'articolo (gemella di testi.it.js: stessa
 * forma, stessi nomi di export, stesse chiavi). Si traducono solo i valori,
 * perche il codice che disegna la pagina e lo stesso per le due lingue.
 * Grafia americana, come in tutto il sito.
 *
 * Campi di un blocco:
 *   id         sigla dello storyboard (A1, B3...)
 *   etichetta  nome breve sulla linguetta della scheda
 *   titolo     titolo del blocco
 *   numero     il "numero guida": cifra grande + frase che la spiega
 *   passi      i paragrafi. Se un passo e un'ipotesi o una stima e non un
 *              dato, si aggiunge  tag: 'HYPOTHESIS'  o  tag: 'ESTIMATE'
 *              (compare un'etichetta davanti al paragrafo): dati e ipotesi
 *              restano distinti.
 */

export const meta = {
  titolo: "How Musetti won the ATP 250 in Lyon",
  // Anteprima social: file in static/ e suo testo alternativo
  immagine: "/og-musetti-en.png",
  immagineAlt: "Article title: How Musetti won the ATP 250 in Lyon",
  // Sottotitolo sotto il titolo: una sola riga
  sottotitolo:
    "After 4 years, Musetti won an ATP title again, beating Fritz 6-3 6-4 in the final with a Performance Rating of 9.07, the highest of his week: where did that edge come from and, above all, how did he build his wins in the tournament?",
  // Titolo della scheda del browser e dell'anteprima social
  titoloPagina: "How Musetti won the ATP 250 in Lyon - Danilo De Rosa",
  descrizione:
    "How Lorenzo Musetti won the 2026 ATP 250 in Lyon: 5 charts to understand it.",
};

/* ------------------------------------------------------------------ */
/* Parte A - la seconda di servizio                                   */
/* ------------------------------------------------------------------ */
export const A1 = {
  id: "A1",
  etichetta: "Second serve",
  numero: {
    cifra: "59.7%",
    frase:
      "of second-serve points won in the tournament (80/134), against 55% for his personal average and 51% for the Tour",
  },
  passi: [
    {
      testo:
        "The second serve in Lyon was a weapon for Musetti. Despite a speed slightly below his personal average, over the five matches he won 59.7% of the points played on his second serve, almost five points above his 52-week average and almost nine above the Tour average.",
    },
    {
      testo:
        "In every round he did better than his opponent on the same stat: the widest gap was against Arnaldi (56% to 32%), the narrowest against Cobolli (54% to 47%), and in the final he won 14 points out of 20, or 70%, against 47% for Fritz.",
    },
  ],
};

export const A3 = {
  id: "A3",
  etichetta: "Placement",
  numero: {
    cifra: "13 out of 20",
    frase:
      "second serves (65%) to Fritz's backhand side in the final, against 42.6% for the tournament average",
  },
  passi: [
    {
      testo:
        "Musetti made good use of his second-serve placement: compared with the tournament average, against Fritz in the final the share of second serves aimed at the opponent's backhand rose to 13 out of 20, or 65%.",
    },
    {
      testo:
        "Twenty second serves are not many to draw solid conclusions from, but the returns point in the same direction: Fritz hit a backhand return (across first and second serves) 61.3% of the time, against 55.8% on average for Musetti's opponents in the tournament.",
    },

    {
      tag: "ESTIMATE",
      testo:
        "The shot used to return the second serve is an estimate, because we have the direction of the serve but not the opponent's stroke: we assumed, however, that on average a wide serve from the left is aimed at a right-hander's backhand, as is a serve down the T from the right.",
    },
  ],
};

export const A4 = {
  id: "A4",
  etichetta: "Return",
  numero: {
    cifra: "81%",
    frase:
      "of Musetti's returns of Fritz's second serve hit from more than two meters behind the baseline, against a personal average of 61%",
  },
  passi: [
    {
      testo:
        "Return position also changes from opponent to opponent. On Arnaldi's second serve Musetti hit from inside the baseline 38% of the time and from more than two meters behind it only 12%; against Cobolli he stepped inside the baseline 53% of the time.",
    },
    {
      testo:
        "Against Fritz the situation is reversed: 81% of returns from more than two meters back, 19% from inside the baseline and none in the middle band, against a personal average of 61% from more than two meters back.",
    },
    {
      testo:
        "Musetti knows that Fritz has one of the best serves on the tour (his second serve averaged 159 km/h against Musetti's 148), so he almost always chose to return from far back to get the point started. Out of 16 second serves faced, only 3 times did he return from inside the baseline: his decision never to take a middle position is interesting.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Parte B - il rovescio                                              */
/* ------------------------------------------------------------------ */
export const B1 = {
  id: "B1",
  etichetta: "Variation",
  numero: {
    cifra: "34.7%",
    frase: "of variation shots in the tournament, against 21.3% for the Tour",
  },
  passi: [
    {
      testo:
        "In Musetti's game about one shot in three is a variation shot: slices, drop shots, angles, lobs, net shots. In Lyon the share was 34.7% (503 shots out of 1,448), between 31.4% and 38.8% depending on the match, against 21.3% for the Tour average and 33% for his personal average.",
    },
    {
      testo:
        "It is no surprise that the opponent he faced with the lowest share of variation shots was Fritz, against whom Musetti has already shown in the past that he feels very comfortable (the head-to-head is 5-3 in Musetti's favor, with Fritz's 2 wins coming in 2022).",
    },
  ],
};

export const B3 = {
  id: "B3",
  etichetta: "Crosscourt backhand",
  numero: {
    cifra: "−11.5%",
    frase: "the impact of Musetti's crosscourt backhand in the tournament",
  },
  passi: [
    {
      testo:
        "Courtside Advantage classifies groundstrokes and net shots into nine patterns and measures their impact by counting how many are hot (winners, shots that lead to an attacking position, shots that force an error) and how many are cold (unforced errors, shots that put the opponent in an attacking position or hand him a winner). The crosscourt backhand is the shot Musetti plays most, almost one time in four, and it is the only one with a negative balance: 60 hot shots and 100 cold in five matches, with a negative balance in each one.",
    },
    {
      testo:
        "Because he plays a one-handed backhand, opponents know they can target that side to hurt Musetti, who in fact often tries to take refuge in the slice or to switch to down-the-line to avoid it.",
    },
    {
      testo:
        "Looking at the win percentages of the points in which Musetti hits a backhand, the numbers are similar between crosscourt (he wins the point 46% of the times he plays it) and down-the-line (43%). Even so, the down-the-line remains a much less frequently used shot: over the last 52 weeks he has used it 14% of the time, against 27% for the crosscourt backhand.",
    },
  ],
};

/* Le cinque schede, nell'ordine delle linguette */
/** @type {{ id: string, etichetta: string, numero: { cifra: string, frase: string }, passi: { tag?: string, testo: string }[] }[]} */
export const schede = [A1, A3, A4, B1, B3];

/* ------------------------------------------------------------------ */
/* Nota sui dati, in fondo alla pagina                                */
/* ------------------------------------------------------------------ */
// Fonte dei dati, scritta in fondo a ogni grafico.
export const fonte = "Data courtesy of TennisViz and Courtside Advantage";

export const notaDati = {
  titolo: "How to read the data",
  voci: [
    "All the data comes from Courtside Advantage (TennisViz) and covers the five matches Musetti won at the ATP 250 in Lyon, indoor hard court, October 19-25, 2026.",
    "The reference averages are the site's: the player average covers ATP main draws over the last 52 weeks; the Tour average covers the main draws of ATP 250, 500, 1000, United Cup, Next Gen and Finals over the same period.",
    '"Tournament average" means Musetti\'s five matches, final included.',
  ],
};

/* ------------------------------------------------------------------ */
/* Titoli, sottotitoli e note dei grafici                              */
/* ------------------------------------------------------------------ */
// La nota metodologica c'e solo dove i dati sono stati elaborati (A3 e B3).
export const grafici = {
  A1: {
    titolo: "Musetti's second serve outperformed his opponents'",
    sottotitolo:
      "Percentage of points won on one's own second serve. Dashed lines are the 52-week averages",
  },
  A3: {
    titolo:
      "Musetti served his second serves almost always to Fritz's backhand",
    sottotitolo:
      "Share of second serves in play by zone of the opponent's shot, with the number of second serves",
    nota: "The return shot is an estimate. Backhand: serve down the T in the deuce box or wide in the ad box; forehand: the opposite. The body serve is not assigned to backhand or forehand.",
  },
  A4: {
    titolo: "When Fritz hit a second serve, Musetti returned from far back",
    sottotitolo:
      "Share of returns by position at the moment of impact relative to the baseline",
  },
  B1: {
    titolo:
      "Musetti's game is among the most varied on the tour, and it showed in Lyon",
    sottotitolo:
      "Share of slices, short slices, drop shots, angles, net shots and lobs",
  },
  B3: {
    titolo: "When he plays the crosscourt backhand, Musetti struggles",
    sottotitolo:
      "Impact of the crosscourt backhand during a rally: negative if to the left of zero",
    nota: "A shot's impact is calculated from hot plays (winners and points that put the player in an attacking position during the rally) minus cold plays (errors and points that put the player in a defensive position).",
  },
};
