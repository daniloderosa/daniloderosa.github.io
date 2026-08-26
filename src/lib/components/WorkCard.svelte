<script>
  /**
   * Scheda di un lavoro nella griglia della home.
   *
   * Nella scheda ci sono DUE punti cliccabili e basta: l'immagine di
   * anteprima e la riga "Open the project". Titolo e descrizione sono testo
   * normale, non link: si possono selezionare e copiare senza far partire
   * la navigazione.
   *
   * I due link portano allo stesso posto, quindi hanno un'etichetta
   * accessibile diversa (immagine = titolo, riga finale = azione + titolo):
   * chi naviga a voce o da tastiera sente due voci distinte e sensate,
   * non due "Open the project" identici.
   *
   * item      l'oggetto della scheda gia scelto nella lingua giusta
   *           ({ tag, date, title, description, href, alt, cta })
   * image     percorso dell'anteprima, oppure null
   * external  true = link a un'altra repository, si apre in una scheda nuova
   */
  let { item, image = null, external = false } = $props();

  // Attributi comuni ai due link della scheda.
  const target = $derived(external ? '_blank' : null);
  const rel = $derived(external ? 'noopener' : null);
</script>

<article class="card">
  <a
    class="thumb-link"
    href={item.href}
    {target}
    {rel}
    aria-label={item.title}
  >
    {#if image}
      <img class="thumb" src={image} alt={item.alt} loading="lazy" width="640" height="400" />
    {:else}
      <!-- Anteprima non ancora disponibile: riquadro a righe con l'etichetta
           scritta, cosi il posto resta visibile e descritto. -->
      <div class="thumb placeholder">
        <span aria-hidden="true">{item.alt}</span>
      </div>
    {/if}
  </a>

  <p class="meta">{item.tag} · {item.date}</p>
  <h3 class="title">{item.title}</h3>
  <p class="desc">{item.description}</p>

  <p class="cta-wrap">
    <a
      class="cta"
      href={item.href}
      {target}
      {rel}
      aria-label="{item.cta}: {item.title}"
    >
      {item.cta}
      <span aria-hidden="true">{external ? '↗' : '→'}</span>
    </a>
  </p>
</article>

<style>
  .card {
    display: block;
  }

  .thumb-link {
    display: block;
    /* Il riquadro a righe contiene del testo: senza questo, il browser lo
       sottolinea come un link qualsiasi. */
    text-decoration: none;
    color: inherit;
    /* Micro-spostamento in hover, come nel design system. */
    transition: transform 0.12s ease-out;
  }

  .thumb-link:hover,
  .thumb-link:focus-visible {
    transform: translate(-2px, -2px);
  }

  .thumb {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    border: var(--border-strong);
    background: var(--color-cream);
  }

  .placeholder {
    background: var(--pattern-placeholder);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-4);
  }

  .placeholder span {
    font-family: var(--font-display);
    font-size: var(--type-source-size);
    line-height: var(--type-source-line);
    color: var(--color-faint);
  }

  .meta {
    margin: var(--space-3) 0 0;
    font-family: var(--font-mono);
    font-size: var(--type-tag-size);
    line-height: var(--type-tag-line);
    letter-spacing: var(--tracking-tag);
    color: var(--accent-dark);
  }

  .title {
    margin: var(--space-1) 0 0;
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    letter-spacing: var(--tracking-tight);
    font-size: var(--type-card-size-mobile);
    line-height: var(--type-card-line-mobile);
    color: var(--color-ink);
  }

  .desc {
    margin: var(--space-1) 0 0;
    font-family: var(--font-text);
    font-size: var(--type-small-size-mobile);
    line-height: var(--type-small-line-mobile);
    color: var(--color-muted);
  }

  .cta-wrap {
    margin: var(--space-2) 0 0;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    /* Area tattile da 44px: la riga e corta, quindi l'altezza la deve
       garantire il link stesso. */
    min-height: var(--tap-min);
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    font-size: var(--type-small-size);
    color: var(--accent-dark);
    text-decoration: none;
  }

  .cta:hover,
  .cta:focus-visible {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (min-width: 700px) {
    .title {
      font-size: var(--type-card-size);
      line-height: var(--type-card-line);
    }

    .desc {
      font-size: var(--type-small-size);
      line-height: var(--type-small-line);
    }
  }

  /* Chi ha chiesto meno animazioni non deve vedere lo spostamento. */
  @media (prefers-reduced-motion: reduce) {
    .thumb-link {
      transition: none;
    }

    .thumb-link:hover,
    .thumb-link:focus-visible {
      transform: none;
    }
  }
</style>
