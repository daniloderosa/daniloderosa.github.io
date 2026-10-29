/**
 * FORMATI NUMERICI ALL'ITALIANA, usati da tutti i grafici dell'articolo.
 * Virgola per i decimali, punto per le migliaia, vero segno meno (−).
 */

/**
 * Numero con virgola decimale: num(59.7, 1) -> "59,7"
 * @param {number} n
 * @param {number} [decimali]
 */
export const num = (n, decimali = 0) => n.toFixed(decimali).replace('.', ',');

/**
 * Percentuale: perc(59.7, 1) -> "59,7%"
 * @param {number} n
 * @param {number} [decimali]
 */
export const perc = (n, decimali = 0) => `${num(n, decimali)}%`;

/**
 * Migliaia con il punto: migliaia(3021) -> "3.021"
 * @param {number} n
 */
export const migliaia = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Numero con segno esplicito: segno(-11.5, 1) -> "−11,5", segno(2) -> "+2"
 * @param {number} n
 * @param {number} [decimali]
 */
export function segno(n, decimali = 0) {
  const v = Number(n.toFixed(decimali));
  if (v < 0) return `−${num(-v, decimali)}`;
  if (v > 0) return `+${num(v, decimali)}`;
  return num(0, decimali);
}
