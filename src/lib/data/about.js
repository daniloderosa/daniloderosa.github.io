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
      "I work with data and play tennis — very badly: this is where I put the two together.",
    paragraphs: [
      "I have been working in data visualization for more than five years: I like building interactive web projects with cutting-edge animations and transitions, to push the boundaries of data visualization a little further.",
      "The pages I build are often in D3 and Svelte, but I adapt to whatever frameworks and languages are required. Full disclosure: I use AI to support my code and to catch errors and bugs that slip past me.",
      "Outside of work (and tennis), I like to potter around the kitchen (Middle Eastern or Asian cooking, if I can), and I listen to far too much music: at least once a week I rewatch a Dire Straits live show :)",
    ],
    photoAlt: "Photo of Danilo De Rosa",
    photoPlaceholder: "[ vertical photo ]",
    blocks: [
      {
        label: "HOW I WORK",
        items: [
          "The story before the data, always!",
          "Let's think through innovative charts together",
          "\"Data doesn't lie\" is a lie (quote: Sheldon Studio).",
        ],
      },
      {
        label: "TOOLS",
        items: [
          "D3 and Svelte for the interactive graphics",
          "Figma for page design",
          "Claude Code to support my code",
        ],
      },
      {
        label: "COLLABORATIONS",
        items: [
          "Articles and data stories, interactive or static",
          "Consulting on data visualization",
          "Talks, training and workshops",
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
      "Lavoro da più di cinque anni nel mondo della data visualization: mi piace costruire progetti web interattivi con animazioni e transizioni all'avanguardia, per spingere un po' più in là il confine della visualizzazione dati.",
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
