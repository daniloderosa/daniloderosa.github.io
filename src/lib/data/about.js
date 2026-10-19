/**
 * PAGINA "CHI SONO" (/about/ e /it/chi-sono/).
 *
 * TODO Danilo: i testi che iniziano con "Segnaposto" / "Placeholder" vanno
 * riscritti prima di pubblicare, in tutte e due le lingue. La foto va in
 * static/ (per esempio static/ritratto.jpg) e il percorso in `photo`.
 */

export const aboutPage = {
  // Foto verticale 4:5. null = riquadro a righe con l'etichetta.
  photo: null,

  en: {
    title: 'About — Danilo De Rosa',
    description: 'Who I am, how I work and what kind of collaborations I am interested in.',
    heading: 'About',
    quote: 'Placeholder. One sentence that says who you are and where you watch tennis from: the point of view, not the résumé.',
    paragraphs: [
      'Placeholder. Two or three sentences about who you are: what you do for a living, how you got into data visualization and what you are looking at these days. First person and short, no lists of skills.',
      'Placeholder. A second paragraph for the practical side: the tools you work with, the kind of collaborations you are interested in and where to find you. It ends with an invitation to get in touch.'
    ],
    photoAlt: 'Portrait of Danilo De Rosa',
    photoPlaceholder: '[ portrait — vertical photo ]',
    blocks: [
      { label: 'HOW I WORK', items: [
        'Placeholder: I always start from a question, not a dataset.',
        'Placeholder: point-by-point match data, cleaned by hand.',
        'Placeholder: a chart only when it adds something to the text.'
      ] },
      { label: 'TOOLS', items: [
        'R and Python for the analysis',
        'D3 and Svelte for the interactive graphics',
        'Figma for page design',
        'Placeholder: add or remove what you need'
      ] },
      { label: 'COLLABORATIONS', items: [
        'Placeholder: commissioned articles and graphics.',
        'Placeholder: consulting on sports data visualization.',
        'Placeholder: talks and workshops.'
      ] }
    ],
    toWork: 'SEE THE PROJECTS',
    toContact: 'WRITE TO ME'
  },

  it: {
    title: 'Chi sono — Danilo De Rosa',
    description: 'Chi sono, come lavoro e che tipo di collaborazioni mi interessano.',
    heading: 'Chi sono',
    quote: 'Segnaposto. Una frase che dice in una riga chi sei e da dove guardi il tennis: il punto di vista, non il curriculum.',
    paragraphs: [
      'Segnaposto. Due o tre frasi su chi sei: che lavoro fai, come sei arrivato alla visualizzazione dei dati e cosa stai guardando in questo periodo. In prima persona e breve, senza elenchi di competenze.',
      'Segnaposto. Un secondo paragrafo per la parte pratica: gli strumenti con cui lavori, il tipo di collaborazioni che ti interessano e dove ti si trova. Si chiude con un invito a scrivere.'
    ],
    photoAlt: 'Ritratto di Danilo De Rosa',
    photoPlaceholder: '[ ritratto — foto verticale ]',
    blocks: [
      { label: 'COME LAVORO', items: [
        'Segnaposto: parto sempre da una domanda, non da un dataset.',
        'Segnaposto: dati di partita punto per punto, ripuliti a mano.',
        'Segnaposto: un grafico solo se aggiunge qualcosa al testo.'
      ] },
      { label: 'STRUMENTI', items: [
        'R e Python per la parte di analisi',
        'D3 e Svelte per i grafici interattivi',
        'Figma per il disegno delle pagine',
        'Segnaposto: aggiungi o togli quello che serve'
      ] },
      { label: 'COLLABORAZIONI', items: [
        'Segnaposto: articoli e grafici su commissione.',
        'Segnaposto: consulenze su data visualization sportiva.',
        'Segnaposto: interventi e workshop.'
      ] }
    ],
    toWork: 'VEDI I PROGETTI',
    toContact: 'SCRIVIMI'
  }
};
