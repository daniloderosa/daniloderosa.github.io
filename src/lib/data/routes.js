/**
 * INDIRIZZI DEL SITO, nelle due lingue.
 *
 * Ogni pagina ha una chiave (home, projects, about, contact, musettiLione) e un indirizzo per
 * lingua. Da qui leggono tutti: i menu, i pulsanti e il selettore lingua,
 * che cosi porta sempre alla pagina gemella e mai alla home.
 *
 * Se aggiungi una pagina: crea le due cartelle in src/routes/ e aggiungi
 * qui la riga corrispondente. Gli indirizzi finiscono sempre con "/".
 *
 */

/** @type {Record<string, { en: string, it: string }>} */
export const routes = {
  home: { en: "/", it: "/it/" },
  projects: { en: "/projects/", it: "/it/progetti/" },
  about: { en: "/about/", it: "/it/chi-sono/" },
  contact: { en: "/contact/", it: "/it/contatti/" },
  musettiLione: { en: "/articles/musetti-lione/", it: "/it/articoli/musetti-lione/" },
};

/**
 * Indirizzo di una pagina in una lingua.
 * @param {string} page   chiave della pagina: home, projects, about, contact
 * @param {'en' | 'it'} lang
 */
export function path(page, lang) {
  return routes[page][lang];
}

/**
 * Indirizzo della stessa pagina nell'altra lingua.
 * @param {string} page   chiave della pagina: home, projects, about, contact
 * @param {'en' | 'it'} lang
 */
export function twin(page, lang) {
  return routes[page][lang === "en" ? "it" : "en"];
}
