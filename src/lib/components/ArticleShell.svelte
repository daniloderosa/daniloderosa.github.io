<script>
  import SiteFooter from './SiteFooter.svelte';
  import { site } from '$lib/data/site.js';
  import { path } from '$lib/data/routes.js';

  /**
   * Cornice comune degli ARTICOLI: intestazione con ritorno all'elenco dei
   * progetti, contenuto, footer. Come InnerPage, ma per pagine che non sono
   * fra le voci del menu e che hanno metadati propri (ogni articolo ha il suo
   * indirizzo, il suo titolo e la sua descrizione).
   *
   * lang         'en' o 'it'
   * title        titolo della scheda del browser e dell'anteprima social
   * description  descrizione per motori di ricerca e anteprima social
   * href         indirizzo della pagina, per esempio '/it/articoli/slug/'
   * noindex      true = chiede ai motori di ricerca di non indicizzare la
   *              pagina. Da usare finche l'articolo non e approvato e tradotto.
   * footer       (facoltativo) snippet col contenuto del piede, a sinistra. Se manca,
   *              compare il footer standard del sito (SiteFooter).
   * schermata    true = su desktop (>=900px di larghezza e >=700px di altezza)
   *              la cornice occupa esattamente una schermata e la pagina non
   *              scorre: il contenuto deve starci. Sotto quelle misure la
   *              pagina scorre normalmente.
   *
   * QUANDO ESISTE LA VERSIONE INGLESE: aggiungere in routes.js la riga
   * dell'articolo, usare <LanguageSwitch> nell'intestazione e i tag hreflang
   * qui sotto (come fa SeoHead per le altre pagine). Finche la gemella non
   * c'e, il selettore lingua non va mostrato: porterebbe a una pagina che non
   * esiste.
   *
   * @type {{
   *   lang: 'en' | 'it',
   *   title: string,
   *   description: string,
   *   href: string,
   *   noindex?: boolean,
   *   schermata?: boolean,
   *   footer?: import('svelte').Snippet,
   *   children: import('svelte').Snippet
   * }}
   */
  let { lang, title, description, href, noindex = false, schermata = false, footer, children } = $props();

  const t = $derived(site[lang]);
  const url = $derived(site.url + href);
  // Anteprima social: per ora quella generale del sito, una per lingua.
  const image = $derived(`${site.url}/og-${lang}.png`);
  const imageAlt = $derived(`${site.name} — ${t.home.motto}`);

  // Palette Panna anche sul fondo della pagina intera, come nelle altre pagine interne.
  $effect(() => {
    document.documentElement.dataset.theme = 'panna';
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  {#if noindex}
    <meta name="robots" content="noindex" />
  {/if}

  <meta property="og:type" content="article" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  <meta property="og:image:alt" content={imageAlt} />
  <meta property="og:locale" content={lang === 'it' ? 'it_IT' : 'en_US'} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
  <meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>

<div class="frame" class:schermata data-theme="panna">
  <header class="header">
    <a class="back" href={path('projects', lang)}>
      <span aria-hidden="true">←</span>
      <span>{t.nav.projects}</span>
    </a>
  </header>

  <main class="main">
    {@render children()}
  </main>

  {#if footer}
    <footer class="piede">{@render footer()}</footer>
  {:else}
    <SiteFooter {lang} />
  {/if}
</div>

<style>
  /* Margini laterali come nel sito di riferimento (Funafuti): da 20px a 56px
     secondo la larghezza, senza una colonna centrale stretta. */
  .frame {
    --margine: clamp(var(--page-pad), 4vw, calc(var(--space-7) + var(--space-2)));
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--fg);
  }

  .header {
    padding: var(--space-2) var(--margine);
    border-bottom: var(--border-rule);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--tap-min);
    text-decoration: none;
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: var(--type-label);
    letter-spacing: var(--tracking-label);
  }

  .back:hover,
  .back:focus-visible {
    color: var(--acc);
  }

  .main {
    flex: 1;
    width: 100%;
    padding: var(--space-5) var(--margine) var(--space-6);
  }

  /* Piede dell'articolo: solo il pulsante della metodologia, in basso a sinistra */
  .piede {
    padding: 0 var(--margine) var(--space-2);
  }

  /* Modalita "una schermata": altezza fissa, header e piede compatti, e
     lo spazio che resta va al contenuto (main), che non puo scorrere. */
  @media (min-width: 900px) and (min-height: 700px) {
    .frame.schermata {
      position: relative;
      height: 100dvh;
      min-height: 0;
      overflow: hidden;
    }

    /* Il link "← PROGETTI" non ha una riga sua: sta in alto a destra,
       accanto al titolo, e libera altezza per il contenuto. */
    .schermata .header {
      position: absolute;
      top: var(--space-2);
      right: var(--margine);
      padding: 0;
      border: 0;
    }

    .schermata .main {
      display: flex;
      flex-direction: column;
      min-height: 0;
      padding-block: var(--space-3) var(--space-2);
    }
  }
</style>
