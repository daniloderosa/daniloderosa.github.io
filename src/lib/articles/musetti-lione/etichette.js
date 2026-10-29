/**
 * ETICHETTE DI INTERFACCIA nelle due lingue: le piccole scritte dei grafici
 * e della pagina che non sono testo dell'articolo (quello sta in testi.it.js
 * e testi.en.js). Le due lingue hanno le stesse chiavi.
 *
 * Per cambiare una scritta si modifica qui, nella lingua giusta.
 */

/** @typedef {'it' | 'en'} Lingua */

export const etichette = {
  it: {
    // Nomi delle due serie e dei riferimenti nei grafici
    musetti: 'Musetti',
    avversario: 'Avversario',
    suaMedia: 'Sua media',
    mediaTour: 'Media Tour',
    // Forme corte per le linee di riferimento nei grafici (poco spazio)
    suaMediaBreve: 'Sua media',
    mediaTourBreve: 'Media Tour',
    sett52: '52 sett.',
    // I cinque turni (le chiavi sono quelle di dati.json)
    turni: { R1: '1° turno', R2: '2° turno', QF: 'Quarti', SF: 'Semifinale', F: 'Finale' },

    // Pagina
    capitoli: "Capitoli dell'articolo",
    grafico: 'Grafico',
    metodologia: 'Metodologia',

    // Grafico "Dove va" (A3): zone, titoli delle barre
    zone: ['rovescio', 'dritto', 'corpo'],
    zoneIntestazioni: ['Zona rovescio', 'Zona dritto', 'Al corpo'],
    /** @param {number} n */ barraTorneo: (n) => `Media del torneo · ${n} seconde in campo`,
    /** @param {number} n */ barraFinale: (n) => `Finale con Fritz · ${n} seconde`,

    // Grafico "Risposta" (A4): le tre fasce di posizione
    fasce: ['Dentro il campo', '0-2 m dietro la linea', 'Oltre 2 m dietro la linea'],

    // Grafico "Rovescio incrociato" (B3)
    torneoNome: ['Torneo', /** @param {number} n */ (n) => `${n} partite`],
    saldoNegativo: 'Saldo negativo',
    saldoPositivo: 'Saldo positivo',
    // Scritta accanto alla barra della media degli avversari, dalla piu lunga alla piu corta
    mediaAvversari: ['media avversari', 'media avv.', 'media'],
  },

  en: {
    musetti: 'Musetti',
    avversario: 'Opponent',
    suaMedia: 'His average',
    mediaTour: 'Tour average',
    suaMediaBreve: 'His avg.',
    mediaTourBreve: 'Tour avg.',
    sett52: '52 wks',
    turni: { R1: 'Round 1', R2: 'Round 2', QF: 'Quarterfinal', SF: 'Semifinal', F: 'Final' },

    capitoli: 'Article chapters',
    grafico: 'Chart',
    metodologia: 'Methodology',

    zone: ['backhand', 'forehand', 'body'],
    zoneIntestazioni: ['Backhand side', 'Forehand side', 'Body'],
    /** @param {number} n */ barraTorneo: (n) => `Tournament average · ${n} second serves in`,
    /** @param {number} n */ barraFinale: (n) => `Final vs. Fritz · ${n} second serves`,

    fasce: ['Inside the baseline', '0-2 m behind the baseline', 'More than 2 m behind the baseline'],

    torneoNome: ['Tournament', /** @param {number} n */ (n) => `${n} matches`],
    saldoNegativo: 'Negative balance',
    saldoPositivo: 'Positive balance',
    mediaAvversari: ['opponents average', 'opp. average', 'average'],
  },
};
