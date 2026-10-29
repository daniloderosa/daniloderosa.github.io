<script>
  import { scaleLinear } from 'd3';
  import { ancoreRiferimenti, etichetta, larghezzaTesto } from './geometria.js';
  import { formati } from '../formato.js';

  /**
   * BARRE DIVERGENTI: l'impatto di uno schema di gioco (quota di colpi hot
   * meno quota di colpi cold) per ogni partita. Le barre partono dallo zero:
   * verso sinistra l'impatto e negativo. Usato in B3. Grafico statico, senza
   * interazione: il riassunto testuale lo da il ChartFrame.
   *
   * righe        [{ key, nomi: [riga1, riga2], musetti: {impatto, decimali},
   *                 avversario: {impatto, decimali} }]
   *              la prima riga e il torneo: li l'avversario e la MEDIA dei cinque
   * riferimenti  [{ value, tipo: 'musetti'|'tour', nome, testo }] linee verticali
   *              tratteggiate (media personale, media Tour)
   * domain       [min, max] dell'asse, in punti percentuali
   * ticks        valori da segnare sull'asse
   *
   * Ogni riga e una fascia con due barre (Musetti sopra, avversario sotto).
   * Il nome della partita sta in una colonna a sinistra, su due righe
   * ("1° turno" / "Arnaldi"), centrato in verticale sulla coppia di barre;
   * un filo sottile separa una fascia dall'altra.
   * Il valore e scritto FUORI dalla barra, dal lato dell'estremo: a sinistra
   * per le barre negative, a destra per le positive.
   * Musetti = barra piena; avversario = barra vuota con bordo, piu sottile:
   * si distinguono anche senza il colore.
   * Il margine sinistro e destro si adatta alla larghezza, cosi le scritte
   * dei valori stanno sempre nel disegno (le frecce "Saldo negativo / positivo" scivolano a sinistra se serve)
   * e le scritte dei valori non toccano la colonna dei nomi.
   *
   * ui           scritte nella lingua della pagina (vedi etichette.js): musetti,
   *              avversario, saldoNegativo, saldoPositivo, mediaAvversari
   *
   * @type {{ righe: any[], riferimenti: any[], domain: number[], ticks: number[], ui: any, lang?: 'it' | 'en' }}
   */
  let { righe, riferimenti, domain, ticks, ui, lang = 'it' } = $props();

  // Numeri con segno scritti con i decimali della lingua della pagina
  const { segno } = $derived(formati(lang));

  // Larghezza reale del contenitore; se e nascosto (0) si usa 320.
  let misurata = $state(320);
  const w = $derived(misurata > 0 ? misurata : 320);

  const alto = 78; // spazio per la legenda (in cima) e le etichette dei riferimenti
  const rigaMin = 54; // altezza naturale di una fascia
  const rigaCompressa = 42; // minimo su desktop basso
  const rigaMax = 100; // tetto: oltre le fasce sembrerebbero sproporzionate
  const basso = 50; // tick + riga delle frecce di direzione

  // Altezza del contenitore (0 finche non e misurato) e altezza naturale.
  let disponibile = $state(0);
  const hNat = $derived(alto + righe.length * rigaMin + basso);
  const hMin = $derived(alto + righe.length * rigaCompressa + basso);
  // Finche non e misurato si usa l'altezza naturale.
  const altezzaRiga = $derived(
    disponibile > 0
      ? Math.min(Math.max((disponibile - alto - basso) / righe.length, rigaCompressa), rigaMax)
      : rigaMin
  );
  // Quota di riga in piu rispetto a quella naturale (puo essere negativa:
  // allora le fasce si comprimono).
  const extra = $derived(altezzaRiga - rigaMin);
  // u va da 0 (fascia compressa) a 1 (fascia naturale); sopra il naturale resta 1.
  const u = $derived(Math.min(1, 1 + extra / (rigaMin - rigaCompressa)));
  const crescita = $derived(Math.max(extra, 0));
  const h = $derived(alto + righe.length * altezzaRiga + basso);

  // Le due righe del nome di ogni blocco (es. ["1° turno", "Arnaldi"]): arrivano dai dati.
  const nomi = $derived(righe.map((r) => r.nomi));
  // Colonna dei nomi: larga quanto la riga di testo piu lunga.
  const colNomi = $derived(Math.max(...nomi.flat().map(larghezzaTesto)) + 8);

  // Tutti i valori mostrati (Musetti e avversari)
  const valori = $derived(righe.flatMap((r) => [r.musetti, r.avversario]).filter(Boolean));
  const barraMin = $derived(Math.min(...valori.map((d) => d.impatto), 0));
  const barraMax = $derived(Math.max(...valori.map((d) => d.impatto), 0));
  // Dominio effettivo: quello richiesto, allargato se una barra positiva lo supera.
  const dMax = $derived(Math.max(domain[1], barraMax));
  const dominio = $derived(dMax - domain[0]);
  // Larghezza della scritta di valore piu lunga (es. "−26%")
  const larghEtichetta = $derived(
    Math.max(...valori.map((d) => larghezzaTesto(`${segno(d.impatto, d.decimali)}%`))) + 8
  );
  // Destra: solo il posto per la scritta della barra positiva piu lunga.
  const destra = $derived.by(() => {
    const need = larghEtichetta + 4;
    // spazio gia dato dal dominio oltre la barra positiva, con stima del passo
    const k = (w - colNomi - 60) / dominio;
    return Math.max(12, need - (dMax - barraMax) * k);
  });
  // Sinistra: la barra piu lunga deve lasciare posto alla sua scritta, che a
  // sua volta non deve toccare la colonna dei nomi.
  const sinistra = $derived.by(() => {
    const base = colNomi + 4;
    const f = (barraMin - domain[0]) / dominio;
    if (f >= 1) return base;
    const s = (base + larghEtichetta - (w - destra) * f) / (1 - f);
    return Math.max(base, s);
  });
  const x = $derived(scaleLinear().domain([domain[0], dMax]).range([sinistra, w - destra]));
  const ancore = $derived(
    ancoreRiferimenti(
      riferimenti.map((r) => x(r.value)),
      riferimenti.map((r) => r.nome),
      w + 16 // le etichette possono sporgere un poco a destra: il riquadro ha il suo margine interno
    )
  );

  // Frecce "Saldo negativo / positivo": stanno attorno allo zero, ma se a destra
  // non c'e posto per la scritta l'intero gruppo scivola a sinistra.
  const frecciaTesto = $derived(larghezzaTesto(ui.saldoPositivo) + 24); // freccia + scritta
  const spostaFrecce = $derived(Math.min(0, w - 4 - (x(0) + frecciaTesto)));

  // Etichette dei tick: si parte dallo zero e si salta quella che toccherebbe
  // la precedente (succede solo su schermi stretti; le linee restano tutte).
  const tickVisibili = $derived.by(() => {
    const ordinati = [...ticks].sort((a, b) => Math.abs(a) - Math.abs(b));
    /** @type {number[]} */
    const tenuti = [];
    for (const t of ordinati) {
      const largo = larghezzaTesto(`${t === 0 ? '0' : segno(t)}%`) + 8;
      if (tenuti.every((k) => Math.abs(x(t) - x(k)) >= largo)) tenuti.push(t);
    }
    return tenuti;
  });

  // Se due etichette dei riferimenti non stanno affiancate (dy > 0 sulla
  // seconda), quella a sinistra sale di una riga: i due testi non si toccano.
  const salita = $derived(
    riferimenti.map((r, i) => {
      const dopo = riferimenti.findIndex((_, j) => j !== i && ancore[j].dy > 0 && x(riferimenti[j].value) > x(r.value));
      return dopo >= 0 ? ancore[dopo].dy : 0;
    })
  );

  // Spessore delle barre: cresce con la fascia e si stringe quando si comprime.
  const spessoreA = $derived(12 + 3 * u + crescita * 0.3);
  const spessoreB = $derived(8 + 2 * u + crescita * 0.2);
  const spazio = $derived(4 + crescita * 0.1); // distanza fra le due barre
  const blocco = $derived(spessoreA + spazio + spessoreB);
  // Le due barre stanno centrate nella fascia, come il nome a sinistra.
  const inizioA = $derived((altezzaRiga - blocco) / 2);
  const inizioB = $derived(inizioA + spessoreA + spazio);

  /**
   * Rettangolo di una barra: parte dallo zero e va verso il valore
   * (almeno 2px, cosi anche un impatto quasi nullo si vede).
   * @param {number} valore
   */
  function barra(valore) {
    const x0 = x(0);
    const x1 = x(valore);
    return { x: Math.min(x0, x1), larghezza: Math.max(Math.abs(x1 - x0), 2) };
  }

  /**
   * Posizione del valore scritto accanto alla barra: a sinistra se negativa,
   * a destra se positiva.
   * @param {number} valore
   */
  function postoValore(valore) {
    const b = barra(valore);
    return valore < 0 ? { x: b.x - 5, ancora: 'end' } : { x: b.x + b.larghezza + 5, ancora: 'start' };
  }

  // Nella riga Torneo l'avversario e la media: lo si scrive accanto al valore,
  // nella versione piu lunga che sta fra la colonna dei nomi e la barra.
  const notaMedia = $derived.by(() => {
    const d = righe[0]?.avversario;
    if (!d) return '';
    const valore = larghezzaTesto(`${segno(d.impatto, d.decimali)}%`);
    const posto = barra(d.impatto).x - 5 - (colNomi + 4) - valore - larghezzaTesto('\u00a0') - 10;
    return ui.mediaAvversari.find((/** @type {string} */ t) => larghezzaTesto(t) <= posto) ?? '';
  });
