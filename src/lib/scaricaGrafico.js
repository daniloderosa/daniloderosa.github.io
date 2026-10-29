// @ts-nocheck  (codice che lavora sul DOM: il controllo tipi di `npm run check` qui darebbe solo rumore)

/**
 * SCARICA UN GRAFICO COME IMMAGINE PNG
 * ------------------------------------------------------------------------
 * COSA FA
 *   `scaricaGrafico(figura, nomeFile)` prende il riquadro di un grafico
 *   (l'elemento <figure class="frame"> di ChartFrame.svelte) e ne salva una
 *   foto PNG: bordo, titolo, sottotitolo, grafico, fonte e nota, su fondo
 *   bianco, alla larghezza che il riquadro ha a schermo e a risoluzione
 *   doppia (scala 2) per essere nitida.
 *
 *   Tutto cio che ha l'attributo `data-escludi-immagine` (le icone, il
 *   pulsante "Dati in tabella" e il suo <dialog>) NON finisce nell'immagine.
 *
 * PASSI
 *   1. Si aspetta che i font della pagina siano caricati.
 *   2. Si costruisce a mano un SVG: cornice, testi (con a-capo calcolato) e,
 *      al centro, una copia del grafico con gli stili "congelati".
 *   3. Si ricavano i font Archivo / JetBrains Mono / Spectral da Google Fonts
 *      e si incorporano nell'SVG (base64).
 *   4. SVG -> immagine -> <canvas> a scala 2 -> PNG -> download.
 *
 * PERCHE' UN SVG "PURO" (senza <foreignObject>)
 *   Il modo comune di fotografare l'HTML e' infilarlo in un <foreignObject>.
 *   Safari pero' considera "contaminato" (tainted) il canvas in cui si
 *   disegna un SVG con foreignObject e rifiuta di esportarlo. Per questo
 *   ridisegniamo noi anche i testi del riquadro come <text> SVG.
 *
 * PERCHE' GLI STILI "CONGELATI"
 *   Un SVG usato come immagine e' un documento isolato: non vede il CSS della
 *   pagina (ne' le custom properties come var(--player-a), ne' gli stili
 *   scoped di Svelte). Quindi per ogni elemento del grafico leggiamo lo stile
 *   calcolato dal browser (che ha gia' risolto ogni var()) e lo scriviamo
 *   "inline" sulla copia.
 *
 * PERCHE' I FONT INCORPORATI
 *   Per lo stesso motivo l'immagine non puo' usare i font della pagina:
 *   scarichiamo i file dei font e li mettiamo dentro l'SVG come data URI.
 *   Se il download dei font fallisce (offline) si prosegue con i font di
 *   ripiego, senza errore.
 */

const NS_SVG = 'http://www.w3.org/2000/svg';
const SCALA = 2; // risoluzione doppia del PNG
const ATTR_ESCLUDI = 'data-escludi-immagine';

/** Cache di modulo: i font si scaricano una sola volta per sessione. */
let cacheFont = null;

/* ======================================================================
 * UTILITA' PUBBLICA
 * ==================================================================== */

/**
 * Trasforma un titolo in un nome di file: minuscolo, senza accenti, con i
 * trattini al posto dei simboli, al massimo 60 caratteri.
 * Esempio: "Dove vince i punti?" -> "dove-vince-i-punti"
 */
export function nomeFileDaTitolo(titolo) {
  return String(titolo ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // toglie gli accenti
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '') || 'grafico';
}

/* ======================================================================
 * FUNZIONE PRINCIPALE
 * ==================================================================== */

/**
 * @param {HTMLElement} figura  il <figure class="frame"> del grafico
 * @param {string} nomeFile     nome del file senza estensione
 */
export async function scaricaGrafico(figura, nomeFile) {
  if (!(figura instanceof HTMLElement)) {
    throw new Error('scaricaGrafico: elemento del grafico non valido.');
  }

  // Passo 1: font della pagina pronti (servono per misurare i testi)
  await document.fonts.ready;

  // Passo 2: costruzione dell'SVG (cornice + testi + grafico)
  const { svg, larghezza, altezza, famiglie } = costruisciSvg(figura);

  // Passo 3: font incorporati (se non si riesce, si va avanti senza)
  const css = await cssFontIncorporati(famiglie);
  if (css) {
    const stile = document.createElementNS(NS_SVG, 'style');
    stile.textContent = css;
    svg.insertBefore(stile, svg.firstChild);
  }

  // Passo 4: SVG -> PNG -> download
  const testoSvg = new XMLSerializer().serializeToString(svg);
  const blob = await svgInPng(testoSvg, larghezza, altezza);
  scaricaBlob(blob, `${nomeFile || 'grafico'}.png`);
}

