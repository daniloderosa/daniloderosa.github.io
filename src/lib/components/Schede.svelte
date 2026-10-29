<script>
  /**
   * SCHEDE (tab): una fila di linguette e, sotto, il pannello della scheda
   * scelta. Ogni linguetta e raggiungibile con Tab, e quando prende il fuoco
   * la sua scheda si apre: Tab passa dunque da una scheda alla successiva
   * (Maiusc+Tab alla precedente). Valgono anche frecce sinistra/destra, Home e
   * Fine (pattern ARIA "tabs").
   *
   * etichette   nomi brevi sulle linguette, nell'ordine
   * nome        descrizione della fila di linguette per i lettori di schermo
   * pannello    snippet che disegna il contenuto di UNA scheda e riceve il suo
   *             indice:  {#snippet pannello(i)} ... {/snippet}
   *             Viene disegnato solo il pannello attivo.
   *
   * @type {{ etichette: string[], nome: string, pannello: import('svelte').Snippet<[number]> }}
   */
  let { etichette, nome, pannello } = $props();

  // Prefisso unico per gli id, cosi tab e pannelli si collegano fra loro.
  const uid = $props.id();

  let attiva = $state(0);
  /** @type {HTMLButtonElement[]} */
  let linguette = $state([]);

  /**
   * @param {number} i
   * @param {boolean} [focus]  true = porta anche il cursore sulla linguetta
   */
  function seleziona(i, focus = false) {
    attiva = i;
    if (focus) linguette[i]?.focus();
  }

  /** @param {KeyboardEvent} e */
  function tasti(e) {
    const n = etichette.length;
    /** @type {number | null} */
    let prossima = null;
    if (e.key === 'ArrowRight') prossima = (attiva + 1) % n;
    else if (e.key === 'ArrowLeft') prossima = (attiva - 1 + n) % n;
    else if (e.key === 'Home') prossima = 0;
    else if (e.key === 'End') prossima = n - 1;
    if (prossima === null) return;
    e.preventDefault();
    seleziona(prossima, true);
  }
</script>

<div class="schede">
<!-- I tasti freccia arrivano dai pulsanti (focalizzabili): il tablist stesso non lo e. -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="linguette" role="tablist" aria-label={nome} onkeydown={tasti}>
  {#each etichette as etichetta, i (etichetta)}
    <button
      type="button"
      role="tab"
      id="{uid}-tab-{i}"
      aria-controls="{uid}-pannello-{i}"
      aria-selected={i === attiva}
      bind:this={linguette[i]}
      onclick={() => seleziona(i)}
      onfocus={() => seleziona(i)}
    >
      <span class="numero">{i + 1}</span>
      {etichetta}
    </button>
  {/each}
</div>

{#each etichette as etichetta, i (etichetta)}
  <div
    class="pannello"
    role="tabpanel"
    id="{uid}-pannello-{i}"
    aria-labelledby="{uid}-tab-{i}"
    hidden={i !== attiva}
  >
    {#if i === attiva}
      {@render pannello(i)}
    {/if}
  </div>
{/each}

</div>

<style>
  /* Le linguette vanno a capo, non scorrono: nessuna scheda resta fuori
     schermo senza che si veda. */
  .linguette {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-3);
    border-bottom: var(--border-rule);
  }

  button {
    appearance: none;
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    min-height: var(--tap-min);
    padding: var(--space-3) var(--space-1);
    margin-bottom: calc(var(--line-thin) * -1);
    background: none;
    border: 0;
    border-bottom: var(--line) solid transparent;
    color: var(--fg-3);
    font-family: var(--font-display);
    font-size: var(--type-small);
    white-space: nowrap;
    cursor: pointer;
    transition: color var(--ease-fast), border-color var(--ease-fast);
  }

  button:hover {
    color: var(--fg);
  }

  button[aria-selected='true'] {
    color: var(--fg);
    font-weight: var(--weight-bold);
    border-bottom-color: var(--acc);
  }

  .numero {
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    color: var(--acc);
  }

  /* L'attributo hidden e una regola del browser: va ribadito, perche
     un display scritto qui lo batterebbe. */
  .pannello[hidden] {
    display: none;
  }

  /* Da desktop in modalita "una schermata": il pannello prende tutta
     l'altezza che resta sotto le linguette. */
  @media (min-width: 900px) and (min-height: 700px) {
    .schede {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .pannello {
      flex: 1;
      min-height: 0;
    }
  }
</style>
