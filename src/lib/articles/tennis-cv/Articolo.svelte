<script>
  // PAGINA "Computer vision sul tennis" / "Computer vision on tennis": un solo
  // componente per le due lingue. Le due rotte
  //   /articles/tennis-computer-vision/      (inglese)
  //   /it/articoli/tennis-computer-vision/   (italiano)
  // sono due file sottili che lo chiamano con lang="en" o lang="it".
  //
  // DOVE METTERE LE MANI
  //   testi.js                    tutto il testo, nelle due lingue
  //   static/articles/tennis-cv/  video, minimappa e grafici (PNG)
  // I file statici vengono dal progetto tennis_computervision (cartella outputs/).
  import ArticleShell from '$lib/components/ArticleShell.svelte';
  import { testi } from './testi.js';

  /** @type {{ lang: 'it' | 'en' }} */
  let { lang } = $props();

  const t = $derived(testi[lang]);
  const base = '/articles/tennis-cv';

  /** @type {HTMLVideoElement | undefined} */
  let clip = $state();
  /** @type {HTMLVideoElement | undefined} */
  let mappa = $state();

  /* Clip e minimappa durano uguale: partono insieme quando entrano nello
     schermo e si fermano quando escono. Con "riduci movimento" restano ferme
     sul poster; la clip ha comunque i comandi per farla partire a mano. */
  $effect(() => {
    if (!clip || !mappa || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = clip, b = mappa;
    const watcher = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        b.currentTime = a.currentTime;
        a.play().catch(() => {});
        b.play().catch(() => {});
      } else {
        a.pause();
        b.pause();
      }
    }, { threshold: 0.4 });
    watcher.observe(a);
    // La minimappa segue la clip anche quando la si comanda a mano
    const sync = () => { if (Math.abs(b.currentTime - a.currentTime) > 0.15) b.currentTime = a.currentTime; };
    const play = () => b.play().catch(() => {});
    const pause = () => b.pause();
    a.addEventListener('timeupdate', sync);
    a.addEventListener('play', play);
    a.addEventListener('pause', pause);
    return () => {
      watcher.disconnect();
      a.removeEventListener('timeupdate', sync);
      a.removeEventListener('play', play);
      a.removeEventListener('pause', pause);
    };
  });
</script>

