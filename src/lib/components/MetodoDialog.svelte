<script>
  import { site } from '$lib/data/site.js';

  /**
   * POP-UP: un pulsante che apre una finestra (note sui dati, tabelle). Usa l'elemento nativo <dialog>: Esc e clic sullo sfondo la chiudono
   * e il browser tiene il cursore dentro la finestra, senza codice nostro.
   *
   * etichetta  testo del pulsante
   * titolo     titolo della finestra
   * voci       i paragrafi della finestra (alternativa a `children`)
   * children   (facoltativo) snippet con un contenuto qualsiasi, per esempio una tabella
   * lang       'it' o 'en': lingua del pulsante "Chiudi"
   * piccolo    true = pulsante con il corpo dei testi di fonte dei grafici
   * pulsante   (facoltativo) snippet che disegna il pulsante al posto della
   *            scritta: riceve la funzione che apre la finestra
   *               {#snippet pulsante(apri)} <button onclick={apri}>...</button> {/snippet}
   *
   * @type {{ etichetta: string, titolo: string, voci?: string[], children?: import('svelte').Snippet, lang?: 'it' | 'en', piccolo?: boolean, pulsante?: import('svelte').Snippet<[() => void]> }}
   */
  let { etichetta, titolo, voci = [], children, lang = 'it', piccolo = false, pulsante } = $props();

  // Id unico del titolo (collega il titolo alla finestra per i lettori di schermo)
  const uid = $props.id();
  const idTitolo = `${uid}-titolo`;

  /** @type {HTMLDialogElement | undefined} */
  let finestra = $state();

  function apri() {
    finestra?.showModal();
  }

  /** @param {MouseEvent} e */
  function suSfondo(e) {
    // Il clic cade sul <dialog> stesso solo se e fuori dal riquadro interno.
    if (e.target === finestra) finestra?.close();
  }
</script>

{#if pulsante}
  {@render pulsante(apri)}
{:else}
  <button type="button" class="apri" class:piccolo aria-haspopup="dialog" onclick={apri}>{etichetta}</button>
{/if}

<!-- Il clic sullo sfondo e un extra per il mouse: da tastiera si chiude con Esc
     o col pulsante "Chiudi", quindi il controllo di accessibilita non serve. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={finestra} aria-labelledby={idTitolo} onclick={suSfondo}>
  <div class="interno">
    <div class="testa">
      <!-- tabindex=-1 + autofocus: all'apertura il cursore va sul titolo e non sul
           pulsante "Chiudi", che altrimenti comparirebbe con il contorno di focus.
           Con Tab si raggiunge comunque il pulsante. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_autofocus -->
      <h2 id={idTitolo} tabindex="-1" autofocus>{titolo}</h2>
      <button type="button" class="chiudi" aria-label={site[lang].chart.close} onclick={() => finestra?.close()}>×</button>
    </div>
    <!-- tabindex: il corpo puo scorrere, quindi deve essere raggiungibile da tastiera -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="corpo" tabindex="0">
      {#each voci as voce (voce)}
        <p>{voce}</p>
      {/each}
      {#if children}{@render children()}{/if}
    </div>
  </div>
</dialog>

<style>
  /* Il pulsante e solo una scritta, come "Methodology" nel sito di riferimento */
  .apri {
    appearance: none;
    min-height: var(--tap-min);
    padding: 0;
    background: none;
    border: 0;
    color: var(--acc);
    font-family: var(--font-display);
    font-size: var(--type-small);
    text-decoration: underline;
    text-underline-offset: var(--underline-offset);
    cursor: pointer;
  }

  .apri:hover {
    color: var(--fg);
  }

  .apri.piccolo {
    font-size: var(--type-source-size);
  }

  dialog {
    width: min(40rem, 92vw);
    max-height: 86vh;
    padding: 0;
    border: var(--line) solid var(--fg);
    background: var(--bg);
    color: var(--fg);
  }

  /* Con la finestra aperta la pagina dietro non scorre */
  :global(body:has(dialog[open])) {
    overflow: hidden;
  }

  h2:focus {
    outline: none;
  }

  dialog::backdrop {
    background: rgb(19 19 19 / 0.6);
  }

  .interno {
    display: flex;
    flex-direction: column;
    max-height: 86vh;
  }

  .testa {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-5);
    border-bottom: var(--border-rule);
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-box);
    line-height: var(--type-box-line);
    letter-spacing: var(--tracking-tight);
  }

  .chiudi {
    appearance: none;
    flex: none;
    width: var(--tap-min);
    height: var(--tap-min);
    background: none;
    border: var(--border-thin);
    color: var(--fg);
    font-size: var(--type-box);
    line-height: 1;
    cursor: pointer;
  }

  .chiudi:hover {
    border-color: var(--acc);
    color: var(--acc);
  }

  .corpo {
    overflow-y: auto;
    padding: var(--space-4) var(--space-5) var(--space-5);
  }

  .corpo p {
    margin: 0 0 var(--space-3);
    font-family: var(--font-text);
    font-size: var(--type-body-m);
    line-height: var(--type-body-line-m);
    color: var(--fg-2);
  }
</style>
