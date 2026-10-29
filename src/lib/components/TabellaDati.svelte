<script>
  import MetodoDialog from './MetodoDialog.svelte';
  import PulsanteIcona from './PulsanteIcona.svelte';

  /**
   * TABELLA DEI DATI di un grafico, in una finestra che si apre da un pulsante
   * con l'icona di una tabella.
   * E la via d'accesso ai numeri per chi usa un lettore di schermo o la sola
   * tastiera (Tab raggiunge il pulsante, Invio o Spazio apre la finestra, le
   * frecce si muovono fra le celle, Esc chiude e il cursore torna al pulsante)
   * e per chi vuole i valori esatti.
   *
   * titolo         titolo della finestra (di solito il titolo del grafico)
   * intestazioni   nomi delle colonne
   * righe          righe di celle (testo); la prima cella e il nome della riga
   * nota           (facoltativo) frase sotto la tabella
   *
   * @type {{ titolo: string, intestazioni: string[], righe: string[][], nota?: string }}
   */
  let { titolo, intestazioni, righe, nota = '' } = $props();
</script>

<MetodoDialog etichetta="Dati in tabella" {titolo}>
  {#snippet pulsante(apri)}
    <PulsanteIcona etichetta="Dati in tabella" onclick={apri} ariaHaspopup="dialog">
      <!-- Icona di una tabella -->
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
        <path d="M3.5 10h17M3.5 14.5h17M9.5 5v14" />
      </svg>
    </PulsanteIcona>
  {/snippet}
  <div class="tabella">
    <table>
      <caption class="sr-only">{titolo}</caption>
      <thead>
        <tr>
          {#each intestazioni as nome, c (c)}
            <th scope="col">{nome}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each righe as riga, r (r)}
          <tr>
            {#each riga as cella, c (c)}
              {#if c === 0}
                <th scope="row">{cella}</th>
              {:else}
                <td>{cella}</td>
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if nota}<p class="nota">{nota}</p>{/if}
</MetodoDialog>

<style>
  /* La tabella scorre di lato da sola se non ci sta (telefono) */
  .tabella {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-text);
    font-size: var(--type-small);
    line-height: var(--type-small-line);
    color: var(--fg);
  }

  th,
  td {
    padding: var(--space-2) var(--space-3);
    border-bottom: var(--border-rule);
    text-align: left;
    vertical-align: top;
  }

  thead th {
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-label);
    color: var(--acc);
  }

  tbody th {
    font-weight: var(--weight-bold);
  }

  .nota {
    margin-top: var(--space-3);
    font-size: var(--type-small);
  }
</style>
