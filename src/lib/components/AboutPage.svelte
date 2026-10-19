<script>
  import InnerPage from './InnerPage.svelte';
  import { aboutPage } from '$lib/data/about.js';
  import { path } from '$lib/data/routes.js';

  /**
   * Pagina "Chi sono". Testi e foto si cambiano in src/lib/data/about.js.
   *
   * @type {{ lang: 'en' | 'it' }}
   */
  let { lang } = $props();

  const t = $derived(aboutPage[lang]);
</script>

<InnerPage {lang} page="about" title={t.title} description={t.description}>
  <div class="top">
    <div>
      <h1 class="display">{t.heading}</h1>
      <p class="quote">{t.quote}</p>
      {#each t.paragraphs as text, i (i)}
        <p class="body">{text}</p>
      {/each}
    </div>

    <figure class="portrait">
      {#if aboutPage.photo}
        <img src={aboutPage.photo} alt={t.photoAlt} width="840" height="1050" />
      {:else}
        <div class="photo hatch" role="img" aria-label={t.photoAlt}>
          <span aria-hidden="true">{t.photoPlaceholder}</span>
        </div>
      {/if}
    </figure>
  </div>

  <!-- Separatore: una riga con la pallina al centro. Decorativo. -->
  <div class="divider" aria-hidden="true">
    <span class="rule"></span>
    <span class="dot"></span>
    <span class="rule"></span>
  </div>

  <div class="blocks">
    {#each t.blocks as block (block.label)}
      <section>
        <h2 class="label">{block.label}</h2>
        <ul class="dash-list">
          {#each block.items as item, i (i)}
            <li>{item}</li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>

  <div class="actions">
    <a class="button" href={path('projects', lang)}>{t.toWork} <span aria-hidden="true">→</span></a>
    <a class="button-ghost" href={path('contact', lang)}>{t.toContact} <span aria-hidden="true">→</span></a>
  </div>
</InnerPage>

<style>
  .top {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
    align-items: start;
  }

  .quote {
    margin: var(--space-5) 0 0;
    font-family: var(--font-text);
    font-style: italic;
    font-size: var(--type-quote-m);
    line-height: var(--type-quote-line-m);
    color: var(--fg);
    text-wrap: pretty;
  }

  .body {
    margin: var(--space-5) 0 0;
    font-family: var(--font-text);
    font-size: var(--type-body-m);
    line-height: var(--type-body-line-m);
    color: var(--fg-2);
    text-wrap: pretty;
  }

  .portrait {
    margin: 0;
  }

  .portrait img,
  .photo {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border: var(--border);
  }

  .photo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-5);
    text-align: center;
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-soft);
    color: var(--fg-3);
  }

  .divider {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-top: var(--space-7);
  }

  .rule {
    flex: 1;
    height: var(--line);
    background: var(--rule-2);
  }

  .dot {
    width: var(--dot-size);
    height: var(--dot-size);
    border: var(--line) solid var(--acc);
    border-radius: 50%;
  }

  .blocks {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--col-min), 1fr));
    gap: var(--space-6);
    margin-top: var(--space-7);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-7);
  }

  @media (min-width: 700px) {
    .top {
      grid-template-columns: minmax(var(--col-min-l), 1fr) minmax(var(--col-min-l), var(--portrait-max));
      gap: var(--space-7);
    }

    .quote {
      font-size: var(--type-quote);
      line-height: var(--type-quote-line);
    }

    .body {
      font-size: var(--type-body);
      line-height: var(--type-body-line);
    }
  }
</style>
