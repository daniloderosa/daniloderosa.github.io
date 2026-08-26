/**
 * TESTI FISSI DEL SITO, nelle due lingue.
 * Qui si cambiano nome, sommario, presentazione, contatti e metadati social.
 * Nessun testo visibile va scritto dentro i componenti: sta tutto qui.
 */

export const site = {
  /* Dominio assoluto: serve alle anteprime social, che non accettano
     percorsi relativi. */
  url: 'https://daniloderosa.github.io',

  /* Contatti condivisi fra le due lingue.
     TODO Danilo: sostituisci ogni USERNAME con il tuo nome utente reale,
     oppure cancella le righe dei profili che non usi. L'ordine di questa
     lista e l'ordine in cui compaiono nel footer. */
  email: 'ciao@example.com',
  social: [
    { label: 'X', href: 'https://x.com/USERNAME' },
    { label: 'Bluesky', href: 'https://bsky.app/profile/USERNAME' },
    { label: 'Instagram', href: 'https://www.instagram.com/USERNAME/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/USERNAME' },
    { label: 'GitHub', href: 'https://github.com/daniloderosa' }
  ],

  en: {
    name: 'Danilo De Rosa',
    /* Il sommario e spezzato in tre: la parte centrale va evidenziata
       con l'accento, come nel design system. */
    tagline: { before: 'Tennis analysis, ', mark: 'built on data', after: ' — essays and interactive graphics.' },
    intro:
      'I write data-driven stories about professional tennis — serve and return patterns, surface behavior, era comparisons. Every piece pairs a readable argument with graphics built from match-level data. In English, with an Italian edition.',
    workLabel: 'SELECTED WORK',
    socialLabel: 'Profiles',
    /* Testo mostrato quando non c'e ancora nessun articolo pubblicato. */
    empty: 'The first articles are on their way.',
    title: 'Danilo De Rosa — Tennis analysis, built on data',
    description:
      'Data-driven analysis of professional tennis: essays and interactive graphics on serve and return, surfaces and eras.',
    ogImage: '/og-en.png',
    ogAlt: 'Danilo De Rosa — tennis analysis, built on data.',
    langLabel: 'Leggi in italiano',
    twin: '/it/'
  },

  it: {
    name: 'Danilo De Rosa',
    tagline: { before: 'Analisi di tennis ', mark: 'costruite sui dati', after: ' — articoli e grafici interattivi.' },
    intro:
      'Racconto il tennis professionistico partendo dai dati: schemi al servizio e in risposta, comportamento delle superfici, confronti fra epoche. Ogni pezzo mette insieme un ragionamento leggibile e grafici costruiti sui dati delle partite. In italiano, con edizione inglese.',
    workLabel: 'LAVORI SCELTI',
    socialLabel: 'Profili',
    empty: 'I primi articoli stanno arrivando.',
    title: 'Danilo De Rosa — Analisi di tennis costruite sui dati',
    description:
      'Analisi del tennis professionistico a partire dai dati: articoli e grafici interattivi su servizio e risposta, superfici ed epoche.',
    ogImage: '/og-it.png',
    ogAlt: 'Danilo De Rosa — analisi di tennis costruite sui dati.',
    langLabel: 'Read in English',
    twin: '/'
  }
};