/* ======================================================================
 * COSTRUZIONE DELL'SVG
 * ==================================================================== */

/** Legge un valore in pixel da una proprieta' calcolata ("12px" -> 12). */
const px = (valore) => parseFloat(valore) || 0;

/** Crea un elemento SVG con gli attributi indicati. */
function el(nome, attributi = {}) {
  const nodo = document.createElementNS(NS_SVG, nome);
  for (const [k, v] of Object.entries(attributi)) nodo.setAttribute(k, v);
  return nodo;
}

/** Testo di un elemento senza le parti escluse, con gli spazi normalizzati. */
function leggiTesto(elemento) {
  const copia = elemento.cloneNode(true);
  copia.querySelectorAll(`[${ATTR_ESCLUDI}]`).forEach((n) => n.remove());
  return copia.textContent.replace(/\s+/g, ' ').trim();
}

/**
 * Costruisce l'SVG completo del riquadro, impilando dall'alto:
 * bordo/padding, titolo, sottotitolo, grafico, riga fonte (con filetto).
 * Misure, font e colori vengono dallo stile calcolato degli elementi veri.
 */
function costruisciSvg(figura) {
  const csFig = getComputedStyle(figura);
  const rettFig = figura.getBoundingClientRect();
  const larghezza = Math.round(rettFig.width);

  const bordo = {
    t: px(csFig.borderTopWidth),
    r: px(csFig.borderRightWidth),
    b: px(csFig.borderBottomWidth),
    l: px(csFig.borderLeftWidth),
  };
  const sinistra = bordo.l + px(csFig.paddingLeft);
  const larghezzaUtile = larghezza - sinistra - bordo.r - px(csFig.paddingRight);

  // Canvas di servizio, solo per misurare quanto e' larga una riga di testo
  const ctx = document.createElement('canvas').getContext('2d');

  const contenuto = el('g'); // tutto cio che sta dentro la cornice
  const famiglie = new Set(); // font effettivamente usati (per filtrare i font da incorporare)
  let y = bordo.t + px(csFig.paddingTop);

  /** Disegna un blocco di testo con a-capo; ritorna l'altezza occupata. */
  const blocco = (elemento, x0, larghezzaBlocco, yTop) => {
    const testo = leggiTesto(elemento);
    if (!testo) return 0;
    const cs = getComputedStyle(elemento);
    const dimensione = px(cs.fontSize);
    const interlinea = px(cs.lineHeight) || dimensione * 1.2;
    const spaziatura = px(cs.letterSpacing); // "normal" -> 0
    famiglie.add(primaFamiglia(cs.fontFamily));

    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spaziatura}px`;
    const m = ctx.measureText('Hg');
    const ascent = m.fontBoundingBoxAscent ?? dimensione * 0.8;
    const descent = m.fontBoundingBoxDescent ?? dimensione * 0.2;

    const righe = andaACapo(ctx, testo, larghezzaBlocco);
    righe.forEach((riga, i) => {
      // baseline: la riga di testo sta centrata nell'altezza dell'interlinea
      const base = yTop + i * interlinea + (interlinea - (ascent + descent)) / 2 + ascent;
      const t = el('text', { x: x0, y: base });
      t.style.setProperty('font-family', cs.fontFamily);
      t.style.setProperty('font-size', cs.fontSize);
      t.style.setProperty('font-weight', cs.fontWeight);
      t.style.setProperty('font-style', cs.fontStyle);
      t.style.setProperty('letter-spacing', `${spaziatura}px`);
      t.setAttribute('fill', cs.color);
      t.textContent = riga;
      contenuto.append(t);
    });
    return righe.length * interlinea;
  };

  /**
   * Un elemento e' un "contenitore" se dentro ha altri elementi a blocco
   * (es. la riga fonte con fonte e nota su righe separate); altrimenti e'
   * un paragrafo di testo da scrivere cosi' com'e'.
   */
  const eContenitore = (nodo) =>
    [...nodo.children].some(
      (f) => !f.hasAttribute(ATTR_ESCLUDI) && getComputedStyle(f).display !== 'inline'
    );

  /** Disegna un elemento (contenitore o testo); ritorna l'altezza occupata. */
  const disponi = (nodo, x0, larghezzaNodo, yTop) => {
    if (!eContenitore(nodo)) return blocco(nodo, x0, larghezzaNodo, yTop);
    const cs = getComputedStyle(nodo);
    const pl = px(cs.paddingLeft);
    const pt = px(cs.paddingTop);
    const h = impila(nodo, x0 + pl, larghezzaNodo - pl - px(cs.paddingRight), yTop + pt);
    return h > 0 ? h + pt + px(cs.paddingBottom) : 0;
  };

  /**
   * Dispone i figli di un contenitore, saltando quelli esclusi (icone, pulsanti).
   * In riga (flex row) ogni figlio sta dove e' a schermo, con la sua larghezza,
   * cosi' il testo va a capo come nel riquadro; altrimenti i figli si impilano.
   */
  const impila = (contenitore, x0, larghezzaContenitore, yTop) => {
    const cs = getComputedStyle(contenitore);
    const inRiga = cs.display.includes('flex') && cs.flexDirection.startsWith('row');
    const figli = [...contenitore.children].filter((f) => !f.hasAttribute(ATTR_ESCLUDI));
    const gap = px(cs.rowGap);
    let altezza = 0;
    for (const figlio of figli) {
      let h;
      if (inRiga) {
        const r = figlio.getBoundingClientRect();
        h = disponi(figlio, r.left - rettFig.left, r.width, yTop);
        altezza = Math.max(altezza, h);
      } else {
        const sopra = altezza > 0 ? gap : 0;
        h = disponi(figlio, x0, larghezzaContenitore, yTop + altezza + sopra);
        if (h > 0) altezza += sopra + h;
      }
    }
    return altezza;
  };

  // Titolo e sottotitolo
  for (const classe of ['title', 'subtitle']) {
    const e = figura.querySelector(`:scope > .${classe}`);
    if (!e || e.closest(`[${ATTR_ESCLUDI}]`)) continue;
    const cs = getComputedStyle(e);
    y += px(cs.marginTop);
    y += blocco(e, sinistra, larghezzaUtile, y);
    y += px(cs.marginBottom);
  }

  // Grafico: una o piu' <svg> dentro .plot, alla posizione che hanno a schermo
  const plot = figura.querySelector(':scope > .plot');
  if (plot) {
    const csPlot = getComputedStyle(plot);
    const rettPlot = plot.getBoundingClientRect();
    y += px(csPlot.marginTop);
    const grafici = [...plot.querySelectorAll('svg')].filter(
      (s) => !s.parentElement.closest('svg') && !s.closest(`[${ATTR_ESCLUDI}]`)
    );
    for (const g of grafici) {
      const r = g.getBoundingClientRect();
      const copia = copiaGrafico(g, r, famiglie);
      copia.setAttribute('x', r.left - rettFig.left);
      copia.setAttribute('y', y + (r.top - rettPlot.top));
      contenuto.append(copia);
    }
    y += rettPlot.height + px(csPlot.marginBottom);
  }

  // Riga della fonte: filetto superiore + fonte + nota (la parte esclusa non c'e')
  const piede = figura.querySelector(':scope > .foot');
  if (piede && !piede.closest(`[${ATTR_ESCLUDI}]`)) {
    const cs = getComputedStyle(piede);
    y += px(cs.marginTop);
    if (px(cs.borderTopWidth) > 0) {
      contenuto.append(
        el('rect', { x: sinistra, y, width: larghezzaUtile, height: px(cs.borderTopWidth), fill: cs.borderTopColor })
      );
    }
    y += px(cs.borderTopWidth) + px(cs.paddingTop);
    y += impila(piede, sinistra + px(cs.paddingLeft), larghezzaUtile - px(cs.paddingLeft) - px(cs.paddingRight), y);
    y += px(cs.paddingBottom);
  }

  y += px(csFig.paddingBottom) + bordo.b;
  const altezza = Math.ceil(y);

  // Cornice: fondo bianco + i quattro lati del bordo
  const svg = el('svg', {
    xmlns: NS_SVG,
    width: larghezza,
    height: altezza,
    viewBox: `0 0 ${larghezza} ${altezza}`,
  });
  svg.append(el('rect', { x: 0, y: 0, width: larghezza, height: altezza, fill: '#ffffff' }));
  const lati = [
    ['borderTop', 0, 0, larghezza, bordo.t],
    ['borderBottom', 0, altezza - bordo.b, larghezza, bordo.b],
    ['borderLeft', 0, 0, bordo.l, altezza],
    ['borderRight', larghezza - bordo.r, 0, bordo.r, altezza],
  ];
  for (const [prop, x, yy, w, h] of lati) {
    if (w > 0 && h > 0) svg.append(el('rect', { x, y: yy, width: w, height: h, fill: csFig[`${prop}Color`] }));
  }
  svg.append(contenuto);

  return { svg, larghezza, altezza, famiglie };
}

/** "\"Archivo\", sans-serif" -> "Archivo" */
function primaFamiglia(valore) {
  return valore.split(',')[0].trim().replace(/^["']|["']$/g, '');
}

/**
 * Spezza il testo in righe che stanno nella larghezza data, misurando con il
 * font gia' impostato sul canvas. Una parola piu' lunga della riga resta intera.
 */
function andaACapo(ctx, testo, larghezzaMax) {
  const righe = [];
  let corrente = '';
  for (const parola of testo.split(' ')) {
    const prova = corrente ? `${corrente} ${parola}` : parola;
    if (corrente && ctx.measureText(prova).width > larghezzaMax) {
      righe.push(corrente);
      corrente = parola;
    } else {
      corrente = prova;
    }
  }
  if (corrente) righe.push(corrente);
  return righe;
}

/* ----------------------------------------------------------------------
 * Copia del grafico con stili congelati
 * -------------------------------------------------------------------- */

// Proprieta' CSS che contano per il disegno: vengono scritte inline sulla copia
const PROPRIETA = [
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin',
  'stroke-miterlimit', 'opacity', 'visibility', 'paint-order', 'overflow',
  'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant-numeric',
  'letter-spacing', 'text-anchor', 'dominant-baseline', 'text-transform',
  'text-decoration-line', 'stop-color', 'stop-opacity', 'shape-rendering',
  'text-rendering', 'vector-effect', 'clip-path', 'mask', 'filter',
];
// Le proprieta' che contengono riferimenti url(#id) (gradienti, clip, ecc.)
const CON_URL = new Set(['fill', 'stroke', 'clip-path', 'mask', 'filter']);

/**
 * Clona l'<svg> del grafico e scrive su ogni elemento lo stile calcolato.
 * Visita in parallelo originale e copia (hanno la stessa struttura).
 */
function copiaGrafico(originale, rett, famiglie) {
  const copia = originale.cloneNode(true);

  const visita = (orig, cop) => {
    // Elementi esclusi, titoli interni e nodi nascosti: via dalla copia
    const figliOrig = [...orig.children];
    const figliCop = [...cop.children];
    figliOrig.forEach((o, i) => {
      const c = figliCop[i];
      const cs = getComputedStyle(o);
      const daTogliere =
        o.hasAttribute(ATTR_ESCLUDI) ||
        ['title', 'desc'].includes(o.localName) ||
        (cs.display === 'none' && o.localName !== 'defs' && o.localName !== 'lineargradient');
      if (daTogliere) c.remove();
      else visita(o, c);
    });
    congela(orig, cop);
  };

  const congela = (orig, cop) => {
    const cs = getComputedStyle(orig);
    for (const prop of PROPRIETA) {
      let valore = cs.getPropertyValue(prop);
      if (!valore) continue;
      // url("http://.../pagina#id") -> url(#id): nell'immagine esiste solo l'SVG
      if (CON_URL.has(prop)) valore = valore.replace(/url\("?[^")#]*#/g, 'url(#').replace(/"\)/g, ')');
      cop.style.setProperty(prop, valore);
    }
    // Trasformazioni CSS (se ci sono): si copiano insieme alla loro origine
    if (cs.transform && cs.transform !== 'none') {
      cop.style.setProperty('transform', cs.transform);
      cop.style.setProperty('transform-origin', cs.transformOrigin);
      cop.style.setProperty('transform-box', cs.transformBox);
    }
    if (orig.localName === 'text' || orig.localName === 'tspan') famiglie.add(primaFamiglia(cs.fontFamily));
    // Gli attributi di accessibilita' non servono in un'immagine
    cop.removeAttribute('class');
    cop.removeAttribute('tabindex');
  };

  visita(originale, copia);

  // Radice: dimensioni esatte in pixel; il resto (viewBox) resta com'era
  copia.setAttribute('width', rett.width);
  copia.setAttribute('height', rett.height);
  if (!copia.getAttribute('viewBox')) copia.setAttribute('viewBox', `0 0 ${rett.width} ${rett.height}`);
  copia.setAttribute('xmlns', NS_SVG);
  copia.removeAttribute('role');
  copia.removeAttribute('aria-hidden');
  return copia;
}

/* ======================================================================
 * FONT INCORPORATI
 * ==================================================================== */

/**
 * Ritorna il CSS (@font-face con data URI) dei soli font usati, oppure ''
 * se non e' possibile ottenerlo. Non lancia mai errori: i font sono un
 * miglioramento, non un requisito.
 */
async function cssFontIncorporati(famiglie) {
  try {
    cacheFont ??= scaricaFont();
    const tutti = await cacheFont;
    const usati = tutti.filter((f) => famiglie.has(f.famiglia));
    return (usati.length ? usati : tutti).map((f) => f.css).join('\n');
  } catch {
    cacheFont = null; // al prossimo download si riprova
    return '';
  }
}

/**
 * Legge dal foglio Google Fonts gia' collegato in app.html i blocchi
 * @font-face, e ne scarica i file. Si tiene solo il sottoinsieme "latin"
 * (include le lettere accentate italiane) per non appesantire l'immagine.
 */
async function scaricaFont() {
  const link = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com/css"]');
  if (!link) throw new Error('Foglio dei font non trovato');
  const css = await (await fetch(link.href)).text();

  const risultato = [];
  // Ogni blocco e' preceduto da un commento col nome del sottoinsieme: /* latin */
  const blocchi = css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g);
  for (const [, sottoinsieme, blocco] of blocchi) {
    if (sottoinsieme !== 'latin') continue;
    const famiglia = /font-family:\s*['"]?([^;'"]+)['"]?/.exec(blocco)?.[1].trim();
    const url = /url\(([^)]+)\)/.exec(blocco)?.[1].replace(/["']/g, '');
    if (!famiglia || !url) continue;
    const dati = await (await fetch(url)).arrayBuffer();
    const css64 = blocco.replace(/url\([^)]+\)/, `url(data:font/woff2;base64,${base64(dati)})`);
    risultato.push({ famiglia, css: css64 });
  }
  if (!risultato.length) throw new Error('Nessun font ricavato');
  return risultato;
}

/** ArrayBuffer -> base64, a pezzi per non superare i limiti degli argomenti. */
function base64(buffer) {
  const byte = new Uint8Array(buffer);
  let testo = '';
  for (let i = 0; i < byte.length; i += 0x8000) {
    testo += String.fromCharCode(...byte.subarray(i, i + 0x8000));
  }
  return btoa(testo);
}

/* ======================================================================
 * SVG -> PNG -> DOWNLOAD
 * ==================================================================== */

/** Disegna l'SVG su un canvas a scala 2 e ne ricava un PNG (Blob). */
async function svgInPng(testoSvg, larghezza, altezza) {
  const immagine = new Image();
  // Data URL (non blob:): e' l'unico modo che Safari accetta senza "sporcare" il canvas
  immagine.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(testoSvg)}`;
  try {
    await immagine.decode();
  } catch {
    throw new Error("Impossibile generare l'immagine del grafico (SVG non valido).");
  }

  const canvas = document.createElement('canvas');
  canvas.width = larghezza * SCALA;
  canvas.height = altezza * SCALA;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas non disponibile in questo browser.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(immagine, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((ok) => {
    try {
      canvas.toBlob(ok, 'image/png');
    } catch {
      ok(null);
    }
  });
  if (!blob) throw new Error('Il browser non ha potuto creare il file PNG.');
  return blob;
}

/** Avvia il download di un Blob tramite un link temporaneo. */
function scaricaBlob(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000); // lascia il tempo di avviare il download
}
