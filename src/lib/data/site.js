export const site = {
  /* Dominio assoluto: serve alle anteprime social, che non accettano
     percorsi relativi. */
  url: "https://daniloderosa.github.io",

  name: "Danilo De Rosa",

  email: "danilo.derosa.dd@gmail.com",

  /* Profili, condivisi fra le due lingue. */
  social: [
    {
      label: "X",
      kind: "social",
      handle: "@DaniloDeRosa96",
      href: "https://x.com/DaniloDeRosa96",
    },
    {
      label: "Instagram",
      kind: "social",
      handle: "@danilo.derosa",
      href: "https://www.instagram.com/danilo.derosa",
    },
    {
      label: "LinkedIn",
      kind: "work",
      handle: "/in/danilo.derosa",
      href: "https://www.linkedin.com/in/danilo-derosa/",
    },
    {
      label: "GitHub",
      kind: "code",
      handle: "daniloderosa",
      href: "https://github.com/daniloderosa",
    },
  ],

  en: {
    /* Intestazione delle pagine interne */
    homeLink: "Homepage",
    nav: { projects: "PROJECTS", about: "ABOUT", contact: "CONTACT" },
    navLabel: "Main menu",
    langNav: "Language",
    langLabel: "Leggi in italiano",
    currentLang: "(current language)",

    /* Nastro scorrevole: le voci si ripetono da sole */
    ticker: [
      "DATA VISUALIZATION",
      "TENNIS ANALYSIS",
      "INFORMATION DESIGN",
      "DATA STORYTELLING",
      "INTERACTIVE GRAPHICS",
      "ESSAYS BUILT ON DATA",
    ],

    /* Footer */
    footer: "© 2026 — BUILT ON POINT-BY-POINT DATA",
    socialLabel: "Profiles",

    /* ---- HOME ---- */
    home: {
      title: "Danilo De Rosa — Portfolio with essays and interactive graphics",
      description:
        "Essays and interactive graphics on tennis and my other passions, with a special focus on data visualization.",
      motto: "Tennis is decided by centimeters. I measure them.",

      /* Le tre schede accanto al campo: compaiono una per rimbalzo, nell'ordine.
         Tutta la scheda e cliccabile. `page` porta a una pagina del sito,
         `href` + `external` a un progetto in un'altra repository.
         Le schede devono restare tre: la terza finisce dove finisce il campo. */
      cards: [
        {
          tag: "SURFACES · 2026",
          title: "Has tennis become all the same?",
          href: "https://daniloderosa.github.io/tennis_surface_speed/",
          external: true,
        },
        {
          tag: "RANKING · 2026",
          title: "ATP Top 100: stats and numbers",
          href: "https://daniloderosa.github.io/tennis_top100/",
          external: true,
        },
        { tag: "PORTRAIT", title: "About me", page: "about" },
      ],
      cardsLabel: "Featured",

      /* Il tabellone: la riga di sopra vince il punto alla fine
         dell'animazione (il 5 diventa 6 e la colonna dei 40 sparisce). */
      score: {
        winner: "DE ROSA",
        loser: "SLOPPY ANALYSES",
        gameSetMatch: "GAME · SET · MATCH",
      },
      call: "IN",
      callNote: "MARGIN ON THE LINE · 2.4 CM",
      callNoteShort: "MARGIN · 2.4 CM",
      mark: "2.4 CM",

      /* L'indice delle pagine sotto il campo */
      indexLabel: "Sections",
      index: [
        { page: "projects", title: "Projects", chip: "ESSAYS AND GRAPHICS" },
        { page: "about", title: "About", chip: "ABOUT ME" },
        { page: "contact", title: "Contact", chip: "WRITE TO ME" },
      ],
    },
  },

  it: {
    homeLink: "Homepage",
    nav: { projects: "PROGETTI", about: "CHI SONO", contact: "CONTATTI" },
    navLabel: "Menu principale",
    langNav: "Lingua",
    langLabel: "Read in English",
    currentLang: "(lingua attuale)",

    ticker: [
      "DATA VISUALIZATION",
      "TENNIS ANALYSIS",
      "INFORMATION DESIGN",
      "DATA STORYTELLING",
      "GRAFICI INTERATTIVI",
      "SAGGI COSTRUITI SUI DATI",
    ],

    footer: "© 2026 — COSTRUITO SU DATI PUNTO PER PUNTO",
    socialLabel: "Profili",

    home: {
      title:
        "Danilo De Rosa — Pagina portfolio con articoli e grafici interattivi",
      description:
        "Saggi e grafici interattivi sul tennis e altre mie passioni, con un occhio di riguardo per la data visualization.",
      motto: "Il tennis si decide sui centimetri. Io li misuro.",

      cards: [
        {
          tag: "SUPERFICI · 2026",
          title: "Il tennis è diventato tutto uguale?",
          href: "https://daniloderosa.github.io/tennis_surface_speed/",
          external: true,
        },
        {
          tag: "CLASSIFICA · 2026",
          title: "ATP Top 100 - Statistiche e numeri",
          href: "https://daniloderosa.github.io/tennis_top100/?lang=it",
          external: true,
        },
        { tag: "RITRATTO", title: "Chi sono", page: "about" },
      ],
      cardsLabel: "In evidenza",

      score: {
        winner: "DE ROSA",
        loser: "ANALISI SCIATTE",
        gameSetMatch: "GAME · SET · MATCH",
      },
      call: "IN",
      callNote: "MARGINE SULLA RIGA · 2.4 CM",
      callNoteShort: "MARGINE · 2.4 CM",
      mark: "2.4 CM",

      indexLabel: "Sezioni",
      index: [
        { page: "projects", title: "Progetti", chip: "SAGGI E GRAFICI" },
        { page: "about", title: "Chi sono", chip: "SU DI ME" },
        { page: "contact", title: "Contatti", chip: "SCRIVIMI" },
      ],
    },
  },
};
