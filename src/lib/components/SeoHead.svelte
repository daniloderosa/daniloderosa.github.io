<script>
  import { site } from '$lib/data/site.js';

  /**
   * Metadati della pagina: titolo, descrizione e anteprima social.
   * Va richiamato in cima a ogni pagina, con i testi nella lingua della
   * pagina stessa. Senza questo, chi riceve il link vede valori generici.
   *
   * lang     'en' o 'it'
   * title    titolo della pagina
   * description  una frase che descrive la pagina
   * image    percorso dell'immagine di anteprima (dentro static/)
   * imageAlt descrizione dell'immagine di anteprima
   * path     percorso della pagina, per l'indirizzo canonico ('/', '/it')
   * twin     percorso della pagina gemella nell'altra lingua
   */
  let { lang, title, description, image, imageAlt, path, twin } = $props();

  const canonical = $derived(site.url + path);
  const absoluteImage = $derived(site.url + image);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  <!-- Dice ai motori di ricerca che le due lingue sono la stessa pagina. -->
  <link rel="alternate" hreflang={lang === 'en' ? 'it' : 'en'} href={site.url + twin} />
  <link rel="alternate" hreflang="x-default" href={site.url + '/'} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={absoluteImage} />
  <meta property="og:image:alt" content={imageAlt} />
  <meta property="og:locale" content={lang === 'it' ? 'it_IT' : 'en_US'} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={absoluteImage} />
  <meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>
