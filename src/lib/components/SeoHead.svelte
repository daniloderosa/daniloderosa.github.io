<script>
  import { site } from '$lib/data/site.js';
  import { path, twin } from '$lib/data/routes.js';

  /**
   * Metadati della pagina: titolo, descrizione e anteprima social.
   * Va richiamato in ogni pagina, con i testi nella lingua della pagina
   * stessa. Senza questo, chi riceve il link vede valori generici.
   *
   * L'immagine di anteprima e una per lingua: static/og-en.png e
   * static/og-it.png.
   *
   * @type {{
   *   lang: 'en' | 'it',
   *   page: 'home' | 'projects' | 'about' | 'contact',
   *   title: string,
   *   description: string
   * }}
   */
  let { lang, page, title, description } = $props();

  const canonical = $derived(site.url + path(page, lang));
  const alternate = $derived(site.url + twin(page, lang));
  const image = $derived(`${site.url}/og-${lang}.png`);
  const imageAlt = $derived(`${site.name} — ${site[lang].home.motto}`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  <!-- Dice ai motori di ricerca che le due lingue sono la stessa pagina. -->
  <link rel="alternate" hreflang={lang} href={canonical} />
  <link rel="alternate" hreflang={lang === 'en' ? 'it' : 'en'} href={alternate} />
  <link rel="alternate" hreflang="x-default" href={site.url + path(page, 'en')} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={image} />
  <meta property="og:image:alt" content={imageAlt} />
  <meta property="og:locale" content={lang === 'it' ? 'it_IT' : 'en_US'} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
  <meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>
