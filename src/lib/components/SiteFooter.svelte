<script>
  import { site } from '$lib/data/site.js';

  /**
   * Chiusura di tutte le pagine: firma e link ai profili.
   * I profili arrivano da src/lib/data/site.js, non si scrivono qui.
   *
   * @type {{ lang: 'en' | 'it' }}
   */
  let { lang } = $props();

  const t = $derived(site[lang]);
</script>

<footer class="footer">
  <span>{t.footer}</span>
  <nav aria-label={t.socialLabel}>
    <ul>
      {#each site.social as item (item.href)}
        <li><a href={item.href} rel="me noopener" target="_blank">{item.label}</a></li>
      {/each}
    </ul>
  </nav>
</footer>

<style>
  .footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3) var(--page-pad) var(--space-4);
    background: var(--foot-bg);
    border-top: var(--line) solid var(--foot-fg);
    color: var(--foot-fg);
    font-family: var(--font-mono);
    font-size: var(--type-label-xs);
    letter-spacing: var(--tracking-label);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  a {
    color: var(--foot-fg);
    text-decoration: none;
    text-transform: uppercase;
    /* Area tattile da 44x44 anche per etichette corte come "X". */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--tap-min);
    min-width: var(--tap-min);
  }

  a:hover,
  a:focus-visible {
    text-decoration: underline;
    text-underline-offset: var(--underline-offset);
  }

  @media (min-width: 700px) {
    .footer {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3) var(--space-5);
      padding: var(--space-2) var(--page-pad-wide);
    }
  }
</style>
