import { routes } from '$lib/data/routes.js';

/**
 * Completa src/app.html pagina per pagina, al momento della build:
 * - %lang%  diventa "it" sotto /it/, "en" altrove (lettori di schermo,
 *           motori di ricerca);
 * - %theme% diventa "terra" per le due home e "panna" per tutte le altre
 *           pagine. Decide il colore di fondo dell'intera pagina, anche
 *           dello spazio che si vede quando si "tira" la pagina oltre i bordi;
 * - %twin%  diventa, per le pagine INGLESI, l'indirizzo della stessa pagina
 *           in italiano (es. "/projects/" -> "/it/progetti/"); per le pagine
 *           italiane e per quelle senza gemella resta vuoto. Lo usa lo script
 *           in app.html che porta in italiano chi ha il browser in italiano.
 */
const HOMES = ['/', '/it/'];

export function handle({ event, resolve }) {
  const { pathname } = event.url;
  const lang = pathname.startsWith('/it') ? 'it' : 'en';
  const theme = HOMES.includes(pathname) ? 'terra' : 'panna';
  const page = Object.values(routes).find((r) => r.en === pathname);
  const twin = lang === 'en' && page ? page.it : '';
  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%lang%', lang).replace('%theme%', theme).replace('%twin%', twin)
  });
}
