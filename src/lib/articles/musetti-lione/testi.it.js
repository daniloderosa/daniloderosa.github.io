/**
 *
 * Campi di un blocco:
 *   id         sigla dello storyboard (A1, B3...)
 *   etichetta  nome breve sulla linguetta della scheda
 *   titolo     titolo del blocco
 *   numero     il "numero guida": cifra grande + frase che la spiega
 *   passi      i paragrafi. Se un passo e un'ipotesi o una stima e non un
 *              dato, si aggiunge  tag: 'IPOTESI'  o  tag: 'STIMA'  (compare
 *              un'etichetta davanti al paragrafo): dati e ipotesi restano
 *              distinti, come chiede lo storyboard.
 *
 * Quando i testi saranno approvati, la versione inglese si fara in un file
 * gemello (testi.en.js) con la stessa forma.
 */

export const meta = {
  titolo: "Come Musetti ha vinto il torneo 250 di Lione",
  // Sottotitolo sotto il titolo: una sola riga
  sottotitolo:
    "Dopo 4 anni Musetti è tornato a vincere un torneo ATP battendo in finale Fritz 6-3 6-4 con un Performance Rating di 9.07, il più alto della sua settimana: da dove arriva quel vantaggio e, soprattutto, come ha costruito le sue vittorie nel torneo?",
  // Titolo della scheda del browser e dell'anteprima social
  titoloPagina: "Come Musetti ha vinto il torneo 250 di Lione - Danilo De Rosa",
  descrizione:
    "Come Lorenzo Musetti ha vinto l'ATP 250 di Lione 2026: 5 grafici per capirlo.",
  // Indirizzo della pagina (serve a canonical e og:url)
  indirizzo: "/it/articoli/musetti-lione/",
};

/* ------------------------------------------------------------------ */
/* Parte A - la seconda di servizio                                   */
/* ------------------------------------------------------------------ */
export const A1 = {
  id: "A1",
  etichetta: "La seconda",
  numero: {
    cifra: "59,7%",
    frase:
      "di punti vinti con la seconda di servizio nel torneo (80/134), contro 55% di media personale e 51% del Tour",
  },
  passi: [
    {
      testo:
        "La seconda di servizio a Lione è stata una forza per Musetti. Nonostante una velocità leggermente sotto la sua media personale, nelle cinque partite ha vinto il 59,7% dei punti giocati con la seconda, quasi cinque punti sopra la sua media delle ultime 52 settimane e quasi nove sopra quella del Tour.",
    },
    {
      testo:
        "In ogni turno ha fatto meglio dell'avversario sulla stessa voce: il divario più largo è con Arnaldi (56% contro 32%), il più stretto con Cobolli (54% contro 47%), e in finale ha vinto 14 punti su 20, il 70%, contro il 47% di Fritz.",
    },
  ],
};

export const A3 = {
  id: "A3",
  etichetta: "Dove va",
  numero: {
    cifra: "13 su 20",
    frase:
      "seconde (il 65%) in zona rovescio di Fritz in finale, contro il 42,6% della media del torneo",
  },
  passi: [
    {
      testo:
        "Musetti ha sfruttato bene il piazzamento delle sue seconde di servizio: rispetto alla media del torneo, contro Fritz in finale la quota di seconde indirizzate verso il rovescio dell'avversario è salita a 13 su 20, il 65%.",
    },
    {
      testo:
        "Venti seconde non sono tante per trarre conclusioni solide, ma un indizio nella stessa direzione viene dalle risposte: Fritz ha risposto di rovescio (in totale, tra prime e seconde) il 61,3% delle volte, contro il 55,8% medio degli avversari di Musetti nel torneo.",
    },

    {
      tag: "STIMA",
      testo:
        "Il colpo in risposta alla seconda di servizio è una stima, in quanto abbiamo la direzione del servizio ma non il colpo dell'avversario: abbiamo comunque ipotizzato che, mediamente, un colpo a uscire da sinistra sia indirizzato verso il rovescio di un destrimane, così come un servizio sulla T da destra.",
    },
  ],
};

