<script>
  import InnerPage from './InnerPage.svelte';
  import { site } from '$lib/data/site.js';
  import { contactPage } from '$lib/data/contact.js';

  /**
   * Pagina "Contatti". L'email e i profili arrivano da src/lib/data/site.js,
   * i testi da src/lib/data/contact.js.
   *
   * @type {{ lang: 'en' | 'it' }}
   */
  let { lang } = $props();

  const t = $derived(contactPage[lang]);
</script>

<InnerPage {lang} page="contact" title={t.title} description={t.description}>
  <h1 class="display">{t.heading}</h1>
  <p class="lead">{t.lead}</p>

  <a class="email" href="mailto:{site.email}" aria-label="{t.emailLabel} {site.email}">
    <span class="email-text">{site.email}</span>
    <span class="email-arrow" aria-hidden="true">↗</span>
  </a>

  <ul class="channels">
    {#each site.social as c (c.href)}
      <li>
        <a href={c.href} target="_blank" rel="me noopener">
          <span class="kind">{t.kinds[/** @type {'social' | 'work' | 'code'} */ (c.kind)]}</span>
          <span class="channel">{c.label}</span>
          <span class="handle">{c.handle} <span aria-hidden="true">↗</span></span>
        </a>
      </li>
    {/each}
  </ul>

  <div class="more">
    <section>
      <h2 class="label">{t.topicsLabel}</h2>
      <ul class="dash-list">
        {#each t.topics as item, i (i)}
          <li>{item}</li>
        {/each}
      </ul>
    </section>
    <section>
      <h2 class="label">{t.projectLabel}</h2>
      {#each t.project as text, i (i)}
        <p class="note">{text}</p>
      {/each}
    </section>
  </div>
</InnerPage>

<style>
  .email {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-3);
    max-width: 100%;
    min-height: var(--tap-min);
    margin-top: var(--space-6);
    color: var(--acc);
    text-decoration: none;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-email-m);
    line-height: var(--type-email-line-m);
    letter-spacing: var(--tracking-display);
    transition: color 0.2s, transform 0.2s;
  }

  /* Un indirizzo lungo va a capo invece di uscire dallo schermo. */
  .email-text {
    overflow-wrap: anywhere;
  }

  .email:hover,
  .email:focus-visible {
    color: var(--fg);
    transform: translateX(var(--nudge));
  }

  /* Freccia piu piccola dell'indirizzo, in proporzione al suo corpo. */
  .email-arrow {
    font-size: 0.65em;
  }

  .channels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--col-min-s), 1fr));
    margin: var(--space-7) 0 0;
    padding: 0;
    list-style: none;
    border-top: var(--border-rule);
    border-left: var(--border-rule);
  }

  .channels a {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    height: 100%;
    padding: var(--space-5);
    border-bottom: var(--border-rule);
    border-right: var(--border-rule);
    color: var(--fg);
    text-decoration: none;
    transition: background var(--ease-fast), color var(--ease-fast);
  }

  .channels a:hover,
  .channels a:focus-visible {
    background: var(--fg);
    color: var(--bg);
  }

  .kind {
    font-family: var(--font-mono);
    font-size: var(--type-label-xs);
    letter-spacing: var(--tracking-label-wide);
  }

  .channel {
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    font-size: var(--type-panel);
    line-height: var(--type-panel-line);
  }

  .handle {
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-soft);
  }

  .more {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--col-min-l), 1fr));
    gap: var(--space-6);
    margin-top: var(--space-7);
  }

  .note {
    margin: var(--space-3) 0 0;
    font-family: var(--font-text);
    font-size: var(--type-small);
    line-height: var(--type-small-line);
    color: var(--fg-2);
    text-wrap: pretty;
  }

  @media (min-width: 700px) {
    .email {
      font-size: var(--type-email);
      line-height: var(--type-email-line);
    }
  }
</style>
