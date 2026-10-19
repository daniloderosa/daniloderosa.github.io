/**
 * Completa src/app.html pagina per pagina, al momento della build:
 * - %lang%  diventa "it" sotto /it/, "en" altrove (lettori di schermo,
 *           motori di ricerca);
 * - %theme% diventa "terra" per le due home e "panna" per tutte le altre
 *           pagine. Decide il colore di fondo dell'intera pagina, anche
 *           dello spazio che si vede quando si "tira" la pagina oltre i bordi.
 */
const HOMES = ['/', '/it/'];

export function handle({ event, resolve }) {
  const { pathname } = event.url;
  const lang = pathname.startsWith('/it') ? 'it' : 'en';
  const theme = HOMES.includes(pathname) ? 'terra' : 'panna';
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang).replace('%theme%', theme)
  });
}
