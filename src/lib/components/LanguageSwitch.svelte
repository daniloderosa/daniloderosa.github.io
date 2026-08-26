<script>
  /**
   * Selettore lingua, in alto a destra.
   *
   * L'ordine e SEMPRE lo stesso, in tutte e due le lingue: prima EN con la
   * bandiera americana, poi IT. Non si inverte a seconda della pagina, cosi
   * chi passa da una lingua all'altra ritrova la voce nello stesso punto.
   *
   * La lingua attiva e scritta in nero e in grassetto e non e cliccabile;
   * l'altra e un link alla pagina gemella. Chi non distingue i colori o non
   * vede le bandiere lo capisce dalla sigla e dalla nota per i lettori di
   * schermo: l'informazione non passa mai dal solo colore.
   *
   * lang  lingua della pagina corrente: 'en' o 'it'
   * twin  indirizzo della stessa pagina nell'altra lingua
   * label testo per il lettore di schermo ("Leggi in italiano")
   */
  let { lang, twin, label } = $props();
</script>

<nav class="switch" aria-label={lang === 'it' ? 'Lingua' : 'Language'}>
  <!-- EN, sempre per prima -->
  {#if lang === 'en'}
    <span class="item current">
      <svg class="flag" viewBox="0 0 60 30" aria-hidden="true">
        <rect width="60" height="30" fill="#B22234" />
        <g fill="#FFFFFF">
          <rect y="2.31" width="60" height="2.31" />
          <rect y="6.92" width="60" height="2.31" />
          <rect y="11.54" width="60" height="2.31" />
          <rect y="16.15" width="60" height="2.31" />
          <rect y="20.77" width="60" height="2.31" />
          <rect y="25.38" width="60" height="2.31" />
        </g>
        <rect width="24" height="16.15" fill="#3C3B6E" />
      </svg>
      <span>EN</span>
      <span class="sr-only">(current language)</span>
    </span>
  {:else}
    <a class="item link" href={twin} hreflang="en" aria-label={label}>
      <svg class="flag" viewBox="0 0 60 30" aria-hidden="true">
        <rect width="60" height="30" fill="#B22234" />
        <g fill="#FFFFFF">
          <rect y="2.31" width="60" height="2.31" />
          <rect y="6.92" width="60" height="2.31" />
          <rect y="11.54" width="60" height="2.31" />
          <rect y="16.15" width="60" height="2.31" />
          <rect y="20.77" width="60" height="2.31" />
          <rect y="25.38" width="60" height="2.31" />
        </g>
        <rect width="24" height="16.15" fill="#3C3B6E" />
      </svg>
      <span>EN</span>
    </a>
  {/if}

  <span class="sep" aria-hidden="true">·</span>

  <!-- IT, sempre per seconda -->
  {#if lang === 'it'}
    <span class="item current">
      <svg class="flag" viewBox="0 0 60 30" aria-hidden="true">
        <rect width="20" height="30" fill="#008C45" />
        <rect x="20" width="20" height="30" fill="#F4F5F0" />
        <rect x="40" width="20" height="30" fill="#CD212A" />
      </svg>
      <span>IT</span>
      <span class="sr-only">(lingua attuale)</span>
    </span>
  {:else}
    <a class="item link" href={twin} hreflang="it" aria-label={label}>
      <svg class="flag" viewBox="0 0 60 30" aria-hidden="true">
        <rect width="20" height="30" fill="#008C45" />
        <rect x="20" width="20" height="30" fill="#F4F5F0" />
        <rect x="40" width="20" height="30" fill="#CD212A" />
      </svg>
      <span>IT</span>
    </a>
  {/if}
</nav>

<style>
  .switch {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--type-mono-size);
    line-height: var(--type-mono-line);
    white-space: nowrap;
  }

  .item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    /* Area tattile da 44px: l'altezza la garantisce il padding verticale,
       la larghezza il contenuto (bandiera + sigla) piu quello orizzontale. */
    min-height: var(--tap-min);
    padding: 0 var(--space-2);
  }

  .current {
    color: var(--color-ink);
    font-weight: var(--weight-bold);
  }

  .link {
    color: var(--color-muted);
    text-decoration: none;
  }

  .link:hover,
  .link:focus-visible {
    color: var(--color-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .flag {
    /* Bordo sottile: sia la bandiera italiana sia quella americana hanno
       bande bianche che sparirebbero sul fondo chiaro della pagina. */
    width: 20px;
    height: 14px;
    display: block;
    outline: 1px solid var(--color-divider);
    outline-offset: -1px;
  }

  .sep {
    color: var(--color-divider);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
