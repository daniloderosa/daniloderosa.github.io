<script>
  /**
   * Scheda di un progetto nella pagina Progetti.
   *
   * DUE soli punti cliccabili: l'anteprima e la riga d'azione in fondo.
   * Titolo e descrizione sono testo normale, si possono selezionare senza
   * far partire la navigazione. I due link hanno etichette accessibili
   * diverse, cosi chi naviga a voce non sente due voci identiche.
   *
   * item      testi del progetto gia nella lingua giusta
   * year      anno, mostrato accanto al tag
   * badge     etichetta sull'anteprima (TENNIS / ALTRO)
   * primary   true = etichetta in lime (tennis), false = etichetta scura
   * image     percorso dell'anteprima, oppure null
   * external  true = link a un'altra repository, si apre in una scheda nuova
   *
   * @type {{
   *   item: { tag: string, title: string, description: string, href: string, alt: string, cta: string },
   *   year: number,
   *   badge: string,
   *   primary?: boolean,
   *   image?: string | null,
   *   external?: boolean
   * }}
   */
  let { item, year, badge, primary = true, image = null, external = false } = $props();

  const target = $derived(external ? '_blank' : undefined);
  const rel = $derived(external ? 'noopener' : undefined);
</script>

<article class="card">
  <a class="thumb-link" href={item.href} {target} {rel} aria-label={item.title}>
    <div class="thumb hatch">
      {#if image}
        <img src={image} alt={item.alt} loading="lazy" width="640" height="400" />
      {:else}
        <!-- Anteprima non ancora disponibile: riquadro a righe con etichetta. -->
        <span class="placeholder" aria-hidden="true">[ {item.alt} ]</span>
      {/if}
      <span class="badge" class:primary aria-hidden="true">{badge}</span>
    </div>
  </a>

  <p class="meta">{item.tag} · {year}</p>
  <h2 class="title">{item.title}</h2>
  <p class="desc">{item.description}</p>

  <p class="cta-wrap">
    <a class="cta" href={item.href} {target} {rel} aria-label="{item.cta}: {item.title}">
      {item.cta}
      <span aria-hidden="true">{external ? '↗' : '→'}</span>
    </a>
  </p>
</article>

<style>
  .thumb-link {
    display: block;
    color: inherit;
    text-decoration: none;
    transition: transform var(--ease-fast) ease-out;
  }

  .thumb-link:hover,
  .thumb-link:focus-visible {
    transform: translate(calc(-1 * var(--nudge)), calc(-1 * var(--nudge)));
  }

  .thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    border: var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    padding: var(--space-5);
    text-align: center;
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-soft);
    color: var(--fg-3);
  }

  .badge {
    position: absolute;
    left: 0;
    top: 0;
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--type-label-xs);
    letter-spacing: var(--tracking-label);
    background: var(--badge-bg);
    color: var(--badge-fg);
  }

  .badge.primary {
    background: var(--acc);
    color: var(--on-acc);
  }

  .meta {
    margin: var(--space-3) 0 0;
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-label);
    color: var(--acc);
  }

  .title {
    margin: var(--space-1) 0 0;
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    font-size: var(--type-card-m);
    line-height: var(--type-card-line-m);
    letter-spacing: var(--tracking-tight);
    color: var(--fg);
  }

  .desc {
    margin: var(--space-2) 0 0;
    font-family: var(--font-text);
    font-size: var(--type-small);
    line-height: var(--type-small-line);
    color: var(--fg-2);
  }

  .cta-wrap {
    margin: var(--space-1) 0 0;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    min-height: var(--tap-min);
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    font-size: var(--type-cta);
    color: var(--acc);
    text-decoration: none;
  }

  .cta:hover,
  .cta:focus-visible {
    text-decoration: underline;
    text-underline-offset: var(--underline-offset);
  }

  @media (min-width: 700px) {
    .title {
      font-size: var(--type-card);
      line-height: var(--type-card-line);
    }
  }
</style>
