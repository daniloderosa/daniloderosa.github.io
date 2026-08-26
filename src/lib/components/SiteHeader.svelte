<script>
  import LanguageSwitch from './LanguageSwitch.svelte';

  /**
   * Testata del sito: nome, selettore lingua, sommario con l'evidenziatore.
   *
   * lang    'en' o 'it'
   * name    nome mostrato in grande
   * tagline oggetto { before, mark, after }: `mark` e la parte evidenziata
   * twin    indirizzo della pagina gemella nell'altra lingua
   * label   etichetta accessibile del selettore lingua
   * home    true = il nome e un titolo <h1>; false = e un link alla home
   */
  let { lang, name, tagline, twin, label, home = true } = $props();
</script>

<header class="header">
  <div class="top">
    {#if home}
      <h1 class="name">{name}</h1>
    {:else}
      <a class="name name-link" href={lang === 'it' ? '/it/' : '/'}>{name}</a>
    {/if}
    <LanguageSwitch {lang} {twin} {label} />
  </div>

  <p class="tagline">
    {tagline.before}<mark>{tagline.mark}</mark>{tagline.after}
  </p>
</header>

<style>
  .header {
    padding: var(--space-5) var(--page-pad) var(--space-4);
    border-bottom: var(--border-strong);
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .name {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    letter-spacing: var(--tracking-tight);
    font-size: var(--type-page-size-mobile);
    line-height: var(--type-page-line-mobile);
    color: var(--color-ink);
    /* Il nome puo andare a capo su schermi stretti, ma senza spezzare
       le parole a meta. */
    overflow-wrap: break-word;
  }

  .name-link {
    text-decoration: none;
  }

  .name-link:hover,
  .name-link:focus-visible {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .tagline {
    margin: var(--space-2) 0 0;
    font-family: var(--font-display);
    font-weight: var(--weight-medium);
    font-size: var(--type-tagline-size-mobile);
    line-height: var(--type-tagline-line-mobile);
    color: var(--color-ink);
  }

  /* L'evidenziatore in accento dietro alla parte centrale del sommario.
     Il testo resta nero: il colore non porta informazione, e solo enfasi. */
  mark {
    background: var(--accent-mid);
    color: var(--color-ink);
    padding: 0 var(--space-1);
  }

  @media (min-width: 700px) {
    .header {
      padding: var(--space-7) var(--page-pad-wide) var(--space-6);
    }

    .top {
      gap: var(--space-5);
    }

    .name {
      font-size: var(--type-page-size);
      line-height: var(--type-page-line);
    }

    .tagline {
      margin-top: var(--space-3);
      font-size: var(--type-tagline-size);
      line-height: var(--type-tagline-line);
    }

    mark {
      padding: 0 var(--space-1);
    }
  }
</style>
