<script>
  import { site } from '$lib/data/site.js';
  import { twin } from '$lib/data/routes.js';

  /**
   * Selettore lingua, in alto a destra in ogni pagina.
   *
   * L'ordine e SEMPRE lo stesso: prima EN con la bandiera americana, poi IT.
   * Non si inverte a seconda della pagina. La lingua attiva e in grassetto
   * e non e cliccabile; l'altra porta alla pagina gemella (mai alla home),
   * che si ricava da src/lib/data/routes.js.
   *
   * Due versioni dello stesso selettore, scelte dal CSS:
   * - da 700px in su: le due lingue affiancate, sempre visibili;
   * - sotto i 700px (telefono): un menu a tendina, per risparmiare spazio.
   *   Il pulsante mostra la lingua attuale; toccandolo si apre l'elenco.
   *   Si chiude con un tocco fuori, con Esc o scegliendo una lingua.
   *
   * I colori delle bandiere sono quelli nazionali: sono un contenuto, non
   * stile del sito, per questo stanno qui e non in tokens.css.
   * Sono disegnate in SVG e non con le emoji perche su Windows le emoji
   * delle bandiere non esistono: al loro posto compaiono le lettere "US".
   *
   * @type {{ lang: 'en' | 'it', page: 'home' | 'projects' | 'about' | 'contact' }}
   */
  let { lang, page } = $props();

  const t = $derived(site[lang]);
  const other = $derived(twin(page, lang));

  /* Ricorda la lingua scelta a mano: lo script in app.html la rispetta e non
     riporta piu il visitatore nella lingua del suo browser. E una preferenza
     "funzionale", non un tracciamento: resta nel browser di chi visita e non
     richiede banner. */
  /** @param {'en' | 'it'} code */
  function remember(code) {
    try {
      localStorage.setItem('ddr-lang', code);
    } catch {
      // Memoria bloccata (navigazione privata): la scelta vale solo per ora.
    }
  }

  let open = $state(false);
  /** @type {HTMLElement | undefined} */
  let root = $state();
  /** @type {HTMLButtonElement | undefined} */
  let trigger = $state();

  /** @param {KeyboardEvent} e */
  function onKey(e) {
    if (e.key === 'Escape' && open) {
      open = false;
      trigger?.focus();
    }
  }

  /** @param {MouseEvent} e */
  function onOutside(e) {
    if (open && root && !root.contains(/** @type {Node} */ (e.target))) open = false;
  }
</script>

<svelte:window onkeydown={onKey} onclick={onOutside} />

{#snippet usFlag()}
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
{/snippet}

{#snippet itFlag()}
  <svg class="flag" viewBox="0 0 60 30" aria-hidden="true">
    <rect width="20" height="30" fill="#008C45" />
    <rect x="20" width="20" height="30" fill="#F4F5F0" />
    <rect x="40" width="20" height="30" fill="#CD212A" />
  </svg>
{/snippet}

<nav class="switch" aria-label={t.langNav} bind:this={root}>
  <!-- VERSIONE LARGA (da 700px): EN sempre per prima, IT sempre per seconda -->
  <div class="inline">
    {#if lang === 'en'}
      <span class="item current">{@render usFlag()}<span>EN</span><span class="sr-only">{t.currentLang}</span></span>
    {:else}
      <a class="item link" href={other} hreflang="en" aria-label={t.langLabel} onclick={() => remember('en')}>{@render usFlag()}<span>EN</span></a>
    {/if}

    <span class="sep" aria-hidden="true">·</span>

    {#if lang === 'it'}
      <span class="item current">{@render itFlag()}<span>IT</span><span class="sr-only">{t.currentLang}</span></span>
    {:else}
      <a class="item link" href={other} hreflang="it" aria-label={t.langLabel} onclick={() => remember('it')}>{@render itFlag()}<span>IT</span></a>
    {/if}
  </div>

  <!-- VERSIONE A TENDINA (telefono) -->
  <div class="dropdown">
    <button
      type="button"
      class="trigger"
      bind:this={trigger}
      aria-expanded={open}
      aria-controls="lang-menu"
      aria-label="{t.langNav}: {lang.toUpperCase()}"
      onclick={() => (open = !open)}
    >
      {#if lang === 'en'}{@render usFlag()}{:else}{@render itFlag()}{/if}
      <span>{lang.toUpperCase()}</span>
      <svg class="chevron" class:flipped={open} viewBox="0 0 10 6" aria-hidden="true">
        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" />
      </svg>
    </button>

    {#if open}
      <ul class="menu" id="lang-menu">
        <li>
          {#if lang === 'en'}
            <span class="option current">{@render usFlag()}<span>EN</span><span class="sr-only">{t.currentLang}</span></span>
          {:else}
            <a class="option" href={other} hreflang="en" aria-label={t.langLabel} onclick={() => { open = false; remember('en'); }}>{@render usFlag()}<span>EN</span></a>
          {/if}
        </li>
        <li>
          {#if lang === 'it'}
            <span class="option current">{@render itFlag()}<span>IT</span><span class="sr-only">{t.currentLang}</span></span>
          {:else}
            <a class="option" href={other} hreflang="it" aria-label={t.langLabel} onclick={() => { open = false; remember('it'); }}>{@render itFlag()}<span>IT</span></a>
          {/if}
        </li>
      </ul>
    {/if}
  </div>
</nav>

<style>
  .switch {
    position: relative;
    font-family: var(--font-mono);
    font-size: var(--type-label);
    letter-spacing: var(--tracking-soft);
    white-space: nowrap;
  }

  .flag {
    width: var(--flag-w);
    height: var(--flag-h);
    display: block;
    flex: none;
  }

  /* ---------- Telefono: tendina ---------- */
  .inline {
    display: none;
  }

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--tap-min);
    padding: 0 var(--space-3);
    font: inherit;
    letter-spacing: inherit;
    color: var(--fg);
    background: transparent;
    border: var(--border-thin);
    cursor: pointer;
  }

  .chevron {
    width: var(--chevron-w);
    height: var(--chevron-h);
    transition: transform var(--ease-fast);
  }

  .chevron.flipped {
    transform: rotate(180deg);
  }

  /* Il pannello usa i colori chiari del footer: si legge sopra qualunque
     cosa ci sia sotto, in tutte e due le palette. */
  .menu {
    position: absolute;
    right: 0;
    top: calc(100% + var(--space-1));
    z-index: 20;
    min-width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--foot-bg);
    color: var(--foot-fg);
    border: var(--line) solid var(--foot-fg);
  }

  .option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--tap-min);
    padding: 0 var(--space-3);
    color: inherit;
    text-decoration: none;
  }

  .option.current {
    font-weight: var(--weight-bold);
  }

  .menu li + li .option {
    border-top: var(--line-thin) solid var(--foot-fg);
  }

  a.option:hover,
  a.option:focus-visible {
    background: var(--foot-fg);
    color: var(--foot-bg);
  }

  /* ---------- Da 700px: le due lingue affiancate ---------- */
  @media (min-width: 700px) {
    .dropdown {
      display: none;
    }

    .inline {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      /* Area tattile da 44px */
      min-height: var(--tap-min);
      padding: 0 var(--space-2);
    }

    .current {
      color: var(--fg);
      font-weight: var(--weight-bold);
    }

    .link {
      color: var(--fg-2);
      text-decoration: none;
    }

    .link:hover,
    .link:focus-visible {
      color: var(--acc);
      text-decoration: underline;
      text-underline-offset: var(--underline-offset);
    }

    .sep {
      color: var(--rule-2);
    }
  }
</style>
