<script>
  import SeoHead from './SeoHead.svelte';
  import SiteHeader from './SiteHeader.svelte';
  import SiteFooter from './SiteFooter.svelte';
  import WorkCard from './WorkCard.svelte';
  import { site } from '$lib/data/site.js';
  import { work } from '$lib/data/work.js';

  /**
   * La home, una sola volta per tutte e due le lingue.
   * Le pagine /  e  /it  richiamano questo componente passando solo `lang`:
   * cosi le due versioni non possono divergere per sbaglio, e i testi
   * restano tutti in src/lib/data/.
   *
   * lang  'en' oppure 'it'
   *
   * @type {{ lang: 'en' | 'it' }}
   */
  let { lang } = $props();

  // Testi fissi della pagina nella lingua richiesta.
  const t = $derived(site[lang]);

  // Percorso di questa pagina, per l'indirizzo canonico.
  const path = $derived(lang === 'it' ? '/it/' : '/');
</script>

<SeoHead
  {lang}
  {path}
  title={t.title}
  description={t.description}
  image={t.ogImage}
  imageAlt={t.ogAlt}
  twin={t.twin}
/>

<div class="page">
  <div class="sheet">
    <SiteHeader
      {lang}
      name={t.name}
      tagline={t.tagline}
      twin={t.twin}
      label={t.langLabel}
    />

    <main>
      <div class="intro-wrap">
        <p class="intro">{t.intro}</p>
      </div>

      <section class="work" aria-labelledby="work-label">
        <h2 class="work-label" id="work-label">
          {t.workLabel} <span class="count">· {work.length}</span>
        </h2>

        {#if work.length > 0}
          <div class="grid">
            {#each work as entry (entry.id)}
              <WorkCard
                item={entry[lang]}
                image={entry.image}
                external={entry.external}
              />
            {/each}
          </div>
        {:else}
          <p class="empty">{t.empty}</p>
        {/if}
      </section>
    </main>

    <SiteFooter social={site.social} email={site.email} socialLabel={t.socialLabel} />
  </div>
</div>

<style>
  /* Il foglio bianco bordato al centro del fondo panna. */
  .page {
    display: flex;
    justify-content: center;
    padding: 0;
  }

  .sheet {
    width: 100%;
    max-width: var(--page-max);
    background: var(--color-white);
    border: var(--border-strong);
    /* Il foglio occupa almeno tutto lo schermo: il footer non resta
       a mezz'aria sulle pagine corte. */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1;
  }

  .intro-wrap {
    padding: var(--space-5) var(--page-pad) 0;
  }

  .intro {
    margin: 0;
    /* Riga corta: il testo lungo si legge meglio sotto i 70 caratteri. */
    max-width: 40em;
    font-size: var(--type-lead-size-mobile);
    line-height: var(--type-lead-line-mobile);
  }

  .work {
    padding: var(--space-5) var(--page-pad) var(--space-6);
  }

  .work-label {
    margin: 0;
    font-family: var(--font-mono);
    font-weight: var(--weight-regular);
    font-size: var(--type-eyebrow-size);
    line-height: var(--type-eyebrow-line);
    letter-spacing: var(--tracking-eyebrow);
    color: var(--color-muted);
  }

  .count {
    font-variant-numeric: tabular-nums;
  }

  /* Una colonna su mobile. Da 700px in su le colonne si aggiungono da sole
     quando c'e spazio per almeno 320px l'una: non serve toccare nulla
     quando le schede aumentano.
     auto-fit (non auto-fill): con poche schede occupano tutta la riga
     invece di lasciare colonne vuote a destra. */
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--card-gap-row) var(--card-gap-col);
    margin-top: var(--space-3);
  }

  .empty {
    margin: var(--space-4) 0 0;
    color: var(--color-muted);
  }

  @media (min-width: 700px) {
    .page {
      padding: var(--space-7) var(--space-5);
    }

    .sheet {
      min-height: 0;
    }

    .intro-wrap {
      padding: var(--space-6) var(--page-pad-wide) 0;
    }

    .intro {
      font-size: var(--type-lead-size);
      line-height: var(--type-lead-line);
    }

    .work {
      padding: var(--space-6) var(--page-pad-wide) var(--space-7);
    }

    .grid {
      grid-template-columns: repeat(auto-fit, minmax(var(--card-min), 1fr));
      margin-top: var(--space-4);
    }
  }
</style>