</script>

<div class="wrap" bind:clientWidth={misurata} bind:clientHeight={disponibile} style:--h-nat="{hNat}px" style:--h-min="{hMin}px">
  <svg width={w} height={h}>
    <!-- Grafico statico: nascosto agli screen reader (li serve il riassunto) -->
    <g aria-hidden="true">
      {#each ticks as t (t)}
        {@const testo = `${t === 0 ? '0' : segno(t)}%`}
        {@const et = etichetta(x(t), testo, w, 0)}
        <line class="griglia" x1={x(t)} x2={x(t)} y1={alto} y2={h - basso} />
        {#if tickVisibili.includes(t)}
          <text class="tick" x={et.x} y={h - basso + 16} text-anchor={et.ancora}>{testo}</text>
        {/if}
      {/each}

      <!-- Filo che separa una fascia-partita dalla successiva -->
      {#each righe as riga, i (riga.key)}
        {#if i > 0}
          <line class="filo" x1="0" x2={w} y1={alto + i * altezzaRiga} y2={alto + i * altezzaRiga} />
        {/if}
      {/each}

      <!-- Legenda diretta, in una riga in cima: forma e colore -->
      <g transform="translate(4 0)">
        <rect class="barra-a" x="0" y="2" width="14" height="10" />
        <text class="leg-a" x="20" y="11">{ui.musetti}</text>
        <rect class="barra-b" x="100" y="4" width="14" height="8" />
        <text class="leg-b" x="120" y="11">{ui.avversario}</text>
      </g>

      <!-- Asse dello zero -->
      <line class="zero" x1={x(0)} x2={x(0)} y1={alto - 6} y2={h - basso} />

      <!-- Riferimenti: media personale (viola) e media Tour (grigio) -->
      {#each riferimenti as r, i (r.nome)}
        <line class="rif rif-{r.tipo}" x1={x(r.value)} x2={x(r.value)} y1={alto - 14 - salita[i]} y2={h - basso} />
        <text class="rif-nome rif-nome-{r.tipo} alone" x={ancore[i].x} y={alto - 34 - salita[i]} text-anchor={ancore[i].ancora}>{r.nome}</text>
        <text class="rif-valore alone" x={ancore[i].x} y={alto - 21 - salita[i]} text-anchor={ancore[i].ancora}>{r.testo}</text>
      {/each}

      {#each righe as riga, i (riga.key)}
        {@const y = alto + i * altezzaRiga}
        {@const m = barra(riga.musetti.impatto)}
        {@const vm = postoValore(riga.musetti.impatto)}
        {@const a = barra(riga.avversario.impatto)}
        {@const va = postoValore(riga.avversario.impatto)}
        <!-- Nome su due righe, centrato sulla coppia di barre -->
        <text class="nome alone" class:forte={i === 0} x="4" y={y + altezzaRiga / 2 - 2}>{nomi[i][0]}</text>
        <text class="nome alone" class:forte={i === 0} x="4" y={y + altezzaRiga / 2 + 11}>{nomi[i][1]}</text>

        <rect class="barra-a" x={m.x} y={y + inizioA} width={m.larghezza} height={spessoreA} />
        <text class="valore-a alone" x={vm.x} y={y + inizioA + spessoreA - 2} text-anchor={vm.ancora}>{segno(riga.musetti.impatto, riga.musetti.decimali)}%</text>

        <rect class="barra-b" x={a.x} y={y + inizioB} width={a.larghezza} height={spessoreB} />
        <text class="valore-b alone" x={va.x} y={y + inizioB + spessoreB - 0.5} text-anchor={va.ancora}>{#if i === 0 && notaMedia}<tspan class="nota">{notaMedia}&nbsp;</tspan>{/if}{segno(riga.avversario.impatto, riga.avversario.decimali)}%</text>
      {/each}

      <!-- Direzione dell'asse, sotto i tick: frecce disegnate + scritta -->
      <g class="direzione" transform="translate({spostaFrecce} {h - basso + 36})">
        <path class="freccia" d="M {x(0) - 4} 0 H {x(0) - 18} M {x(0) - 14} -4 L {x(0) - 18} 0 L {x(0) - 14} 4" />
        <text class="dir-testo" x={x(0) - 24} y="4" text-anchor="end">{ui.saldoNegativo}</text>
        <path class="freccia" d="M {x(0) + 4} 0 H {x(0) + 18} M {x(0) + 14} -4 L {x(0) + 18} 0 L {x(0) + 14} 4" />
        <text class="dir-testo" x={x(0) + 24} y="4">{ui.saldoPositivo}</text>
      </g>
    </g>
  </svg>
</div>

<style>
  /* Il contenitore prende l'altezza che il riquadro gli lascia (height:100%,
     vale solo se il genitore ha un'altezza definita) ma mai meno di quella
     naturale (min-height, in stile). L'svg gli sta sopra in absolute: non puo
     allargarlo, quindi niente anelli di misura. */
  .wrap {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: var(--h-nat);
  }

  /* Su desktop (pagina a una schermata) il grafico puo comprimersi fino
     all'altezza minima; sotto, la pagina scorre e resta quella naturale. */
  @media (min-width: 900px) and (min-height: 700px) {
    .wrap {
      min-height: var(--h-min);
    }
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    overflow: visible;
    font-family: var(--font-mono);
    font-size: var(--type-mono-size);
  }

  .griglia {
    stroke: var(--color-grid);
    stroke-width: var(--stroke-axis);
  }

  .zero {
    stroke: var(--color-ink);
    stroke-width: var(--stroke-annotation);
  }

  .tick {
    fill: var(--color-muted);
  }

  /* Riferimenti: tratteggio piu spento (semitrasparente), testo a colore pieno */
  .rif {
    stroke-width: var(--stroke-annotation);
    stroke-dasharray: 4 3;
    stroke-opacity: 0.5;
  }

  .rif-musetti {
    stroke: var(--player-a);
  }

  .rif-tour {
    stroke: var(--color-muted);
  }

  .rif-nome-musetti {
    fill: var(--player-a);
  }

  .rif-nome-tour {
    fill: var(--color-muted);
  }

  .filo {
    stroke: var(--color-grid);
    stroke-width: var(--stroke-axis);
  }

  /* Frecce di direzione dell'asse */
  .freccia {
    fill: none;
    stroke: var(--color-ink);
    stroke-width: var(--stroke-annotation);
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .dir-testo {
    fill: var(--color-ink);
  }

  .rif-valore {
    fill: var(--color-ink);
    font-weight: var(--weight-bold);
  }

  /* Etichetta della partita: mono, su due righe, nella colonna a sinistra */
  .nome {
    fill: var(--color-ink);
  }

  /* Chiarimento "media avversari" (solo riga Torneo): non in grassetto */
  .nota {
    font-weight: var(--weight-regular, 400);
  }

  .nome.forte {
    font-weight: var(--weight-bold);
  }

  .barra-a {
    fill: var(--player-a);
  }

  .barra-b {
    fill: var(--color-white);
    stroke: var(--player-b);
    stroke-width: 2px;
  }

  .valore-a,
  .leg-a {
    fill: var(--player-a);
    font-weight: var(--weight-bold);
  }

  .valore-b,
  .leg-b {
    fill: var(--player-b);
    font-weight: var(--weight-bold);
  }

  /* Alone bianco dietro al testo: resta leggibile anche dove una linea
     tratteggiata gli passa sotto. */
  .alone {
    paint-order: stroke;
    stroke: var(--color-white);
    stroke-width: 4px;
    stroke-linejoin: round;
  }
</style>
