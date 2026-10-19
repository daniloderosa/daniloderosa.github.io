/**
 * TESTI COMUNI A TUTTO IL SITO E TESTI DELLA HOME, nelle due lingue.
 * Nessun testo visibile va scritto dentro i componenti: sta tutto qui
 * (o nei file delle singole pagine: projects.js, about.js, contact.js).
 */

export const site = {
  /* Dominio assoluto: serve alle anteprime social, che non accettano
     percorsi relativi. */
  url: 'https://daniloderosa.github.io',

  name: 'Danilo De Rosa',

  /* TODO Danilo: l'indirizzo email compare in Contatti e nella home. */
  email: 'ciao@example.com',

  /* Profili, condivisi fra le due lingue.
     TODO Danilo: sostituisci ogni USERNAME (nell'indirizzo e in `handle`)
     con il tuo nome utente reale, oppure cancella i profili che non usi.
     L'ordine di questa lista e quello del footer e della pagina Contatti.
     `kind` e la categoria: la sua traduzione sta in contact.js. */
  social: [
    { label: 'X', kind: 'social', handle: '@USERNAME', href: 'https://x.com/USERNAME' },
    { label: 'Bluesky', kind: 'social', handle: '@USERNAME.bsky.social', href: 'https://bsky.app/profile/USERNAME' },
    { label: 'Instagram', kind: 'social', handle: '@USERNAME', href: 'https://www.instagram.com/USERNAME/' },
    { label: 'LinkedIn', kind: 'work', handle: '/in/USERNAME', href: 'https://www.linkedin.com/in/USERNAME' },
    { label: 'GitHub', kind: 'code', handle: 'daniloderosa', href: 'https://github.com/daniloderosa' }
  ],

  en: {
    /* Intestazione delle pagine interne */
    homeLink: 'Homepage',
    nav: { projects: 'PROJECTS', about: 'ABOUT', contact: 'CONTACT' },
    navLabel: 'Main menu',
    langNav: 'Language',
    langLabel: 'Leggi in italiano',
    currentLang: '(current language)',


    /* Nastro scorrevole: le voci si ripetono da sole */
    ticker: [
      'DATA VISUALIZATION',
      'TENNIS ANALYSIS',
      'INFORMATION DESIGN',
      'DATA STORYTELLING',
      'INTERACTIVE GRAPHICS',
      'ESSAYS BUILT ON DATA'
    ],

    /* Footer */
    footer: '© 2026 — BUILT ON POINT-BY-POINT DATA',
    socialLabel: 'Profiles',

    /* ---- HOME ---- */
    home: {
      title: 'Danilo De Rosa — Tennis is decided by millimeters',
      description:
        'Data-driven analysis of professional tennis: essays and interactive graphics on serve and return, surfaces and eras.',
      motto: 'Tennis is decided by millimeters. I measure them.',

      /* Le tre schede accanto al campo: compaiono una per rimbalzo, nell'ordine.
         Tutta la scheda e cliccabile. `page` porta a una pagina del sito,
         `href` + `external` a un progetto in un'altra repository.
         Le schede devono restare tre: la terza finisce dove finisce il campo. */
      cards: [
        { tag: 'SURFACES · 2025', title: 'How fast is a court, really?',
          href: 'https://daniloderosa.github.io/tennis_surface_speed/', external: true },
        { tag: 'RANKING · 2025', title: 'The top 50, up close',
          href: 'https://daniloderosa.github.io/tennis_top50/', external: true },
        { tag: 'PORTRAIT', title: 'About me', page: 'about' },
      ],
      cardsLabel: 'Featured',

      /* Il tabellone: la riga di sopra vince il punto alla fine
         dell'animazione (il 5 diventa 6 e la colonna dei 40 sparisce). */
      score: {
        winner: 'DE ROSA',
        loser: 'COMMON WISDOM',
        gameSetMatch: 'GAME · SET · MATCH'
      },
      call: 'IN',
      callNote: 'MARGIN ON THE LINE · 2.4 MM',
      callNoteShort: 'MARGIN · 2.4 MM',
      mark: '2.4 MM',

      /* L'indice delle pagine sotto il campo */
      indexLabel: 'Sections',
      index: [
        { page: 'projects', title: 'Projects', chip: 'ESSAYS AND GRAPHICS' },
        { page: 'about', title: 'About', chip: 'PORTRAIT' },
        { page: 'contact', title: 'Contact', chip: 'WRITE TO ME' }
      ]
    }
  },

  it: {
    homeLink: 'Homepage',
    nav: { projects: 'PROGETTI', about: 'CHI SONO', contact: 'CONTATTI' },
    navLabel: 'Menu principale',
    langNav: 'Lingua',
    langLabel: 'Read in English',
    currentLang: '(lingua attuale)',


    ticker: [
      'DATA VISUALIZATION',
      'TENNIS ANALYSIS',
      'INFORMATION DESIGN',
      'DATA STORYTELLING',
      'GRAFICI INTERATTIVI',
      'SAGGI COSTRUITI SUI DATI'
    ],

    footer: '© 2026 — COSTRUITO SU DATI PUNTO PER PUNTO',
    socialLabel: 'Profili',

    home: {
      title: 'Danilo De Rosa — Il tennis si decide sui millimetri',
      description:
        'Analisi del tennis professionistico a partire dai dati: saggi e grafici interattivi su servizio e risposta, superfici ed epoche.',
      motto: 'Il tennis si decide sui millimetri. Io li misuro.',

      cards: [
        { tag: 'SUPERFICI · 2025', title: 'Quanto è veloce davvero un campo?',
          href: 'https://daniloderosa.github.io/tennis_surface_speed/', external: true },
        { tag: 'CLASSIFICA · 2025', title: 'I primi 50, da vicino',
          href: 'https://daniloderosa.github.io/tennis_top50/?lang=it', external: true },
        { tag: 'RITRATTO', title: 'Chi sono', page: 'about' },
      ],
      cardsLabel: 'In evidenza',

      score: {
        winner: 'DE ROSA',
        loser: 'LUOGHI COMUNI',
        gameSetMatch: 'GAME · SET · MATCH'
      },
      call: 'IN',
      callNote: 'MARGINE SULLA RIGA · 2.4 MM',
      callNoteShort: 'MARGINE · 2.4 MM',
      mark: '2.4 MM',

      indexLabel: 'Sezioni',
      index: [
        { page: 'projects', title: 'Progetti', chip: 'SAGGI E GRAFICI' },
        { page: 'about', title: 'Chi sono', chip: 'RITRATTO' },
        { page: 'contact', title: 'Contatti', chip: 'SCRIVIMI' }
      ]
    }
  }
};
