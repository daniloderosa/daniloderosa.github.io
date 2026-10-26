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
    title: "About — Danilo De Rosa",
    description:
      "Who I am, how I work and what kind of collaborations I am interested in.",
    heading: "About",
    quote:
      "Placeholder. One sentence that says who you are and where you watch tennis from: the point of view, not the résumé.",
    paragraphs: [
      "Placeholder. Two or three sentences about who you are: what you do for a living, how you got into data visualization and what you are looking at these days. First person and short, no lists of skills.",
      "Placeholder. A second paragraph for the practical side: the tools you work with, the kind of collaborations you are interested in and where to find you. It ends with an invitation to get in touch.",
    ],
    photoAlt: "Portrait of Danilo De Rosa",
    photoPlaceholder: "[ portrait — vertical photo ]",
    blocks: [
      {
        label: "HOW I WORK",
        items: [
          "Placeholder: I always start from a question, not a dataset.",
          "Placeholder: point-by-point match data, cleaned by hand.",
          "Placeholder: a chart only when it adds something to the text.",
        ],
      },
      {
        label: "TOOLS",
        items: [
          "R and Python for the analysis",
          "D3 and Svelte for the interactive graphics",
          "Figma for page design",
          "Placeholder: add or remove what you need",
        ],
      },
      {
        label: "COLLABORATIONS",
        items: [
          "Placeholder: commissioned articles and graphics.",
          "Placeholder: consulting on sports data visualization.",
          "Placeholder: talks and workshops.",
        ],
      },
    ],
    toWork: "SEE THE PROJECTS",
    toContact: "WRITE TO ME",
  },

  it: {
    title: "Chi sono — Danilo De Rosa",
    description:
      "Chi sono, come lavoro e che tipo di collaborazioni mi interessano.",
    heading: "Chi sono",
    quote:
      "Lavoro con i dati e gioco - molto male - a tennis: qui è dove metto insieme le due cose.",
    paragraphs: [
      "Lavoro di più di cinque anni nel mondo della data visualization: mi piace costruire progetti web interattivi con animazioni e transizioni all'avanguardia, per spingere un po' più in là il confine della visualizzazione dati.",
      "Le pagine che sviluppo sono spesso in d3 e Svelte, ma mi adatto ai framework e ai linguaggi richiesti. Full disclosure: utilizzo l'AI a supporto del mio codice e per trovare errori e bug che mi sfuggono.",
      "Al di fuori del contesto lavorativo (e di quello tennistico), mi diletto ai fornelli (se posso con della cucina medio-orientale o asiatica), e ascolto decisamente troppa musica: almeno una volta a settimana mi riguardo un live dei Dire Straits :)",
    ],
    photoAlt: "Foto di Danilo De Rosa",
    photoPlaceholder: "[ foto verticale ]",
    blocks: [
      {
        label: "COME LAVORO",
        items: [
          "La storia prima dei dati, sempre!",
          "Ragioniamo insieme su grafici innovativi",
          "'I dati non mentono' è una bugia (cit. Sheldon Studio).",
        ],
      },
      {
        label: "STRUMENTI",
        items: [
          "D3 e Svelte per i grafici interattivi",
          "Figma per il disegno delle pagine",
          "Claude Code a supporto del mio codice",
        ],
      },
      {
        label: "COLLABORAZIONI",
        items: [
          "Articoli e data story, interattive o statiche",
          "Consulenze su data visualization",
          "Interventi, formazione e workshop",
        ],
      },
    ],
    toWork: "VEDI I PROGETTI",
    toContact: "SCRIVIMI",
  },
};
