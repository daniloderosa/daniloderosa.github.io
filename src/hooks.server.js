/**
 * Sostituisce il segnaposto %lang% in app.html con la lingua della pagina:
 * "it" per tutto cio che sta sotto /it/, "en" per il resto.
 * Serve ai lettori di schermo e ai motori di ricerca.
 */
export function handle({ event, resolve }) {
  const lang = event.url.pathname.startsWith('/it') ? 'it' : 'en';
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang)
  });
}
