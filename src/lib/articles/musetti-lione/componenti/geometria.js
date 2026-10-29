/**
 * PICCOLI AIUTI DI GEOMETRIA condivisi dai grafici dell'articolo:
 * dove mettere le etichette perche non escano dal disegno e non si
 * sovrappongano fra loro.
 */

/** Larghezza approssimata di un testo mono a 12px (token --type-mono-size). */
export const CARATTERE = 7.2;
/** @param {string} testo */
export const larghezzaTesto = (testo) => testo.length * CARATTERE;

/**
 * Etichetta centrata su `centro`, ma che non esce mai dal disegno:
 * se sfora a sinistra si attacca al bordo sinistro, se sfora a destra a quello destro.
 * Restituisce la x del testo e il suo text-anchor.
 *
 * @param {number} centro
 * @param {string} testo
 * @param {number} larghezza  larghezza del disegno
 * @param {number} [margine]
 * @param {number} [minimo]  bordo sinistro da non superare (default = margine):
 *   serve quando a sinistra c'e la colonna dei nomi
 */
export function etichetta(centro, testo, larghezza, margine = 4, minimo = margine) {
  const meta = larghezzaTesto(testo) / 2;
  if (centro - meta < minimo) return { x: minimo, ancora: 'start' };
  if (centro + meta > larghezza - margine) return { x: larghezza - margine, ancora: 'end' };
  return { x: centro, ancora: 'middle' };
}

/**
 * Posizione delle etichette dei riferimenti (le linee verticali: "Sua media",
 * "Tour"). Se due linee sono vicine, la prima ha l'etichetta a sinistra e la
 * seconda a destra, cosi i testi non si toccano; se nemmeno cosi ci stanno nel
 * disegno, restano centrate e la seconda scende di una riga (`dy`).
 *
 * @param {number[]} xs  posizioni delle linee, nell'ordine in cui arrivano
 * @param {string[]} testi
 * @param {number} larghezza  larghezza del disegno
 * @returns {{ x: number, ancora: string, dy: number }[]}  nello stesso ordine di `xs`
 */
export function ancoreRiferimenti(xs, testi, larghezza) {
  const indici = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
  const risultato = xs.map((x, i) => ({ ...etichetta(x, testi[i], larghezza), dy: 0 }));
  for (let k = 0; k + 1 < indici.length; k++) {
    const i = indici[k];
    const j = indici[k + 1];
    const spazio = larghezzaTesto(testi[i]) / 2 + larghezzaTesto(testi[j]) / 2 + 8;
    if (xs[j] - xs[i] >= spazio) continue;
    const sinistraOk = xs[i] - 4 - larghezzaTesto(testi[i]) >= 4;
    const destraOk = xs[j] + 4 + larghezzaTesto(testi[j]) <= larghezza - 4;
    if (sinistraOk && destraOk) {
      risultato[i] = { x: xs[i] - 4, ancora: 'end', dy: 0 };
      risultato[j] = { x: xs[j] + 4, ancora: 'start', dy: 0 };
    } else {
      risultato[j].dy = 14;
    }
  }
  return risultato;
}
