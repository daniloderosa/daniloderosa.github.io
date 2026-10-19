/**
 * PAGINA "PROGETTI" (/projects/ e /it/progetti/): testi della pagina ed elenco dei
 * progetti.
 *
 * PROGETTI. Ogni progetto ha un testo in inglese e uno in italiano: se manca
 * una delle due traduzioni non va pubblicato, togli l'oggetto da qui.
 *
 * Campi:
 *   id        chiave interna, non appare a schermo
 *   year      anno di pubblicazione (serve anche al contatore in alto)
 *   category  'tennis' oppure 'other': decide l'etichetta sull'anteprima
 *   external  true = progetto in un'altra repository, si apre in una scheda nuova
 *   image     anteprima in static/previews/. null = riquadro a righe con etichetta
 *   en / it   testi nella lingua: tag, titolo, descrizione, link, alt, azione.
 *             Il link puo cambiare con la lingua: la top 50 in italiano si
 *             apre con ?lang=it in fondo all'indirizzo. Surface speed per ora
 *             ha un solo indirizzo, uguale nelle due lingue.
 *
 * PER AGGIUNGERE UN ARTICOLO: copia un blocco, cambia i campi, metti
 * href: '/articles/<slug>/' (en) e '/it/articoli/<slug>/' (it).
 */

export const projects = [
  {
    id: 'surface-speed',
    year: 2025,
    category: 'tennis',
    external: true,
    // Anteprima non ancora disponibile: metti il PNG in static/previews/
    // e sostituisci null con '/previews/tennis-surface-speed.png'.
    image: null,
    en: {
      tag: 'SURFACES',
      title: 'How fast is a tennis court, really?',
      description:
        'Court speed is talked about constantly and measured almost never. An interactive look at how surfaces actually differ, tournament by tournament.',
      href: 'https://daniloderosa.github.io/tennis_surface_speed/',
      alt: 'Preview — line chart, speed by tournament',
      cta: 'Open the project'
    },
    it: {
      tag: 'SUPERFICI',
      title: 'Quanto è veloce davvero un campo da tennis?',
      description:
        'Della velocità dei campi si parla sempre e si misura quasi mai. Uno sguardo interattivo a come le superfici differiscono davvero, torneo per torneo.',
      href: 'https://daniloderosa.github.io/tennis_surface_speed/',
      alt: 'Anteprima — grafico a linee, velocità per torneo',
      cta: 'Apri il progetto'
    }
  },
  {
    id: 'top50',
    year: 2025,
    category: 'tennis',
    external: true,
    // Anteprima non ancora disponibile: metti il PNG in static/previews/
    // e sostituisci null con '/previews/tennis-top50.png'.
    image: null,
    en: {
      tag: 'RANKING',
      title: 'The top 50, up close',
      description:
        'A profile of the players inside the ATP top 50: serve and return numbers side by side, with the trade-offs each game style makes.',
      href: 'https://daniloderosa.github.io/tennis_top50/',
      alt: 'Preview — scatterplot of serve and return',
      cta: 'Open the project'
    },
    it: {
      tag: 'CLASSIFICA',
      title: 'I primi 50, da vicino',
      description:
        'Un ritratto dei giocatori dentro la top 50 ATP: i numeri al servizio e in risposta accostati, con i compromessi di ogni stile di gioco.',
      href: 'https://daniloderosa.github.io/tennis_top50/?lang=it',
      alt: 'Anteprima — scatterplot servizio / risposta',
      cta: 'Apri il progetto'
    }
  }
];

/* Testi della pagina */
export const projectsPage = {
  en: {
    title: 'Projects — Danilo De Rosa',
    description:
      'Essays and interactive graphics built on match data: serve and return patterns, surface behavior, era comparisons.',
    heading: 'Projects',
    lead: 'Essays and interactive graphics built on match data: serve and return patterns, surface behavior, era comparisons. Every piece pairs a readable argument with a visualization you can question.',
    counter: 'PROJECTS',
    categories: { tennis: 'TENNIS', other: 'OTHER' },
    pitch: {
      title: 'Have a dataset worth a closer look?',
      text: 'Collaborations, commissions and consulting on sports data visualization.',
      cta: 'WRITE TO ME'
    }
  },
  it: {
    title: 'Progetti — Danilo De Rosa',
    description:
      'Saggi e grafici interattivi costruiti su dati di partita: schemi al servizio e in risposta, superfici, confronti fra epoche.',
    heading: 'Progetti',
    lead: 'Saggi e grafici interattivi costruiti su dati di partita: schemi al servizio e in risposta, comportamento delle superfici, confronti fra epoche. Ogni pezzo tiene insieme un ragionamento leggibile e una visualizzazione che si può interrogare.',
    counter: 'PROGETTI',
    categories: { tennis: 'TENNIS', other: 'ALTRO' },
    pitch: {
      title: 'Hai un dataset che merita uno sguardo?',
      text: 'Collaborazioni, commissioni e consulenze su data visualization sportiva.',
      cta: 'SCRIVIMI'
    }
  }
};
