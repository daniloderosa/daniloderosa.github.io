<script>
  /**
   * Nastro scorrevole con le parole chiave del sito.
   * E solo decorativo: i lettori di schermo lo saltano (aria-hidden).
   *
   * Lo scorrimento lo muove JavaScript, non un'animazione CSS: cosi, quando
   * ci passi sopra col mouse, il testo si ferma esattamente dov'e e riparte
   * da li quando esci. (Con la pausa CSS, Chrome e Safari a volte lo
   * riportavano indietro di colpo.)
   *
   * Chi ha chiesto meno movimento nelle impostazioni del sistema, o non ha
   * JavaScript attivo, vede il nastro fermo.
   *
   * @type {{ words: string[] }}
   */
  let { words } = $props();

  // Durata di un giro completo, in secondi. Piu alto = piu lento.
  const LAP_SECONDS = 60;

  // Il testo si ripete piu volte per riempire anche gli schermi larghi;
  // due copie identiche affiancate rendono il giro continuo, senza scatti.
  const line = $derived(Array(3).fill(words.join(' · ')).join(' · ') + ' ·');

  /** @type {HTMLDivElement} */
  let track;
  let paused = false;

  $effect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let offset = 0; // spostamento attuale verso sinistra, in pixel
    let last = performance.now();
    let raf = 0;

    /** @param {number} now */
    function tick(now) {
      // Mezzo secondo al massimo: se la scheda era nascosta, niente salti.
      const dt = Math.min(0.5, (now - last) / 1000);
      last = now;
      if (!paused) {
        // Una copia del testo e meta della striscia: quando l'ha percorsa
        // tutta si riparte da zero, e l'occhio non vede la giunzione.
        const lap = track.scrollWidth / 2;
        offset = (offset + (lap / LAP_SECONDS) * dt) % lap;
        track.style.transform = `translateX(${-offset}px)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  });
</script>

<div
  class="ticker"
  aria-hidden="true"
  onpointerenter={() => (paused = true)}
  onpointerleave={() => (paused = false)}
>
  <div class="track" bind:this={track}>
    <span>{line}</span>
    <span>{line}</span>
  </div>
</div>

<style>
  .ticker {
    overflow: hidden;
    background: var(--ticker-bg);
    padding: var(--space-2) 0;
  }

  .track {
    display: flex;
    width: max-content;
    will-change: transform;
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    line-height: 1.5;
    letter-spacing: var(--tracking-soft);
    /* Il nastro ha sempre fondo scuro: il lime e fisso, non segue la palette. */
    color: var(--ball);
    white-space: nowrap;
  }

  .track span {
    padding-right: var(--space-6);
  }

  @media (min-width: 700px) {
    .track {
      font-size: var(--type-label);
    }
  }
</style>
