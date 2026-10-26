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
 *   video     anteprima animata (MP4) in static/previews/, oppure assente
 *   poster    primo fotogramma del video (PNG): si vede prima che parta, e
 *             sempre per chi ha chiesto meno movimento nel sistema
 *   image     anteprima statica (PNG/JPG) al posto del video, oppure assente.
 *             Senza video ne image si vede il riquadro a righe con etichetta
 *   en / it   testi nella lingua: tag, titolo, descrizione, link, alt, azione.
 *             Il link puo cambiare con la lingua: la top 100 in italiano si
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
    image: null,
    video: "/previews/surface.mp4",
    poster: "/previews/surface.png",
    en: {
      tag: "SURFACES",
      title: "Has tennis become all the same?",
      description:
        "An interactive look at how surfaces differ, and whether it is true that tournaments now all look alike.",
      href: "https://daniloderosa.github.io/tennis_surface_speed/",
      alt: "Preview — line chart, speed of the 3 different surfaces (grass, hard court, clay) during different years",
      cta: "Open the project",
    },
    it: {
      tag: "SUPERFICI",
      title: "Il tennis è diventato tutto uguale?",
      description:
        "Uno sguardo interattivo a come le superfici differiscono e se è vero che i tornei ora si assomigliano tutti.",
      href: "https://daniloderosa.github.io/tennis_surface_speed/",
      alt: "Anteprima — grafico a linee, velocità delle 3 diversi superfici (erba, cemento, terra) nel corso degli anni",
      cta: "Apri il progetto",
    },
  },
  {
    id: "top100",
    year: 2026,
    category: "tennis",
    external: true,
    image: null,
    video: "/previews/atp_top100.mp4",
    poster: "/previews/atp_top100.png",
    en: {
      tag: "RANKING",
      title: "The ATP top 100 numbers, every Monday",
      description:
        "An interactive page to compare the stats of the ATP top 100 (updated every Monday).",
      href: "https://daniloderosa.github.io/tennis_top100/",
      alt: "Interactive page with the stats of the top 100 players on the ATP men's tour",
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
      "Essays and interactive graphics, mostly about tennis, but also on other topics.",
    heading: "Projects",
    lead: "Essays and interactive graphics, mostly about tennis, but also on other topics. The articles often include interactive visualizations and charts.",
    counter: "PROJECTS",
    categories: { tennis: "TENNIS", other: "OTHER" },
    pitch: {
      title: "Have a dataset worth a closer look?",
      text: "Collaborations and consulting on data visualization and sports performance analysis.",
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
