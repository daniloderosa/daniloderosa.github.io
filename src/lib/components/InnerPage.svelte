<script>
  import SeoHead from './SeoHead.svelte';
  import LanguageSwitch from './LanguageSwitch.svelte';
  import Ticker from './Ticker.svelte';
  import SiteFooter from './SiteFooter.svelte';
  import { site } from '$lib/data/site.js';
  import { path } from '$lib/data/routes.js';

  /**
   * Cornice comune delle pagine interne (Progetti, Chi sono, Contatti):
   * intestazione con ritorno alla home, menu e lingua; poi il
   * contenuto della pagina; poi nastro scorrevole e footer.
   *
   * lang        'en' o 'it'
   * page        chiave della pagina corrente (vedi routes.js)
   * title       titolo della scheda del browser e dell'anteprima social
   * description descrizione per motori di ricerca e anteprima social
   * children    il contenuto della pagina
   *
   * @type {{
   *   lang: 'en' | 'it',
   *   page: 'projects' | 'about' | 'contact',
   *   title: string,
   *   description: string,
   *   children: import('svelte').Snippet
   * }}
   */
  let { lang, page, title, description, children } = $props();

  const t = $derived(site[lang]);

  /** @type {('projects' | 'about' | 'contact')[]} */
  const menu = ['projects', 'about', 'contact'];

  // Palette Panna anche sul fondo della pagina intera, quando ci si arriva
  // dalla home senza ricaricare (la prima visita la imposta gia il server).
  $effect(() => {
    document.documentElement.dataset.theme = 'panna';
  });
</script>

<SeoHead {lang} {page} {title} {description} />

<div class="frame" data-theme="panna">
  <header class="header">
    <a class="brand" href={path('home', lang)}>
      <span class="arrow" aria-hidden="true">←</span>
      <span>{t.homeLink}</span>
    </a>

    <div class="lang"><LanguageSwitch {lang} {page} /></div>

    <nav class="nav" aria-label={t.navLabel}>
      <ul class="menu">
        {#each menu as key (key)}
          <li>
            <!-- aria-current segnala la pagina in cui ti trovi anche a chi
                 non vede l'evidenziazione in lime. -->
            <a href={path(key, lang)} aria-current={key === page ? 'page' : undefined}>{t.nav[key]}</a>
          </li>
        {/each}
      </ul>
    </nav>

  </header>

  <main class="main">
    {@render children()}
  </main>

  <Ticker words={t.ticker} />
  <SiteFooter {lang} />
</div>

<style>
  .frame {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--fg);
  }

  /* Su mobile: "← Homepage" e lingua in prima riga, poi il menu.
     Da 1024px in su tutto su una riga, con la lingua sempre in fondo a destra. */
  .header {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'brand lang'
      'nav nav';
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-3) var(--page-pad);
    border-bottom: var(--border-rule);
  }

  .brand { grid-area: brand; }
  .lang { grid-area: lang; }
  .nav { grid-area: nav; }

  .brand {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    min-height: var(--tap-min);
    text-decoration: none;
    color: var(--fg);
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-brand);
    letter-spacing: var(--tracking-tight);
  }

  .brand:hover,
  .brand:focus-visible {
    color: var(--acc);
  }

  .arrow {
    font-family: var(--font-mono);
    font-size: var(--type-label);
  }

  .menu {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .menu a {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap-min);
    padding: 0 var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-label);
    color: var(--fg);
    text-decoration: none;
    border: var(--border-thin);
    transition: border-color var(--ease-fast), color var(--ease-fast);
  }

  .menu a:hover,
  .menu a:focus-visible {
    border-color: var(--acc);
    color: var(--acc);
  }

  .menu a[aria-current='page'] {
    background: var(--acc);
    border-color: var(--acc);
    color: var(--on-acc);
    font-weight: var(--weight-bold);
  }

  .main {
    flex: 1;
    width: 100%;
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-6) var(--page-pad) var(--space-7);
  }


  @media (min-width: 700px) {
    .header {
      padding: var(--space-4) var(--page-pad-wide);
    }
  }

  @media (min-width: 1024px) {
    .header {
      grid-template-columns: 1fr auto auto;
      grid-template-areas: 'brand nav lang';
    }
  }

  @media (min-width: 700px) {

    .main {
      padding: var(--space-7) var(--page-pad-wide) var(--space-8);
    }
  }
</style>
