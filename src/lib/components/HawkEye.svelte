<script>
  import LanguageSwitch from './LanguageSwitch.svelte';
  import { site } from '$lib/data/site.js';
  import { path } from '$lib/data/routes.js';

  /**
   * LA TESTATA DELLA HOME: il campo "Hawk-Eye".
   *
   * Cosa succede: una pallina attraversa il campo con cinque traiettorie.
   * A ogni rimbalzo resta un cerchio sul punto d'impatto e compare una delle
   * tre schede (i due progetti e Chi sono). All'ultimo rimbalzo, a
   * 2.4 mm dalla riga, arriva la chiamata "IN"; poi il tabellone chiude il
   * game (5 -> 6) e compare GAME · SET · MATCH. L'animazione gira una
   * volta sola.
   *
   * Da 1200px in su: campo orizzontale con le schede a destra, e la testata
   * alta esattamente quanto lo schermo meno il nastro nero, che quindi si
   * vede sempre intero all'apertura. Sotto i 1200px: campo verticale, con il
   * tabellone sopra e le schede sotto. Le righe le disegna il CSS (vedi
   * .line in fondo), la traiettoria si adatta da sola misurando il campo.
   *
   * Accessibilita:
   * - senza JavaScript, o con "riduci movimento" attivo, si vede subito lo
   *   stato finale con tutte le schede;
   * - se qualcuno arriva sulle schede con la tastiera prima della fine,
   *   l'animazione salta allo stato finale, cosi non si finisce mai su un
   *   link invisibile;
   * - campo, pallina e tabellone sono decorativi (aria-hidden): il
   *   contenuto vero sono il nome, il motto e le schede.
   *
   * I testi stanno in src/lib/data/site.js, alla voce home.
   *
   * @type {{ lang: 'en' | 'it' }}
   */
  let { lang } = $props();

  const t = $derived(site[lang].home);

  /* Punti della traiettoria, come frazioni del campo orizzontale:
     [lungo la lunghezza, lungo la larghezza]. Il primo e il servizio, poi
     quattro rimbalzi, poi l'ultimo colpo vicino alla riga. Nel campo
     verticale le due coordinate si scambiano. */
  const POINTS = [
    [1.0, 0.716],
    [0.2914, 0.416],
    [0.9, 0.207],
    [0.169, 0.755],
    [0.8777, 0.793],
    [0.2173, 0.1264]
  ];
  const BOUNCES = POINTS.slice(1, 5);
  const FINAL = POINTS[5];

  /* Tempi in secondi: durata di ogni volo, pausa dopo ogni rimbalzo,
     durata della chiamata IN e del GAME · SET · MATCH. */
  const FLIGHTS = [0.85, 1.05, 1.05, 1.0, 0.95];
  const PAUSE = 0.38;
  const CALL_TIME = 2.2;
  const GSM_TIME = 2.6;
  const START_DELAY = 0.5;

  // Stato visibile dell'animazione
  let armed = $state(false); // true = l'animazione e partita, le schede si nascondono
  let revealed = $state(0); // quante schede e rimbalzi sono gia comparsi
  let showFinal = $state(false); // cerchio dell'ultimo colpo
  let showCall = $state(false); // chiamata IN
  let scoreDone = $state(false); // tabellone chiuso: 6-6
  let showGsm = $state(false); // GAME · SET · MATCH

  /** @type {HTMLDivElement} */
  let court;
  /** @type {HTMLCanvasElement} */
  let trail;
  /** @type {HTMLDivElement} */
  let ball;

  let stop = () => {};

  /** Porta subito tutto allo stato finale. */
  function finish() {
    stop();
    revealed = BOUNCES.length;
    showFinal = true;
    showCall = false;
    scoreDone = true;
    showGsm = true;
    if (ball) ball.style.opacity = '0';
    trail?.getContext('2d')?.clearRect(0, 0, trail.width, trail.height);
  }

  $effect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    armed = true;
    const ctx = trail.getContext('2d');
    const trailColor = getComputedStyle(court).getPropertyValue('--ball-trail');

    /** @type {{ a: number[], b: number[], d: number }[]} */
    let segments = [];
    let w = 0;
    let h = 0;

    // Ricalcola la traiettoria sulle misure attuali del campo.
    function measure() {
      w = court.clientWidth;
      h = court.clientHeight;
      trail.width = w;
      trail.height = h;
      const portrait = h > w;
      const toPx = (/** @type {number[]} */ f) => (portrait ? [f[1] * w, f[0] * h] : [f[0] * w, f[1] * h]);
      segments = FLIGHTS.map((d, i) => ({ a: toPx(POINTS[i]), b: toPx(POINTS[i + 1]), d }));
    }
    measure();

    let seg = 0;
    let phase = 'fly';
    let clock = -START_DELAY;
    let last = performance.now();
    let raf = 0;
    let running = true;

    stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /** @param {number} now */
    function tick(now) {
      if (!running) return;
      // Secondi passati dall'ultimo fotogramma: l'animazione segue il tempo
      // reale, quindi dura uguale anche su un telefono lento. Il limite di
      // mezzo secondo evita un salto se si torna alla scheda dopo un po'.
      const dt = Math.min(0.5, (now - last) / 1000);
      last = now;
      clock += dt;
      if (court.clientWidth !== w || court.clientHeight !== h) measure();

      // La scia sbiadisce un po' a ogni fotogramma.
      if (ctx) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      }

      if (clock >= 0 && phase === 'fly') {
        const s = segments[seg];
        const p = Math.min(1, clock / s.d);
        // Accelera e poi rallenta, come una palla vera.
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const x = s.a[0] + (s.b[0] - s.a[0]) * e;
        const y = s.a[1] + (s.b[1] - s.a[1]) * e;
        // A meta volo la palla e piu alta, quindi sembra piu grande.
        const scale = 1 + Math.sin(Math.PI * e) * 0.55;
        ball.style.opacity = '1';
        ball.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale.toFixed(2)})`;
        if (ctx) {
          ctx.fillStyle = trailColor;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
        if (p >= 1) {
          clock = 0;
          if (seg < segments.length - 1) {
            revealed = seg + 1;
            phase = 'pause';
          } else {
            showFinal = true;
            showCall = true;
            phase = 'call';
          }
        }
      } else if (phase === 'pause' && clock >= PAUSE) {
        seg += 1;
        phase = 'fly';
        clock = 0;
      } else if (phase === 'call' && clock >= CALL_TIME) {
        showCall = false;
        scoreDone = true;
        showGsm = true;
        phase = 'gsm';
        clock = 0;
      } else if (phase === 'gsm' && clock >= GSM_TIME) {
        showGsm = false;
        ball.style.opacity = '0';
        stop();
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => stop();
  });

  /** @param {{ page?: string, href?: string }} card */
  const cardHref = (card) => (card.page ? path(card.page, lang) : (card.href ?? '#'));
</script>

<section class="hero" class:armed>
  <div class="head">
    <div>
      <h1 class="name">{site.name}</h1>
      <p class="motto">{t.motto}</p>
    </div>
    <LanguageSwitch {lang} page="home" />
  </div>

  <div class="stage">
    <!-- Campo e schede affiancati (su desktop) -->
    <div class="playfield">
      <div class="court" bind:this={court} aria-hidden="true">
        <span class="line alley-a"></span>
        <span class="line alley-b"></span>
        <span class="line service-a"></span>
        <span class="line service-b"></span>
        <span class="line center"></span>
        <span class="line mark-a"></span>
        <span class="line mark-b"></span>
        <span class="net"></span>
        <span class="post post-a"></span>
        <span class="post post-b"></span>

        {#each BOUNCES as f, i (i)}
          <span class="bounce" class:on={!armed || i < revealed} style:--fx={f[0]} style:--fy={f[1]}>
            <span class="pulse"></span>
          </span>
        {/each}

        <span class="final" class:on={!armed || showFinal} style:--fx={FINAL[0]} style:--fy={FINAL[1]}>
          <span class="ring"></span>
          <span class="final-label">{t.mark}</span>
        </span>

        <canvas class="trail" bind:this={trail}></canvas>
        <div class="ball" bind:this={ball}></div>

        <div class="call" class:on={showCall}>
          <div class="call-box">
            <span class="call-word">{t.call}</span>
            <span class="call-note wide-only">{t.callNote}</span>
            <span class="call-note narrow-only">{t.callNoteShort}</span>
          </div>
        </div>
      </div>

      <!-- Le schede: a ogni rimbalzo ne compare una. Tutta la scheda e un
           link; al passaggio del mouse si schiarisce e compare la freccia. -->
      <div class="cards-wrap">
        <h2 class="sr-only">{t.cardsLabel}</h2>
        <ul class="cards" onfocusin={finish}>
          {#each t.cards as card, i (i)}
            <li class="card" class:shown={i < revealed}>
              <a
                class="card-link"
                href={cardHref(card)}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noopener' : undefined}
              >
                <span class="card-tag">{card.tag}</span>
                <span class="card-title">{card.title}</span>
                <span class="card-arrow" aria-hidden="true">→</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <!-- Tabellone: racconta la stessa storia del motto, quindi e decorativo.
         Su desktop sta sotto il campo, a meta fra il campo e il nastro;
         su mobile il CSS lo porta sopra il campo. -->
    <div class="scorebar" aria-hidden="true">
      <div class="score">
        <div class="row">
          <span class="player">{t.score.winner}</span>
          <span class="num">6</span>
          <span class="num">{scoreDone ? 6 : 5}</span>
          <span class="num pts win" class:gone={scoreDone}>40</span>
        </div>
        <div class="row dim">
          <span class="player">{t.score.loser}</span>
          <span class="num">4</span>
          <span class="num">3</span>
          <span class="num pts" class:gone={scoreDone}>15</span>
        </div>
      </div>
      <div class="gsm" class:on={showGsm}>{t.score.gameSetMatch}</div>
    </div>
  </div>
</section>

<style>
  /* ---------- Impaginazione: mobile prima ---------- */
  .hero {
    position: relative;
    padding: var(--space-4) 0 var(--space-6);
    background: var(--bg);
    color: var(--fg);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
    padding: 0 var(--page-pad);
  }

  .name {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-name-m);
    line-height: var(--type-name-line-m);
    letter-spacing: var(--tracking-tight);
  }

  .motto {
    margin: var(--space-2) 0 0;
    font-family: var(--font-text);
    font-style: italic;
    font-size: var(--type-motto-m);
    line-height: var(--type-motto-line-m);
    color: var(--fg-2);
  }

  /* Su mobile il tabellone, che nel codice viene dopo il campo, va sopra
     (order: -1): nome, tabellone, campo, schede. */
  .stage {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: var(--space-4) var(--page-pad) 0;
  }

  .scorebar {
    order: -1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    margin-bottom: var(--space-5);
  }

  /* ---------- Tabellone ---------- */
  .score {
    background: var(--panel);
    border-left: var(--score-accent-m) solid var(--ball);
    padding: var(--space-2) var(--space-3);
  }

  .row {
    display: flex;
    align-items: baseline;
    font-size: var(--type-score-m);
    line-height: 1.4;
  }

  .row + .row {
    margin-top: var(--space-1);
  }

  .row.dim {
    color: var(--score-dim);
  }

  .player {
    width: var(--score-name-w-m);
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
  }

  .num {
    width: var(--score-num-w-m);
    text-align: center;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  .pts {
    width: var(--score-pts-w-m);
    overflow: hidden;
    transition: width 0.4s ease, opacity 0.4s ease;
  }

  .pts.win {
    color: var(--ball);
    font-weight: var(--weight-bold);
  }

  /* A punto finito la colonna dei 40-15 si chiude. */
  .pts.gone {
    width: 0;
    opacity: 0;
  }

  .gsm {
    background: var(--panel);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-mono);
    font-weight: var(--weight-bold);
    font-size: var(--type-label-xs);
    letter-spacing: var(--tracking-label-wide);
    color: var(--ball);
    white-space: nowrap;
    opacity: 0;
    transform: translateY(calc(-1 * var(--nudge)));
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }

  .gsm.on {
    opacity: 1;
    transform: none;
  }

  /* ---------- Il campo ---------- */
  .court {
    position: relative;
    width: var(--court-w-m);
    margin: 0 auto;
    /* Proporzioni reali: 10.97 m di larghezza per 23.77 m di lunghezza */
    aspect-ratio: 10.97 / 23.77;
    background: var(--court);
    border: var(--court-line-w) solid var(--court-line);
    box-shadow: var(--court-inset-m);
  }

  .line,
  .net,
  .post {
    position: absolute;
    background: var(--court-line);
  }

  /* Righe del campo verticale (mobile) */
  .alley-a { top: 0; bottom: 0; left: var(--court-alley); width: var(--court-line-w); }
  .alley-b { top: 0; bottom: 0; right: var(--court-alley); width: var(--court-line-w); }
  .service-a { left: var(--court-alley); right: var(--court-alley); top: var(--court-service); height: var(--court-line-w); }
  .service-b { left: var(--court-alley); right: var(--court-alley); bottom: var(--court-service); height: var(--court-line-w); }
  .center { left: calc(50% - var(--court-line-w) / 2); top: var(--court-service); bottom: var(--court-service); width: var(--court-line-w); }
  .mark-a { left: calc(50% - var(--court-line-w) / 2); top: 0; height: var(--court-mark); width: var(--court-line-w); }
  .mark-b { left: calc(50% - var(--court-line-w) / 2); bottom: 0; height: var(--court-mark); width: var(--court-line-w); }
  .net {
    left: calc(-1 * var(--court-overhang));
    right: calc(-1 * var(--court-overhang));
    top: calc(50% - var(--court-net-w) / 2);
    height: var(--court-net-w);
  }
  .post {
    top: calc(50% - var(--court-post) / 2);
    width: var(--court-post);
    height: var(--court-post);
    border-radius: 50%;
  }
  .post-a { left: calc(-1 * var(--court-overhang) - var(--court-post) / 2); }
  .post-b { right: calc(-1 * var(--court-overhang) - var(--court-post) / 2); }

  /* Rimbalzi: --fx e --fy sono le frazioni del campo orizzontale; nel campo
     verticale si scambiano (vedi la versione desktop piu sotto). */
  .bounce,
  .final {
    position: absolute;
    left: calc(var(--fy) * 100%);
    top: calc(var(--fx) * 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .bounce {
    width: var(--bounce-size-m);
    height: var(--bounce-size-m);
    margin: calc(var(--bounce-size-m) / -2) 0 0 calc(var(--bounce-size-m) / -2);
    border: var(--bounce-line-m) solid var(--ball);
    border-radius: 50%;
  }

  .pulse {
    position: absolute;
    inset: calc(-1 * var(--bounce-line-m));
    border: var(--bounce-line-m) solid var(--ball);
    border-radius: 50%;
    animation: pulse 1.6s ease-out infinite;
  }

  .bounce.on,
  .final.on {
    opacity: 1;
  }

  .final {
    margin: calc(var(--bounce-size-m) / -2) 0 0 calc(var(--bounce-size-m) / -2);
  }

  .ring {
    display: block;
    width: var(--bounce-size-m);
    height: var(--bounce-size-m);
    border: var(--bounce-line-m) solid var(--ball);
    border-radius: 50%;
  }

  .final-label {
    position: absolute;
    left: calc(var(--bounce-size-m) + var(--space-1));
    top: var(--nudge);
    font-family: var(--font-mono);
    font-size: var(--type-label-xs);
    font-weight: var(--weight-bold);
    letter-spacing: var(--tracking-label);
    color: var(--ball);
    text-shadow: var(--text-shadow-dark);
    white-space: nowrap;
  }

  .trail {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .ball {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--ball-size);
    height: var(--ball-size);
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, var(--ball-light), var(--ball) 60%, var(--ball-dark));
    box-shadow: var(--glow-ball);
    opacity: 0;
    will-change: transform;
    pointer-events: none;
  }

  /* Chiamata IN */
  .call {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0;
    transform: scale(0.92);
    transition: opacity 0.35s, transform 0.35s;
  }

  .call.on {
    opacity: 1;
    transform: none;
  }

  .call-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80%;
    height: 46%;
    background: radial-gradient(closest-side, var(--call-halo), transparent 74%);
  }

  .call-word {
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-call-m);
    line-height: 1;
    color: var(--ball);
    text-shadow: var(--glow-call-m);
  }

  .call-note {
    margin-top: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--type-label-xs);
    letter-spacing: var(--tracking-wide-m);
    color: var(--fg);
  }

  .wide-only {
    display: none;
  }

  /* ---------- Schede: su mobile stanno sotto il campo ---------- */
  .cards-wrap {
    margin-top: var(--space-6);
  }

  .cards {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .card {
    display: flex;
    transition: opacity var(--ease-slow) ease-out, transform var(--ease-slow) ease-out;
  }

  /* Le schede si nascondono solo se l'animazione e partita davvero:
     senza JavaScript restano sempre visibili. */
  .armed .card:not(.shown) {
    opacity: 0;
    transform: translateY(var(--space-2));
  }

  /* Tutta la scheda e il link. La freccia a destra fa spazio a se stessa
     (padding-right), cosi non copre mai il titolo. */
  .card-link {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-1);
    min-height: var(--tap-min);
    padding: var(--space-3) calc(var(--space-5) + var(--type-arrow-m)) var(--space-3) var(--space-3);
    background: var(--panel);
    border: var(--line-thin) solid var(--panel-border);
    color: var(--fg);
    text-decoration: none;
    transition: background var(--ease-fast), color var(--ease-fast), border-color var(--ease-fast);
  }

  /* Al passaggio del mouse (o con la tastiera) la scheda passa ai colori
     chiari della parte bassa della home e compare la freccia: si capisce
     che ci si puo entrare. */
  .card-link:hover,
  .card-link:focus-visible {
    background: var(--foot-bg);
    border-color: var(--foot-bg);
    color: var(--foot-fg);
  }

  .card-tag {
    font-family: var(--font-mono);
    font-size: var(--type-label-xs);
    line-height: 1.4;
    letter-spacing: var(--tracking-label);
    color: var(--ball);
    transition: color var(--ease-fast);
  }

  .card-link:hover .card-tag,
  .card-link:focus-visible .card-tag {
    color: var(--foot-fg);
  }

  .card-title {
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    font-size: var(--type-panel-m);
    line-height: var(--type-panel-line-m);
  }

  .card-arrow {
    position: absolute;
    right: var(--space-4);
    top: 50%;
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    font-size: var(--type-arrow-m);
    line-height: 1;
    opacity: 0;
    transform: translate(calc(-2 * var(--nudge)), -50%);
    transition: opacity var(--ease-fast), transform var(--ease-fast);
  }

  .card-link:hover .card-arrow,
  .card-link:focus-visible .card-arrow {
    opacity: 1;
    transform: translate(0, -50%);
  }

  @keyframes pulse {
    0% { transform: scale(0.5); opacity: 0.9; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  /* ---------- Desktop: campo orizzontale, schede a destra ----------
     La testata e alta quanto lo schermo meno il nastro nero, che cosi si
     vede sempre intero all'apertura. Dentro: nome in alto; poi lo "stage",
     che prende tutto lo spazio rimasto. Lo stage contiene il campo con le
     schede accanto e, sotto, il tabellone centrato nello spazio fra la fine
     del campo e il nastro. */
  @media (min-width: 1200px) {
    .hero {
      display: flex;
      flex-direction: column;
      height: max(var(--hero-min-h), calc(100svh - var(--ticker-h)));
      padding: var(--space-6) var(--page-pad-wide) 0;
    }

    .head {
      padding: 0;
      margin-bottom: var(--space-6);
    }

    .name {
      font-size: var(--type-name);
      line-height: var(--type-name-line);
    }

    .motto {
      font-size: var(--type-motto);
      line-height: var(--type-motto-line);
    }

    /* "container-type: size" permette al campo di conoscere la larghezza e
       l'altezza disponibili (unita cqw e cqh) e scegliere la misura piu
       grande che ci sta senza deformarsi. */
    .stage {
      flex: 1;
      min-height: 0;
      margin: 0;
      container-type: size;
    }

    .playfield {
      display: flex;
      justify-content: space-between;
      gap: var(--space-6);
    }

    /* Proporzioni reali: 23.77 m di lunghezza per 10.97 m di larghezza.
       Larghezza = la piu piccola fra (spazio accanto alle schede) e
       (altezza disponibile, tolto lo spazio minimo del tabellone, per le
       proporzioni del campo). L'altezza segue da sola. */
    .court {
      flex: none;
      width: min(
        calc(100cqw - var(--hero-cards) - var(--space-6)),
        calc((100cqh - var(--score-zone-min)) * 23.77 / 10.97)
      );
      margin: 0;
      aspect-ratio: 23.77 / 10.97;
      box-shadow: var(--court-inset);
    }

    /* Il tabellone occupa lo spazio fra campo e nastro e ci sta al centro. */
    .scorebar {
      order: 0;
      flex: 1;
      flex-direction: row;
      align-items: center;
      gap: var(--space-4);
      margin: 0;
    }

    .score {
      border-left-width: var(--score-accent);
      padding: var(--space-3) var(--space-5);
    }

    .row {
      font-size: var(--type-score-num);
    }

    .row + .row {
      margin-top: var(--space-1);
    }

    .player {
      width: var(--score-name-w);
      font-size: var(--type-score-name);
    }

    .num {
      width: var(--score-num-w);
    }

    .pts {
      width: var(--score-pts-w);
    }

    .gsm {
      padding: var(--space-2) var(--space-4);
      font-size: var(--type-gsm);
      letter-spacing: var(--tracking-label-wide);
      transform: translateX(calc(-2 * var(--nudge)));
    }

    /* Righe del campo orizzontale */
    .alley-a { top: var(--court-alley); bottom: auto; left: 0; right: 0; width: auto; height: var(--court-line-w); }
    .alley-b { top: auto; bottom: var(--court-alley); left: 0; right: 0; width: auto; height: var(--court-line-w); }
    .service-a { left: var(--court-service); right: auto; top: var(--court-alley); bottom: var(--court-alley); width: var(--court-line-w); height: auto; }
    .service-b { left: auto; right: var(--court-service); top: var(--court-alley); bottom: var(--court-alley); width: var(--court-line-w); height: auto; }
    .center { left: var(--court-service); right: var(--court-service); top: calc(50% - var(--court-line-w) / 2); bottom: auto; width: auto; height: var(--court-line-w); }
    .mark-a { left: 0; top: calc(50% - var(--court-line-w) / 2); width: var(--court-mark); height: var(--court-line-w); }
    .mark-b { left: auto; right: 0; bottom: auto; top: calc(50% - var(--court-line-w) / 2); width: var(--court-mark); height: var(--court-line-w); }
    .net {
      left: calc(50% - var(--court-net-w) / 2);
      right: auto;
      top: calc(-1 * var(--court-overhang));
      bottom: calc(-1 * var(--court-overhang));
      width: var(--court-net-w);
      height: auto;
    }
    .post { left: calc(50% - var(--court-post) / 2); right: auto; }
    .post-a { top: calc(-1 * var(--court-overhang) - var(--court-post) / 2); }
    .post-b { top: auto; bottom: calc(-1 * var(--court-overhang) - var(--court-post) / 2); }

    .bounce,
    .final {
      left: calc(var(--fx) * 100%);
      top: calc(var(--fy) * 100%);
    }

    .bounce,
    .final {
      margin: calc(var(--bounce-size) / -2) 0 0 calc(var(--bounce-size) / -2);
    }

    .bounce {
      width: var(--bounce-size);
      height: var(--bounce-size);
      border-width: var(--court-line-w);
    }

    .pulse {
      inset: calc(-1 * var(--court-line-w));
      border-width: var(--court-line-w);
    }

    .ring {
      width: var(--bounce-size);
      height: var(--bounce-size);
      border-width: var(--court-line-w);
    }

    .final-label {
      left: 50%;
      top: calc(var(--bounce-size) + var(--space-1));
      transform: translateX(-50%);
    }

    .call-box {
      width: var(--call-box-w);
      max-width: 90%;
      max-height: 90%;
      height: var(--call-box-h);
      background: radial-gradient(closest-side, var(--call-halo), transparent 72%);
    }

    .call-word {
      font-size: var(--type-call);
      text-shadow: var(--glow-call);
    }

    .call-note {
      font-size: var(--type-label);
      letter-spacing: var(--tracking-wide);
    }

    .wide-only {
      display: inline;
    }

    .narrow-only {
      display: none;
    }

    /* Le schede sono alte esattamente quanto il campo: la prima inizia dove
       inizia il campo, la terza finisce dove finisce. "container-type: size"
       fa si che il loro contenuto non allunghi la riga (comanda il campo) e
       permette di adattare i titoli all'altezza disponibile, piu sotto. */
    .cards-wrap {
      flex: none;
      width: var(--hero-cards);
      margin-top: 0;
      container-type: size;
    }

    .cards {
      height: 100%;
      gap: var(--space-3);
    }

    .card {
      flex: 1;
      min-height: 0;
    }

    .card-link {
      padding: var(--space-3) calc(var(--space-6) + var(--type-arrow)) var(--space-3) var(--space-5);
      overflow: hidden;
    }

    .card-tag {
      font-size: var(--type-label-s);
    }

    .card-title {
      font-size: var(--type-panel-s);
      line-height: var(--type-panel-line-s);
    }

    .card-arrow {
      right: var(--space-5);
      font-size: var(--type-arrow);
    }
  }

  /* Titoli delle schede in base all'altezza del campo (e quindi della
     colonna delle schede): pieni quando c'e spazio, piu piccoli quando lo
     schermo e basso, cosi il testo non viene mai tagliato. */
  @container (min-height: 420px) {
    .card-title {
      font-size: var(--type-panel);
      line-height: var(--type-panel-line);
    }
  }

  @container (max-height: 330px) {
    .card-link {
      padding-top: var(--space-2);
      padding-bottom: var(--space-2);
    }

    .card-title {
      font-size: var(--type-panel-xs);
      line-height: var(--type-panel-line-xs);
    }
  }
</style>
