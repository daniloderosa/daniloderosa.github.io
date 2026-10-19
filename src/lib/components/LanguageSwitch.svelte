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
</script>

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

<nav class="switch" aria-label={t.langNav}>
  <!-- EN, sempre per prima -->
  {#if lang === 'en'}
    <span class="item current">{@render usFlag()}<span>EN</span><span class="sr-only">{t.currentLang}</span></span>
  {:else}
    <a class="item link" href={other} hreflang="en" aria-label={t.langLabel}>{@render usFlag()}<span>EN</span></a>
  {/if}

  <span class="sep" aria-hidden="true">·</span>

  <!-- IT, sempre per seconda -->
  {#if lang === 'it'}
    <span class="item current">{@render itFlag()}<span>IT</span><span class="sr-only">{t.currentLang}</span></span>
  {:else}
    <a class="item link" href={other} hreflang="it" aria-label={t.langLabel}>{@render itFlag()}<span>IT</span></a>
  {/if}
</nav>

<style>
  .switch {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--type-label);
    letter-spacing: var(--tracking-soft);
    white-space: nowrap;
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

  .flag {
    width: var(--flag-w);
    height: var(--flag-h);
    display: block;
  }

  .sep {
    color: var(--rule-2);
  }
</style>
