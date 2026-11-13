// Website version: one complete HTML page per language (the built game is a fragment) plus the rig file.
// Usage (from the project folder): node sim3d/build_site.mjs <website static folder>
// Writes <static>/finals-simulator/ (English) and <static>/it/finals-simulator/ (Italian).
// Chat apps (WhatsApp, Telegram) do not run JavaScript and read one preview image per address,
// so each language needs its own page with its own preview tags.
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname, stat = process.argv[2];
if (!stat) { console.error('usage: node sim3d/build_site.mjs <website static folder>'); process.exit(1); }
const SITE = 'https://daniloderosa.github.io';
const PATH = { en: '/finals-simulator/', it: '/it/finals-simulator/' };
const TEXT = {
  en: {
    title: 'ATP Finals Simulator',
    description: 'Pick one of 8 players and choose every shot. A free tennis game built on real match data, playable in the browser.',
    alt: 'Play the ATP Finals: 8 players, real match data. Free, plays in your browser.',
    locale: 'en_US',
  },
  it: {
    title: 'ATP Finals Simulator',
    description: 'Scegli uno degli 8 giocatori e decidi ogni colpo. Un gioco di tennis gratuito costruito su dati reali delle partite, si gioca nel browser.',
    alt: 'Gioca le ATP Finals: 8 giocatori, dati reali delle partite. Gratis, si gioca nel browser.',
    locale: 'it_IT',
  },
};
// the fragment starts with its own <title>: the page puts it in <head> instead
const body = fs.readFileSync(root + 'sim3d/dist/finals-simulator.html', 'utf8').replace(/^\s*<title>[^<]*<\/title>\s*/, '');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// English page only: same rule as the rest of the website (src/app.html). If the visitor chose Italian by hand
// ("ddr-lang") or, with no choice saved, the browser's first language is Italian, go to the Italian page.
const redirect = `<script>
(function () {
  var saved = null;
  try { saved = localStorage.getItem('ddr-lang'); } catch (e) {}
  var first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  var wantsItalian = saved ? saved === 'it' : /^it(-|$)/i.test(first);
  if (wantsItalian) location.replace('${PATH.it}' + location.search + location.hash);
})();
</script>
`;

function page(lang) {
  const t = TEXT[lang], url = SITE + PATH[lang], image = `${SITE}/og-finals-simulator-${lang}.png`;
  const other = lang === 'en' ? 'it' : 'en';
  const rig = lang === 'it' ? ` data-rig-path="${PATH.en}rig"` : '';
  return `<!doctype html>
<html lang="${lang}" data-game-lang="${lang}"${rig}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow"><!-- not indexed yet: reachable only by link -->
${lang === 'en' ? redirect : ''}<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.description)}">
<link rel="alternate" hreflang="${lang}" href="${url}">
<link rel="alternate" hreflang="${other}" href="${SITE + PATH[other]}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.png" type="image/png" sizes="48x48">
<!-- link previews (WhatsApp, Telegram, social networks) -->
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.alt)}">
<meta property="og:locale" content="${t.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(t.title)}">
<meta name="twitter:description" content="${esc(t.description)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${esc(t.alt)}">
<style>html,body{margin:0;background:#050b18}[hidden]{display:none!important}</style>
</head>
<body>
${body}
</body>
</html>
`;
}

for (const lang of ['en', 'it']) {
  const dir = stat + PATH[lang];
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', page(lang));
}
// rig: bone hierarchy and idle/run clips used by the game (extracted from the original model, no mesh).
// One copy, in the English folder: the Italian page points to it.
fs.copyFileSync(root + 'sim3d/rig.json', stat + PATH.en + 'rig.json');
console.log('ok', stat);
