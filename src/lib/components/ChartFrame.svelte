<script>
  /**
   * CONTENITORE CONDIVISO DEI GRAFICI.
   * Ogni grafico del sito passa da qui: garantisce che titolo, sottotitolo,
   * fonte e riassunto testuale ci siano sempre e stiano sempre nello stesso
   * posto. Il grafico vero e proprio si passa dentro (snippet `children`).
   *
   * title     titolo del grafico: dice cosa si vede
   * subtitle  come si legge il grafico e cosa si puo fare (hover, ecc.)
   * summary   riassunto testuale, obbligatorio: e cio che leggono i lettori
   *           di schermo al posto del disegno
   * source    riga della fonte dei dati
   * note      nota metodologica. Si mette SOLO se i dati sono stati
   *           elaborati; se sono usati come sono, si lascia vuota.
   *
   * Esempio d'uso:
   *   <ChartFrame title="..." subtitle="..." summary="..." source="...">
   *     <svg ...>...</svg>
   *   </ChartFrame>
   */
  let { title, subtitle, summary, source, note = null, children } = $props();
</script>

<figure class="frame">
  <h3 class="title">{title}</h3>
  <p class="subtitle">{subtitle}</p>

  <!-- Il disegno e nascosto ai lettori di schermo: al suo posto leggono
       il riassunto qui sotto, che dice la stessa cosa a parole. -->
  <div class="plot" aria-hidden="true">
    {@render children()}
  </div>
  <p class="sr-only">{summary}</p>

  <figcaption class="foot">
    <span class="source">{source}</span>
    {#if note}
      <span class="note">{note}</span>
    {/if}
  </figcaption>
</figure>

<style>
  .frame {
    margin: var(--space-6) 0;
    background: var(--color-white);
    border: var(--chart-border);
    padding: var(--space-4);
  }

  .title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    letter-spacing: var(--tracking-tight);
    font-size: var(--type-chart-title-m);
    line-height: var(--type-chart-title-line-m);
    color: var(--color-ink);
  }

  .subtitle {
    margin: var(--space-2) 0 0;
    font-family: var(--font-display);
    font-weight: var(--weight-regular);
    font-size: var(--type-chart-sub-size);
    line-height: var(--type-chart-sub-line);
    color: var(--color-muted);
  }

  .plot {
    margin-top: var(--space-3);
  }

  /* Il riassunto usa la classe .sr-only di base.css: sta nel flusso ma non
     a schermo, ed e cio che leggono i lettori di schermo al posto del grafico. */

  .foot {
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: var(--chart-hairline);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-family: var(--font-display);
    font-weight: var(--weight-regular);
    font-size: var(--type-source-size);
    line-height: var(--type-source-line);
    color: var(--color-faint);
  }

  @media (min-width: 700px) {
    .frame {
      padding: var(--space-5) var(--space-6);
    }

    .title {
      font-size: var(--type-chart-title);
      line-height: var(--type-chart-title-line);
    }
  }
</style>
