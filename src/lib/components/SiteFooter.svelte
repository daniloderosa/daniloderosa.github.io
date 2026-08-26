<script>
  /**
   * Chiusura del sito: link ai profili e indirizzo email.
   * I contenuti arrivano da src/lib/data/site.js, non si scrivono qui.
   *
   * social      array di { label, href }
   * email       indirizzo mostrato e reso cliccabile
   * socialLabel nome della lista profili per i lettori di schermo,
   *             nella lingua della pagina
   */
  let { social, email, socialLabel } = $props();
</script>

<footer class="footer">
  <nav class="links" aria-label={socialLabel}>
    {#each social as item (item.href)}
      <a href={item.href} rel="me noopener" target="_blank">{item.label}</a>
    {/each}
  </nav>
  <a class="email" href="mailto:{email}">{email}</a>
</footer>

<style>
  .footer {
    border-top: var(--border-strong);
    background: var(--color-cream);
    padding: var(--space-4) var(--page-pad);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .links a {
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    font-size: var(--type-small-size);
    color: var(--color-ink);
    text-decoration: none;
    /* Area tattile da 44x44 anche con etichette cortissime come "X":
       senza min-width il link sarebbe largo una decina di pixel. */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--tap-min);
    min-width: var(--tap-min);
  }

  .links a:hover,
  .links a:focus-visible {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .email {
    font-family: var(--font-mono);
    font-size: var(--type-mono-size);
    line-height: var(--type-mono-line);
    color: var(--color-muted);
    display: inline-flex;
    align-items: center;
    min-height: var(--tap-min);
  }

  .email:hover,
  .email:focus-visible {
    color: var(--color-ink);
  }

  @media (min-width: 700px) {
    .footer {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-5) var(--page-pad-wide);
      gap: var(--space-5);
    }
  }
</style>
