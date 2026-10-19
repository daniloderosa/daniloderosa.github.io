/**
 * PAGINA "CONTATTI" (/contact/ e /it/contatti/).
 * L'indirizzo email e i profili stanno in site.js, qui solo i testi.
 *
 * TODO Danilo: i testi che iniziano con "Segnaposto" / "Placeholder" vanno
 * riscritti prima di pubblicare, in tutte e due le lingue.
 */

export const contactPage = {
  en: {
    title: 'Contact — Danilo De Rosa',
    description: 'Collaborations, datasets worth a look, questions about a chart: how to reach me.',
    heading: 'Contact',
    lead: 'Placeholder — for a collaboration, a dataset worth a closer look or a question about a chart: write to me. I read everything and reply, usually within a couple of days.',
    emailLabel: 'Send an email to',
    // Traduzione delle categorie dei profili (campo `kind` in site.js)
    kinds: { social: 'SOCIAL', work: 'PROFESSIONAL', code: 'CODE' },
    topicsLabel: 'WHAT WE CAN TALK ABOUT',
    topics: [
      'Placeholder: commissioned articles and interactive graphics.',
      'Placeholder: match data analysis for clubs and media.',
      'Placeholder: consulting on sports data visualization.',
      'Placeholder: talks, workshops and teaching.'
    ],
    projectLabel: 'IF YOU ARE WRITING ABOUT A PROJECT',
    project: [
      'Placeholder: tell me in two lines the question you want to answer, what data you already have and when you would need it. If you have a sample file, attach it — an extract is enough.',
      'Placeholder: location and time zone, availability, working languages.'
    ]
  },

  it: {
    title: 'Contatti — Danilo De Rosa',
    description: 'Collaborazioni, dataset che meritano uno sguardo, domande su un grafico: come scrivermi.',
    heading: 'Contatti',
    lead: 'Segnaposto — per una collaborazione, un dataset che merita uno sguardo o una domanda su un grafico: scrivimi. Leggo tutto e rispondo, di solito entro un paio di giorni.',
    emailLabel: 'Scrivi una email a',
    kinds: { social: 'SOCIAL', work: 'PROFESSIONALE', code: 'CODICE' },
    topicsLabel: 'DI COSA POSSIAMO PARLARE',
    topics: [
      'Segnaposto: articoli e grafici interattivi su commissione.',
      'Segnaposto: analisi di dati di partita per club e media.',
      'Segnaposto: consulenze su data visualization sportiva.',
      'Segnaposto: interventi, workshop e docenze.'
    ],
    projectLabel: 'SE SCRIVI PER UN PROGETTO',
    project: [
      'Segnaposto: dimmi in due righe la domanda a cui vuoi rispondere, che dati hai già e quando ti servirebbe. Se hai un file di esempio, allegalo pure — basta un estratto.',
      'Segnaposto: sede e fuso orario, disponibilità, lingue di lavoro.'
    ]
  }
};
