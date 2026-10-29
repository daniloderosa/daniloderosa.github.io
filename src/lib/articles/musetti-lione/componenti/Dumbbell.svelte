<script>
  import { scaleLinear } from 'd3';
  import { etichetta, ancoreRiferimenti } from './geometria.js';

  /**
   * GRAFICO "DUMBBELL": per ogni partita una riga con due punti (Musetti e
   * avversario) uniti da un filo, piu linee verticali di riferimento
   * (la media personale e quella del Tour). Usato in A1 e B1.
   *
   * righe        [{ key, label, sub, a: {value, text}, b: {...} }]
   *              a = Musetti, b = avversario. `value` e la posizione sull'asse,
   *              `text` l'etichetta scritta accanto al punto.
   * riferimenti  [{ value, tipo, nome, testo }] linee verticali. `tipo` e
   *              'musetti' (viola, come il suo punto) oppure 'tour' (grigio).
   * domain       [min, max] dell'asse orizzontale
   * ticks        valori da segnare sull'asse (in %)
   *
   * Le etichette stanno direttamente sui punti della prima riga
   * ("Musetti", "Avversario"): niente legenda.
   *
   * ui           { musetti, avversario }: i nomi delle due serie nella lingua
   *              della pagina (vedi etichette.js)
   *
   * @type {{ righe: any[], riferimenti: any[], domain: number[], ticks: number[], ui: { musetti: string, avversario: string } }}
   */
  let { righe, riferimenti, domain, ticks, ui } = $props();

  // Larghezza reale del contenitore: il grafico si ridisegna a ogni misura.
  // Se il contenitore e nascosto (0) si usa 320, per non avere scale rovesciate.
  let misurata = $state(320);
  const w = $derived(misurata > 0 ? misurata : 320);

  // Margini del disegno (px). A sinistra ci sta il nome dell'avversario.
  const sinistra = 76;
  const destra = 14;
  const alto = 46;
  const rigaMin = 58; // altezza naturale di una riga
  const rigaCompressa = 46; // minimo su desktop basso: le etichette non si toccano ancora
  const rigaMax = 104; // oltre questo le righe sembrerebbero sproporzionate
  const basso = 28;
  const raggio = 6.5; // raggio dei punti

  // Altezza del contenitore (0 finche non e misurato) e altezza naturale.
  let disponibile = $state(0);
  const hNat = $derived(alto + righe.length * rigaMin + basso);
  // Le righe crescono per riempire lo spazio, entro [rigaMin, rigaMax].
  const hMin = $derived(alto + righe.length * rigaCompressa + basso);
  // Le righe si adattano allo spazio, entro [rigaCompressa, rigaMax]
  // (finche non e misurato si usa l'altezza naturale).
  const altezzaRiga = $derived(
    disponibile > 0
      ? Math.min(Math.max((disponibile - alto - basso) / righe.length, rigaCompressa), rigaMax)
      : rigaMin
  );
  // Distanza dell'etichetta dell'avversario sotto il punto: si accorcia con la riga.
  const sotto = $derived(Math.min(24, altezzaRiga * 0.43));
  const h = $derived(alto + righe.length * altezzaRiga + basso);
  const x = $derived(scaleLinear().domain(domain).range([sinistra, w - destra]));
  /** @param {number} i */
  const cy = (i) => alto + i * altezzaRiga + altezzaRiga / 2;
  const ancore = $derived(
    ancoreRiferimenti(
      riferimenti.map((r) => x(r.value)),
      riferimenti.map((r) => r.nome),
      w
    )
  );

  /**
   * Etichetta di un punto, con il nome della serie sulla prima riga.
   * @param {number} i
   * @param {string} nome
   * @param {string} text
   */
  const testoPunto = (i, nome, text) => (i === 0 ? `${nome} ${text}` : text);
</script>

