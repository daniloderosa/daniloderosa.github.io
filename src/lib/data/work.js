/**
 * SCHEDE DELLA HOME
 *
 * Ogni scheda ha un testo in inglese e uno in italiano. Se manca una delle
 * due traduzioni la scheda non va pubblicata: togline l'oggetto da qui.
 *
 * Campi:
 *   id       chiave interna, non appare a schermo
 *   tag      etichetta breve in maiuscolo (superficie, tema)
 *   date     data di pubblicazione, gia formattata per lingua
 *   href     dove porta la scheda
 *   external true = progetto in un'altra repository, si apre in una nuova scheda
 *   image    anteprima in static/previews/. null = riquadro a righe con etichetta
 *   alt      testo alternativo dell'anteprima, obbligatorio se c'e l'immagine
 *
 * PER AGGIUNGERE UN ARTICOLO: copia un blocco, cambia i campi, metti
 * href: '/articles/<slug>' (en) e '/it/articoli/<slug>' (it).
 */

export const work = [
  {
    id: 'surface-speed',
    external: true,
    // Anteprima non ancora disponibile: metti il PNG in static/previews/
    // e sostituisci null con '/previews/tennis-surface-speed.png'.
    image: null,
    en: {
      tag: 'SURFACES',
      date: '2025',
      title: 'How fast is a tennis court, really?',
      description:
        'Court speed is talked about constantly and measured almost never. An interactive look at how surfaces actually differ, tournament by tournament.',
      href: 'https://daniloderosa.github.io/tennis_surface_speed/',
      alt: 'Preview of the court speed project: a chart comparing surfaces.',
      cta: 'Open the project'
    },
    it: {
      tag: 'SUPERFICI',
      date: '2025',
      title: 'Quanto e veloce davvero un campo da tennis?',
      description:
        'Della velocita dei campi si parla sempre e si misura quasi mai. Uno sguardo interattivo a come le superfici differiscono davvero, torneo per torneo.',
      href: 'https://daniloderosa.github.io/tennis_surface_speed/',
      alt: 'Anteprima del progetto sulla velocita dei campi: un grafico che confronta le superfici.',
      cta: 'Apri il progetto'
    }
  },
  {
    id: 'top50',
    external: true,
    // Anteprima non ancora disponibile: metti il PNG in static/previews/
    // e sostituisci null con '/previews/tennis-top50.png'.
    image: null,
    en: {
      tag: 'RANKING',
      date: '2025',
      title: 'The top 50, up close',
      description:
        'A profile of the players inside the ATP top 50: serve and return numbers side by side, with the trade-offs each game style makes.',
      href: 'https://daniloderosa.github.io/tennis_top50/',
      alt: 'Preview of the top 50 project: a scatterplot of players by serve and return.',
      cta: 'Open the project'
    },
    it: {
      tag: 'CLASSIFICA',
      date: '2025',
      title: 'I primi 50, da vicino',
      description:
        'Un ritratto dei giocatori dentro la top 50 ATP: i numeri al servizio e in risposta accostati, con i compromessi di ogni stile di gioco.',
      href: 'https://daniloderosa.github.io/tennis_top50/',
      alt: 'Anteprima del progetto sulla top 50: uno scatterplot dei giocatori per servizio e risposta.',
      cta: 'Apri il progetto'
    }
  }
];
