/**
 * FORMATI NUMERICI nelle due lingue, usati da tutti i grafici dell'articolo.
 *   it: virgola per i decimali, punto per le migliaia   (59,7%  1.448)
 *   en: punto per i decimali, virgola per le migliaia   (59.7%  1,448)
 * Il segno meno e sempre quello vero (−).
 *
 * Uso:  const { num, perc, migliaia, segno } = formati('en');
 */

/**
 * @param {'it' | 'en'} lang
 */
export function formati(lang) {
  const decimale = lang === 'it' ? ',' : '.';
  const separatoreMigliaia = lang === 'it' ? '.' : ',';

  /**
   * Numero con i decimali della lingua: num(59.7, 1) -> "59,7" (it) o "59.7" (en)
   * @param {number} n
   * @param {number} [decimali]
   */
  const num = (n, decimali = 0) => n.toFixed(decimali).replace('.', decimale);

  /**
   * Percentuale: perc(59.7, 1) -> "59,7%" (it) o "59.7%" (en)
   * @param {number} n
   * @param {number} [decimali]
   */
  const perc = (n, decimali = 0) => `${num(n, decimali)}%`;

  /**
   * Migliaia: migliaia(1448) -> "1.448" (it) o "1,448" (en)
   * @param {number} n
   */
  const migliaia = (n) =>
    String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, separatoreMigliaia);

  /**
   * Numero con segno esplicito: segno(-11.5, 1) -> "−11,5", segno(2) -> "+2"
   * @param {number} n
   * @param {number} [decimali]
   */
  function segno(n, decimali = 0) {
    const v = Number(n.toFixed(decimali));
    if (v < 0) return `−${num(-v, decimali)}`;
    if (v > 0) return `+${num(v, decimali)}`;
    return num(0, decimali);
  }

  return { num, perc, migliaia, segno };
}