<div class="wrap" bind:clientWidth={misurata} bind:clientHeight={disponibile} style:--h-nat="{hNat}px" style:--h-min="{hMin}px">
  <svg width={w} height={h}>
    <!-- Parte statica: nascosta agli screen reader (li serve il riassunto) -->
    <g aria-hidden="true">
    <!-- Griglia verticale e asse -->
    {#each ticks as t (t)}
      <line class="griglia" x1={x(t)} x2={x(t)} y1={alto} y2={h - basso} />
      <text class="tick" x={x(t)} y={h - basso + 16} text-anchor="middle">{t}%</text>
    {/each}

    <!-- Riferimenti: linee verticali con nome e valore -->
    {#each riferimenti as r, i (r.nome)}
      <line class="rif {r.tipo}" x1={x(r.value)} x2={x(r.value)} y1={alto - 10} y2={h - basso} />
      <text class="rif-nome {r.tipo}" x={ancore[i].x} y={alto - 30 + ancore[i].dy} text-anchor={ancore[i].ancora}>{r.nome}</text>
      <text class="rif-valore {r.tipo}" x={ancore[i].x} y={alto - 17 + ancore[i].dy} text-anchor={ancore[i].ancora}>{r.testo}</text>
    {/each}

    {#each righe as riga, i (riga.key)}
      {@const testoA = testoPunto(i, ui.musetti, riga.a.text)}
      {@const testoB = testoPunto(i, ui.avversario, riga.b.text)}
      {@const etA = etichetta(x(riga.a.value), testoA, w, 4, sinistra)}
      {@const etB = etichetta(x(riga.b.value), testoB, w, 4, sinistra)}

      <text class="nome" x="6" y={cy(i) - 2}>{riga.label}</text>
      <text class="sub" x="6" y={cy(i) + 14}>{riga.sub}</text>

      <!-- Avversario (cerchio vuoto) e filo che lo unisce a Musetti -->
      <line class="filo" x1={x(riga.b.value)} x2={x(riga.a.value)} y1={cy(i)} y2={cy(i)} />
      <circle class="punto-b" cx={x(riga.b.value)} cy={cy(i)} r="6" />
      <text class="valore-b alone" x={etB.x} y={cy(i) + sotto} text-anchor={etB.ancora}>{testoB}</text>

      <!-- Musetti (cerchio pieno) -->
      <circle class="punto-a" cx={x(riga.a.value)} cy={cy(i)} r={raggio} />
      <text class="valore-a alone" x={etA.x} y={cy(i) - 12} text-anchor={etA.ancora}>{testoA}</text>
    {/each}
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

  .tick {
    fill: var(--color-muted);
  }

  /* Righe di riferimento: stesso tratteggio, linea semitrasparente.
     Musetti = viola del suo punto; Tour = grigio. Il testo resta a tinta
     piena (contrasto), e il nome distingue le due righe anche senza colore. */
  .rif {
    stroke-width: var(--stroke-annotation);
    stroke-dasharray: 4 3;
    stroke-opacity: 0.5;
  }

  .rif.musetti {
    stroke: var(--player-a);
  }

  .rif.tour {
    stroke: var(--color-muted);
  }

  .rif-nome,
  .rif-valore {
    font-weight: var(--weight-bold);
  }

  .rif-nome.musetti,
  .rif-valore.musetti {
    fill: var(--player-a);
  }

  .rif-nome.tour,
  .rif-valore.tour {
    fill: var(--color-muted);
  }

  .nome {
    fill: var(--color-ink);
    font-family: var(--font-display);
    font-size: var(--type-chart-sub-size);
  }

  .sub {
    fill: var(--color-muted);
  }

  .filo {
    stroke: var(--color-inert);
    stroke-width: 3px;
  }

  /* Musetti = cerchio pieno; avversario = cerchio vuoto: si distinguono
     anche senza il colore. */
  .punto-a {
    fill: var(--player-a);
  }

  .punto-b {
    fill: var(--color-white);
    stroke: var(--player-b);
    stroke-width: 2.5px;
  }

  .valore-a {
    fill: var(--player-a);
    font-weight: var(--weight-bold);
  }

  .valore-b {
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
