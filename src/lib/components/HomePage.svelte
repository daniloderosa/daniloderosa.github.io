<script>
  import SeoHead from './SeoHead.svelte';
  import HawkEye from './HawkEye.svelte';
  import Ticker from './Ticker.svelte';
  import SiteFooter from './SiteFooter.svelte';
  import { site } from '$lib/data/site.js';
  import { path } from '$lib/data/routes.js';

  /**
   * La home, una sola volta per tutte e due le lingue.
   * Le pagine /  e  /it/  richiamano questo componente passando solo `lang`.
   *
   * La home e in palette Terra (data-theme="terra"); le pagine interne in
   * palette Panna. I colori delle due palette sono in tokens.css.
   *
   * @type {{ lang: 'en' | 'it' }}
   */
  let { lang } = $props();

  const t = $derived(site[lang]);

  // Palette Terra anche sul fondo della pagina intera, quando si torna alla
  // home da una pagina interna senza ricaricare.
  $effect(() => {
    document.documentElement.dataset.theme = 'terra';
  });
</script>

<SeoHead {lang} page="home" title={t.home.title} description={t.home.description} />

<div class="home" data-theme="terra">
  <main>
    <HawkEye {lang} />
    <Ticker words={t.ticker} />

    <!-- Indice delle pagine: 01 Progetti, 02 Chi sono, 03 Contatti -->
    <nav class="index" aria-labelledby="index-label">
      <h2 class="sr-only" id="index-label">{t.home.indexLabel}</h2>
      <ol>
        {#each t.home.index as item, i (item.page)}
          <li>
            <a href={path(item.page, lang)}>
              <span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span class="title">{item.title}</span>
              <span class="chip">{item.chip}</span>
              <span class="arrow" aria-hidden="true">→</span>
            </a>
          </li>
        {/each}
      </ol>
    </nav>
  </main>

  <SiteFooter {lang} />
</div>

<style>
  .home {
    background: var(--bg);
    color: var(--fg);
  }

  .index ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Fondo panna e testo terra; al passaggio del mouse si invertono. */
  .index a {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    padding: var(--space-5) var(--page-pad);
    border-bottom: var(--line) solid var(--bg);
    background: var(--foot-bg);
    color: var(--foot-fg);
    text-decoration: none;
    transition: background var(--ease-fast), color var(--ease-fast);
  }

  .index a:hover,
  .index a:focus-visible {
    background: var(--foot-fg);
    color: var(--foot-bg);
  }

  .index a:focus-visible {
    outline-offset: calc(-2 * var(--nudge));
  }

  .num {
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
  }

  .title {
    flex: 1;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-index-m);
    line-height: var(--type-index-line-m);
    letter-spacing: var(--tracking-tight);
  }

  /* L'etichetta in lime si vede solo da tablet in su: su mobile la riga
     sarebbe troppo affollata. */
  .chip {
    display: none;
    background: var(--ball);
    color: var(--on-acc);
    font-family: var(--font-mono);
    font-size: var(--type-label-xs);
    letter-spacing: var(--tracking-label);
    padding: var(--space-1) var(--space-2);
  }

  .arrow {
    font-size: var(--type-arrow-m);
  }

  @media (min-width: 700px) {
    .index a {
      gap: var(--space-5);
      padding: var(--space-6) var(--page-pad-wide);
    }

    .num {
      font-size: var(--type-label);
    }

    .title {
      font-size: var(--type-index);
      line-height: var(--type-index-line);
    }

    .chip {
      display: inline-block;
    }

    .arrow {
      font-size: var(--type-arrow);
    }
  }
</style>
