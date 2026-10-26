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
    id: "surface-speed",
    year: 2026,
    category: "tennis",
    external: true,
    // Anteprima non ancora disponibile: metti il PNG in static/previews/
    // e sostituisci null con '/previews/tennis-surface-speed.png'.
    image: null,
    en: {
      tag: "SURFACES",
      title: "How fast is a tennis court, really?",
      description:
        "Court speed is talked about constantly and measured almost never. An interactive look at how surfaces actually differ, tournament by tournament.",
      href: "https://daniloderosa.github.io/tennis_surface_speed/",
      alt: "Preview — line chart, speed by tournament",
      cta: "Open the project",
    },
    it: {
      tag: "SUPERFICI",
      title: "Il tennis è diventato tutto uguale?",
      description:
        "Uno sguardo interattivo a come le superfici differiscono e se è vero che i tornei ora si assomigliano tutti.",
      href: "https://daniloderosa.github.io/tennis_surface_speed/",
      alt: "Anteprima — grafico a linee, velocità per torneo",
      cta: "Apri il progetto",
    },
  },
  {
    id: "top100",
    year: 2026,
    category: "tennis",
    external: true,
    // Anteprima non ancora disponibile: metti il PNG in static/previews/
    // e sostituisci null con '/previews/tennis-top50.png'.
    image: null,
    en: {
      tag: "RANKING",
      title: "The top 100, up close",
      description:
        "A profile of the players inside the ATP top 50: serve and return numbers side by side, with the trade-offs each game style makes.",
      href: "https://daniloderosa.github.io/tennis_top100/",
      alt: "Preview — scatterplot of serve and return",
      cta: "Open the project",
    },
    it: {
      tag: "CLASSIFICA",
      title: "I numeri dei top 100 ATP, ogni lunedì",
      description:
        "Una pagina interattiva per confrontare le statistiche dei top 100 ATP (aggiornata ogni lunedì).",
      href: "https://daniloderosa.github.io/tennis_top100/?lang=it",
      alt: "Pagina interattiva sulle statistiche dei top 100 giocatori del circuito maschile ATP",
      cta: "Apri il progetto",
    },
  },
];

/* Testi della pagina */
export const projectsPage = {
  en: {
    title: "Projects — Danilo De Rosa",
    description:
      "Essays and interactive graphics built on match data: serve and return patterns, surface behavior, era comparisons.",
    heading: "Projects",
    lead: "Essays and interactive graphics built on match data: serve and return patterns, surface behavior, era comparisons. Every piece pairs a readable argument with a visualization you can question.",
    counter: "PROJECTS",
    categories: { tennis: "TENNIS", other: "OTHER" },
    pitch: {
      title: "Have a dataset worth a closer look?",
      text: "Collaborations, commissions and consulting on sports data visualization.",
      cta: "WRITE TO ME",
    },
  },
  it: {
    title: "Progetti — Danilo De Rosa",
    description:
      "Saggi e grafici interattivi costruiti a tema tennis (la maggior parte) oppure altre tematiche.",
    heading: "Progetti",
    lead: "Saggi e grafici interattivi costruiti a tema tennis (la maggior parte) oppure altre tematiche. Negli articoli sono spesso presenti visualizzazioni e grafici interattivi.",
    counter: "PROGETTI",
    categories: { tennis: "TENNIS", other: "ALTRO" },
    pitch: {
      title: "Hai un dataset che merita uno sguardo?",
      text: "Collaborazioni e consulenze su visualizzazioni dati e analisi di performance sportiva.",
      cta: "SCRIVIMI",
    },
  },
};