export const A4 = {
  id: "A4",
  etichetta: "Risposta",
  numero: {
    cifra: "81%",
    frase:
      "delle risposte di Musetti alla seconda di Fritz giocate oltre due metri dietro la linea di fondo, contro una media personale del 61%",
  },
  passi: [
    {
      testo:
        "Anche la posizione in risposta cambia da avversario ad avversario. Sulla seconda di Arnaldi Musetti ha colpito dentro il campo il 38% delle volte e oltre i due metri dietro la linea solo il 12%; con Cobolli è entrato in campo il 53% delle volte.",
    },
    {
      testo:
        "Contro Fritz la situazione è rovesciata: 81% delle risposte oltre i due metri, 19% dentro il campo e nessuna nella fascia intermedia, contro una media personale del 61% oltre i due metri.",
    },
    {
      testo:
        "Musetti sa che Fritz ha un servizio tra i migliori del circuito (la media della sua seconda è stata di 159 km/h contro i 148 di Musetti), e ha deciso quindi quasi sempre di rispondere da molto lontano per far partire lo scambio. Su 16 seconde ricevute, solo 3 volte ha risposto da dentro il campo: interessante la scelta di non assumere mai una posizione intermedia.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Parte B - il rovescio                                              */
/* ------------------------------------------------------------------ */
export const B1 = {
  id: "B1",
  etichetta: "Variazione",
  numero: {
    cifra: "34,7%",
    frase: "di colpi di variazione nel torneo, contro 21,3% del Tour",
  },
  passi: [
    {
      testo:
        "Nel tennis di Musetti circa un colpo su tre rientra nella variazione: slice, smorzate, angoli, lob, colpi a rete. A Lione la quota è stata del 34,7% (503 colpi su 1.448), tra il 31,4% e il 38,8% a seconda della partita, contro il 21,3% medio del Tour e il 33% della sua media personale.",
    },
    {
      testo:
        "Non sorprende che l'avversario che ha affrontato con la quota minore di variazioni sia stato proprio Fritz, con cui già in passato Musetti ha dimostrato di trovarsi molto bene (sono 5-3 negli scontri diretti a favore di Musetti, con 2 vittorie di Fritz arrivate nel 2022).",
    },
  ],
};

export const B3 = {
  id: "B3",
  etichetta: "Rovescio incrociato",
  numero: {
    cifra: "−11,5%",
    frase: "l'impatto del rovescio incrociato di Musetti nel torneo",
  },
  passi: [
    {
      testo:
        "Courtside Advantage classifica i colpi da fondo e a rete in nove schemi e ne valuta l'impatto contando quanti risultano hot (vincenti, colpi che portano in attacco, colpi che provocano un errore) e quanti cold (errori non forzati, colpi che portano l'avversario in attacco o gli regalano un vincente). Il rovescio incrociato è il colpo più giocato da Musetti, quasi una volta su quattro, ed è l'unico con un saldo negativo: 60 colpi hot e 100 cold in cinque partite, con saldo negativo in ciascuna.",
    },
    {
      testo:
        "Giocando il rovescio ad una mano gli avversari sanno che possono puntare lì per far male a Musetti, che infatti prova spesso a rifugiarsi nello slice o a cambiare lungolinea per evitarlo.",
    },
    {
      testo:
        "Guardando alle % di vittoria degli scambi in cui Musetti gioca il rovescio, i numeri sono simili tra incrociato (46% delle volte in cui lo gioca vince il punto) e lungolinea (43%). In ogni caso, il lungolinea rimane un colpo usato molto meno di frequente: nelle ultime 52 settimane l'ha usato il 14% delle volte, contro il 27% del rovescio incrociato.",
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
export const fonte =
  "Dati: Courtside Advantage (TennisViz), courtsideadvantage.com";

export const notaDati = {
  titolo: "Come leggere i dati",
  voci: [
    "Tutti i dati vengono da Courtside Advantage (TennisViz) e riguardano le cinque partite vinte da Musetti all'ATP 250 di Lione, cemento indoor, 19-25 ottobre 2026.",
    "Le medie di riferimento sono quelle del sito: la media del giocatore copre i tabelloni principali ATP delle ultime 52 settimane; la media Tour i tabelloni principali di ATP 250, 500, 1000, United Cup, Next Gen e Finals nello stesso periodo.",
    "«Media del torneo» indica le cinque partite di Musetti, finale inclusa. Se due pagine del sito danno valori diversi, vale Match Stats.",
    "Le percentuali calcolate su pochi casi (per esempio le 20 seconde della finale) sono sempre accompagnate dal conteggio.",
  ],
};

/* ------------------------------------------------------------------ */
/* Titoli, sottotitoli e note dei grafici                              */
/* ------------------------------------------------------------------ */
// La nota metodologica c'e solo dove i dati sono stati elaborati (A3 e B3).
export const grafici = {
  A1: {
    titolo:
      "La seconda di servizio di Musetti è stata superiore ai suoi avversari",
    sottotitolo:
      "Percentuale di punti vinti con la propria seconda. Le linee tratteggiate sono le medie delle ultime 52 settimane",
  },
  A3: {
    titolo:
      "Musetti ha servito le seconde quasi sempre verso il rovescio di Fritz",
    sottotitolo:
      "Quota delle seconde in campo per zona del colpo avversario, con il numero di seconde",
    nota: "Il colpo di risposta è una stima. Rovescio: servizio sulla T del box del pari o esterno nel box dei vantaggi; dritto: il contrario. Il servizio al corpo non è attribuito a rovescio o dritto.",
  },
  A4: {
    titolo: "Quando Fritz giocava una seconda Musetti rispondeva da lontano",
    sottotitolo:
      "Quota delle risposte per posizione al momento dell'impatto rispetto alla linea di fondo",
  },
  B1: {
    titolo:
      "Il tennis di Musetti è tra i più vari del circuito, e a Lione si è visto",
    sottotitolo:
      "Quota di slice, slice corti, smorzate, angoli, colpi a rete e lob",
  },
  B3: {
    titolo: "Se gioca il rovescio incrociato Musetti va in difficoltà",
    sottotitolo:
      "Impatto del rovescio incrociato durante uno scambio: negativo se a sinistra dello zero",
    nota: "L'impatto di un colpo è calcolato dalle hot plays (vincenti e punti che mettono il giocatore in una posizione di attacco durante lo scambio) meno le cold plays (errori e punti che mettono il giocatore in una posizione di difesa).",
  },
};
