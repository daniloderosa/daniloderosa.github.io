<script>
  /**
   * PULSANTE CON UN'ICONA (senza testo). L'icona e un disegno SVG passato
   * dentro il componente; il nome per i lettori di schermo e per il
   * suggerimento al passaggio del mouse e `etichetta`.
   * L'area cliccabile e di 44x44px (minimo di accessibilita), anche se
   * l'icona e piu piccola.
   *
   * etichetta  cosa fa il pulsante, in parole ("Dati in tabella")
   * onclick    cosa succede al clic
   * occupato   true mentre l'azione e in corso (il pulsante si attenua)
   * ariaHaspopup  'dialog' se il pulsante apre una finestra
   *
   * @type {{ etichetta: string, onclick: () => void, occupato?: boolean, ariaHaspopup?: 'dialog', children: import('svelte').Snippet }}
   */
  let { etichetta, onclick, occupato = false, ariaHaspopup, children } = $props();
</script>

<button
  type="button"
  aria-label={etichetta}
  title={etichetta}
  aria-haspopup={ariaHaspopup}
  aria-busy={occupato}
  disabled={occupato}
  {onclick}
>
  {@render children()}
</button>

<style>
  button {
    appearance: none;
    display: grid;
    place-items: center;
    width: var(--tap-min);
    height: var(--tap-min);
    padding: 0;
    background: none;
    border: 0;
    color: var(--color-muted);
    cursor: pointer;
    transition: color var(--ease-fast);
  }

  button:hover {
    color: var(--color-ink);
  }

  button:disabled {
    opacity: 0.5;
    cursor: progress;
  }

  button :global(svg) {
    width: var(--space-5);
    height: var(--space-5);
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
