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
   * video     anteprima animata (MP4), oppure assente
   * poster    primo fotogramma del video: si vede finche il video non parte
   *           e per sempre se chi visita ha chiesto "riduci movimento"
   * image     anteprima statica, usata se non c'e il video
   * external  true = link a un'altra repository, si apre in una scheda nuova
   *
   * @type {{
   *   item: { tag: string, title: string, description: string, href: string, alt: string, cta: string },
   *   year: number,
   *   badge: string,
   *   primary?: boolean,
   *   image?: string | null,
   *   video?: string | null,
   *   poster?: string | null,
   *   external?: boolean
   * }}
   */
  let { item, year, badge, primary = true, image = null, video = null, poster = null, external = false } = $props();

  /** @type {HTMLVideoElement | undefined} */
  let player = $state();

  /* Il video parte solo quando la scheda e visibile e si ferma quando esce
     dallo schermo: cosi non scarica nulla finche non serve e non consuma
     batteria. Con "riduci movimento" non parte mai: resta il poster. */
  $effect(() => {
    if (!player || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = player;
    const watcher = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    watcher.observe(el);
    return () => watcher.disconnect();
  });

  const target = $derived(external ? '_blank' : undefined);
  const rel = $derived(external ? 'noopener' : undefined);
</script>

<article class="card">
  <a class="thumb-link" href={item.href} {target} {rel} aria-label={item.title}>
    <div class="thumb hatch">
      {#if video}
        <!-- Senza autoplay: lo avvia lo script qui sopra, solo se opportuno.
             Senza JavaScript si vede il poster. Per i lettori di schermo il
             contenitore e un'immagine con il suo testo alternativo, il video
             dentro e nascosto. -->
        <span class="media" role="img" aria-label={item.alt}>
          <video bind:this={player} {poster} muted loop playsinline preload="none" aria-hidden="true">
            <source src={video} type="video/mp4" />
          </video>
        </span>
      {:else if image}
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

  /* L'anteprima e un grafico: non va mai ritagliata, altrimenti si perdono
     assi ed etichette. "contain" la mostra intera, qualunque proporzione
     abbia (anche video quadrati o molto larghi); lo spazio che
     avanza e bianco, come lo sfondo dei grafici. */
  .media {
    display: block;
    width: 100%;
    height: 100%;
  }

  .thumb img,
  .thumb video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: var(--color-white);
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