<ArticleShell {lang} title={t.meta.titoloPagina} description={t.meta.descrizione} page="tennisCv">
  <header class="testata">
    <p class="occhiello">{t.occhiello}</p>
    <h1 class="display">{t.titolo}</h1>
    <p class="sottotitolo">{t.sottotitolo}</p>
  </header>

  <!-- Lo scambio: video annotato e minimappa affiancati -->
  <section class="blocco" aria-labelledby="scambio">
    <h2 id="scambio" class="titolo-blocco">{t.scambio.titolo}</h2>
    <p class="testo">{t.scambio.testo}</p>

    <div class="scambio">
      <figure class="video">
        <video
          bind:this={clip}
          src="{base}/clip-01.mp4"
          poster="{base}/clip-01.jpg"
          muted
          loop
          playsinline
          controls
          preload="metadata"
          width="1280"
          height="720"
          aria-label={t.scambio.altVideo}
        ></video>
      </figure>
      <figure class="mappa">
        <video
          bind:this={mappa}
          src="{base}/minimap-01.mp4"
          poster="{base}/minimap-01.png"
          muted
          loop
          playsinline
          preload="metadata"
          width="508"
          height="1012"
          aria-label={t.scambio.altMappa}
        ></video>
      </figure>
    </div>
    <ul class="legenda">
      {#each t.scambio.legenda as voce (voce.testo)}
        <li><span class="segno" class:punto={voce.punto} style:--c={voce.colore} aria-hidden="true"></span>{voce.testo}</li>
      {/each}
    </ul>
    <p class="fonte">{t.scambio.fonteVideo}</p>
  </section>

  <!-- Tre numeri guida -->
  <ul class="numeri">
    {#each t.numeri as n (n.cifra)}
      <li>
        <span class="cifra">{n.cifra}</span>
        <span class="frase">{n.frase}</span>
      </li>
    {/each}
  </ul>

  <!-- Metodo in cinque passi -->
  <section class="blocco" aria-labelledby="metodo">
    <h2 id="metodo" class="titolo-blocco">{t.metodo.titolo}</h2>
    <ol class="passi">
      {#each t.metodo.passi as passo, i (i)}
        <li>{passo}</li>
      {/each}
    </ol>
  </section>

  <!-- Grafici -->
  {#each t.grafici as g (g.id)}
    <section class="blocco grafico" aria-labelledby="g-{g.id}">
      <div class="grafico-testo">
        <h2 id="g-{g.id}" class="titolo-blocco">{g.titolo}</h2>
        <p class="testo">{g.testo}</p>
      </div>
      <figure class="grafico-figura">
        <img src="{base}/{g.id}.png" alt={g.alt} width={g.larghezza} height={g.altezza} loading="lazy" />
      </figure>
    </section>
  {/each}
  <p class="fonte">{t.noteGrafici}</p>

  <!-- Limiti -->
  <section class="blocco limiti" aria-labelledby="limiti">
    <h2 id="limiti" class="titolo-blocco">{t.limiti.titolo}</h2>
    <ul class="dash-list">
      {#each t.limiti.voci as voce (voce)}
        <li>{voce}</li>
      {/each}
    </ul>
  </section>
</ArticleShell>

<style>
  .testata {
    max-width: 980px;
  }

  .occhiello {
    margin: 0 0 var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-label);
    color: var(--acc);
  }

  .testata h1 {
    margin: 0;
    font-size: var(--type-index-m);
    line-height: var(--type-index-line-m);
  }

  .sottotitolo {
    max-width: 72ch;
    margin: var(--space-3) 0 0;
    font-family: var(--font-text);
    font-style: italic;
    font-size: var(--type-lead-m);
    line-height: var(--type-lead-line-m);
    color: var(--fg-2);
  }

  .blocco {
    margin-top: var(--space-7);
  }

  .titolo-blocco {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    font-size: var(--type-card-m);
    line-height: var(--type-card-line-m);
    letter-spacing: var(--tracking-tight);
  }

  .testo,
  .passi,
  .limiti :global(li) {
    font-family: var(--font-text);
    font-size: var(--type-body-m);
    line-height: var(--type-body-line-m);
    color: var(--fg-2);
  }

  .testo {
    margin: var(--space-2) 0 0;
    max-width: 68ch;
  }

  figure {
    margin: 0;
  }

  video,
  img {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Video e minimappa: impilati su mobile, affiancati da 800px */
  .scambio {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    margin-top: var(--space-5);
  }

  .video video {
    border: var(--border);
    background: #131313;
  }

  .mappa {
    justify-self: center;
    width: min(100%, 200px);
  }

  .legenda {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    margin: var(--space-3) 0 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-label);
    color: var(--fg-2);
  }

  .legenda li {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .segno {
    width: 22px;
    height: 3px;
    background: var(--c);
  }

  .segno.punto {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 1.5px solid #3c3c3c;
  }

  .fonte {
    margin: var(--space-3) 0 0;
    font-family: var(--font-mono);
    font-size: var(--type-label-xs);
    letter-spacing: var(--tracking-soft);
    color: var(--fg-3);
  }

  .numeri {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    margin: var(--space-7) 0 0;
    padding: 0;
    list-style: none;
  }

  .numeri li {
    padding: var(--space-3) var(--space-4);
    border-left: var(--space-1) solid var(--acc);
    background: var(--hatch-2);
  }

  .cifra {
    display: block;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-display-m);
    line-height: var(--type-display-line-m);
    letter-spacing: var(--tracking-display);
    color: var(--acc);
  }

  .frase {
    display: block;
    margin-top: var(--space-1);
    font-family: var(--font-text);
    font-style: italic;
    font-size: var(--type-small);
    line-height: var(--type-small-line);
    color: var(--fg-2);
  }

  .passi {
    margin: var(--space-3) 0 0;
    padding-left: 1.4em;
    max-width: 68ch;
  }

  .passi li + li {
    margin-top: var(--space-2);
  }

  .passi li::marker {
    font-family: var(--font-mono);
    color: var(--acc);
  }

  .grafico {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
  }

  .grafico-figura img {
    border: var(--border-rule, 1px solid var(--rule));
  }

  .limiti :global(.dash-list) {
    max-width: 68ch;
    margin-top: var(--space-3);
  }

  @media (min-width: 700px) {
    .testata h1 {
      font-size: var(--type-display-m);
      line-height: var(--type-display-line-m);
    }

    .sottotitolo {
      font-size: var(--type-lead);
      line-height: var(--type-lead-line);
    }

    .titolo-blocco {
      font-size: var(--type-card);
      line-height: var(--type-card-line);
    }

    .testo,
    .passi,
    .limiti :global(li) {
      font-size: var(--type-body);
      line-height: var(--type-body-line);
    }

    .numeri {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (min-width: 800px) {
    /* La minimappa ha la stessa altezza del video: larghezze nel rapporto
       dei due formati (16:9 contro 1:2). */
    .scambio {
      grid-template-columns: minmax(0, 3.55fr) minmax(0, 1fr);
      align-items: start;
    }

    .mappa {
      width: 100%;
    }
  }

  @media (min-width: 1024px) {
    /* Grafici: testo a sinistra, figura a destra */
    .grafico {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2.2fr);
      gap: var(--space-6);
      align-items: start;
    }
  }
</style>
