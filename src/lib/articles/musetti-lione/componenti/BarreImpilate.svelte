<script>
  import { formati } from '../formato.js';
  import { larghezzaTesto } from './geometria.js';

  /**
   * BARRE IMPILATE AL 100%: ogni barra e un insieme diviso in segmenti
   * (per esempio le zone in cui cadono le seconde di servizio).
   * Usato in A3 (zone della seconda) e A4 (posizione in risposta).
   *
   * barre      [{ key, label, sub?, decimali?, totale?, riferimento?,
   *               parti: [{ nome, value, count, tono, title }] }]
   *              value  quota in %, count conteggio grezzo (o null)
   *              tono   1, 3 o 5: da chiaro a scuro (colori --seq-1/3/5)
   *              title  dettaglio testuale (non mostrato: il grafico non e interattivo)
   * legenda    [{ nome, tono }] legenda sopra le barre, nell'ordine dei segmenti.
   *            Sta su una riga se la larghezza lo permette, altrimenti
   *            va a capo come elenco (telefono). Serve solo quando i segmenti
   *            sono troppo stretti per portare il nome (A4); in A3 il nome
   *            sta dentro il segmento.
   * nomiDentro true = il nome del segmento e scritto dentro il segmento
   * etichettaSopra true = il nome della barra sta sopra, non a sinistra
   *
   * Ogni segmento porta la percentuale scritta (e il conteggio, se c'e):
   * l'informazione non dipende dal solo colore. Il grafico e statico:
   * i valori sono scritti nei segmenti.
   *
   * @type {{ barre: any[], legenda?: any[], nomiDentro?: boolean, etichettaSopra?: boolean, lang?: 'it' | 'en' }}
   */
  let { barre, legenda = [], nomiDentro = false, etichettaSopra = false, lang = 'it' } = $props();

  // Percentuali scritte con i decimali della lingua della pagina
  const { num } = $derived(formati(lang));

  // Larghezza reale del contenitore; se e nascosto (0) si usa 320.
  let misurata = $state(320);
  const w = $derived(misurata > 0 ? misurata : 320);

  // Colonna dei nomi a sinistra: larga quanto il nome (o sottotitolo) piu
  // lungo, almeno 84px, cosi "Media Tour" non viene mai tagliato.
  const sinistra = $derived(
    etichettaSopra
      ? 0
      : Math.max(
          84,
          ...barre.map((b) =>
            Math.max(b.label.length * 7.8, b.sub ? larghezzaTesto(b.sub) : 0) + 12
          )
        )
  );
  const larghezzaBarra = $derived(w - sinistra);
  // Altezza naturale della barra e del passo fra una barra e la successiva.
  const barraMin = $derived(nomiDentro ? 58 : 32);
  const passoMin = $derived(etichettaSopra ? barraMin + 44 : barraMin + 18);
  // Minimo su desktop basso: barra piu bassa e passo piu corto (solo senza nomi dentro).
  const barraCompressa = $derived(nomiDentro ? 58 : 24);
  const passoCompresso = $derived(nomiDentro ? passoMin : barraCompressa + 12);
  // Tetto della crescita per riga: con i nomi dentro (A3, poche barre) le
  // barre possono riempire quasi tutta l'altezza; con tante righe no.
  const extraMax = $derived(nomiDentro ? 220 : 100);

  // Legenda: su una riga se le voci (quadratino + testo) stanno affiancate
  // nella larghezza, altrimenti una voce per riga.
  const larghezzaVoci = $derived(legenda.map((v) => 22 + larghezzaTesto(v.nome)));
  const legendaUnaRiga = $derived(
    larghezzaVoci.reduce((t, l) => t + l, 0) + (legenda.length - 1) * 20 + 2 <= w
  );
  // x di partenza di ogni voce quando stanno su una riga
  const xVoci = $derived(
    larghezzaVoci.map((_, i) => 2 + larghezzaVoci.slice(0, i).reduce((t, l) => t + l + 20, 0))
  );
  // Parte alta fissa (legenda)
  const cima = $derived(
    legenda.length ? (legendaUnaRiga ? 18 : legenda.length * 20) + 14 : 6
  );
  // Spazio fra le partite e le barre di riferimento (media personale, Tour),
  // dove sta la linea separatrice.
  const saltoRif = 26;
  const saltiRif = $derived(
    barre.filter((b, i) => b.riferimento && !(i > 0 && barre[i - 1].riferimento)).length * saltoRif
  );
  const hNat = $derived(barre.length ? cima + saltiRif + barre.length * passoMin : 0);
  const hMin = $derived(barre.length ? cima + saltiRif + barre.length * passoCompresso : 0);

  // Altezza del contenitore (0 finche non e misurato): se avanza spazio,
  // ogni riga cresce di `extra` px (barra e passo insieme).
  let disponibile = $state(0);
  // Con extra negativo le righe si comprimono (fino al minimo); se non c'e
  // compressione possibile il minimo e 0.
  const extraMin = $derived(passoCompresso - passoMin);
  const extra = $derived(
    barre.length && disponibile > 0
      ? Math.min(Math.max((disponibile - hNat) / barre.length, extraMin), extraMax)
      : 0
  );
  const altezzaBarra = $derived(
    extra >= 0 ? barraMin + extra * (nomiDentro ? 0.85 : 0.75) : barraMin + (extra * (barraMin - barraCompressa)) / (passoMin - passoCompresso)
  );
  const passoRiga = $derived(passoMin + extra);
  // Il testo a tre righe (nome, %, conteggio) resta centrato nella barra;
  // se la barra e alta le righe si distanziano un po' di piu.
  const interlinea = $derived(17 + Math.min(Math.max(altezzaBarra - 58, 0) / 10, 8));

  const posizioni = $derived.by(() => {
    let y = cima;
    let precedenteRif = false;
    return barre.map((b) => {
      if (b.riferimento && !precedenteRif) y += saltoRif;
      precedenteRif = !!b.riferimento;
      const riga = y;
      y += passoRiga;
      return riga;
    });
  });
  // y della linea separatrice: a meta fra l'ultima partita e la prima barra di riferimento
  const ySeparatore = $derived.by(() => {
    const i = barre.findIndex((b, k) => b.riferimento && !(k > 0 && barre[k - 1].riferimento));
    return i > 0 ? (posizioni[i] + posizioni[i - 1] + altezzaBarra) / 2 : null;
  });
  const h = $derived(posizioni.length ? posizioni[posizioni.length - 1] + passoRiga : 0);

  /**
   * Segmenti con la x di partenza e la larghezza in px. Le quote si
   * rapportano alla loro somma: i valori approssimati (Tour: 37+21+41 = 99)
   * riempiono comunque tutta la barra.
   * @param {any} b
   */
  function segmenti(b) {
    const somma = b.parti.reduce((/** @type {number} */ t, /** @type {any} */ p) => t + p.value, 0) || 100;
    let x0 = sinistra;
    return b.parti.map((/** @type {any} */ p) => {
      const larghezza = (p.value / somma) * larghezzaBarra;
      const s = { ...p, x: x0, larghezza };
      x0 += larghezza;
      return s;
    });
  }

  /**
   * Nomi dei segmenti troppo stretti per contenerli (solo con nomiDentro):
   * si scrivono sotto la barra, procedendo da destra e spostandosi a sinistra
   * quando due nomi si toccherebbero. Restituisce la x di fine di ogni nome.
   * @param {any[]} segs  i segmenti di una barra
   * @returns {Map<string, number>}
   */
  function nomiFuori(segs) {
    /** @type {Map<string, number>} */
    const fine = new Map();
    let limite = w - 4;
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i];
      if (s.larghezza <= 0 || sta(s.larghezza, s.nome)) continue;
      const destra = Math.min(s.x + s.larghezza / 2 + larghezzaTesto(s.nome) / 2, limite);
      fine.set(s.nome, destra);
      limite = destra - larghezzaTesto(s.nome) - 6;
    }
    return fine;
  }

  /**
   * Il testo si scrive solo se ci sta.
   * @param {number} larghezza
   * @param {string} testo
   */
  const sta = (larghezza, testo) => larghezza >= larghezzaTesto(testo) + 6;
</script>

<div class="wrap" bind:clientWidth={misurata} bind:clientHeight={disponibile} style:--h-nat="{hNat}px" style:--h-min="{hMin}px">
  <svg width={w} height={h}>
    <g aria-hidden="true">
    {#if legenda.length}
      {#each legenda as voce, i (voce.nome)}
        <g transform="translate({legendaUnaRiga ? xVoci[i] : 2} {legendaUnaRiga ? 0 : i * 20})">
          <rect class="tono t{voce.tono}" x="0" y="2" width="14" height="14" />
          <text class="legenda" x="22" y="13">{voce.nome}</text>
        </g>
      {/each}
    {/if}

    <!-- Linea sottile fra le partite e le barre di riferimento -->
    {#if ySeparatore != null}
      <line class="separatore" x1="0" x2={w} y1={ySeparatore} y2={ySeparatore} />
    {/if}

    {#each barre as b, i (b.key)}
      {@const y = posizioni[i]}
      {@const y0 = etichettaSopra ? y + 22 : y}
      {#if etichettaSopra}
        <text class="nome" x="2" y={y + 14}>{b.label}</text>
      {:else}
        <text class="nome" class:rif={b.riferimento} x="2" y={y + altezzaBarra / 2 - 2}>{b.label}</text>
        {#if b.sub}
          <text class="sub" x="2" y={y + altezzaBarra / 2 + 12}>{b.sub}</text>
        {/if}
      {/if}

      {@const segs = segmenti(b)}
      {@const fuori = nomiFuori(segs)}
      {#each segs as s (s.nome)}
        {@const pct = `${num(s.value, b.decimali ?? 0)}%`}
        {@const conteggio = s.count != null ? `${s.count}/${b.totale}` : ''}
        <!-- I segmenti a larghezza zero (per esempio Fritz 0%) non si disegnano -->
        {#if s.larghezza > 0}
          <rect class="tono t{s.tono}" x={s.x} y={y0} width={s.larghezza} height={altezzaBarra} />
          <!-- Testo dentro il segmento: nome, percentuale, conteggio -->
          {#if nomiDentro && sta(s.larghezza, s.nome)}
            <text class="dentro t{s.tono}" x={s.x + s.larghezza / 2} y={y0 + altezzaBarra / 2 + 4 - interlinea} text-anchor="middle">{s.nome}</text>
          {:else if nomiDentro}
            <!-- Segmento stretto: il nome sta sotto la barra -->
            <text class="fuori" x={fuori.get(s.nome)} y={y0 + altezzaBarra + 15} text-anchor="end">{s.nome}</text>
          {/if}
          {#if s.larghezza >= larghezzaTesto(pct) + 2}
            <text
              class="dentro forte t{s.tono}"
              x={s.x + s.larghezza / 2}
              y={y0 + altezzaBarra / 2 + 4}
              text-anchor="middle">{pct}</text>
          {/if}
          {#if nomiDentro && conteggio && sta(s.larghezza, conteggio)}
            <text class="dentro t{s.tono}" x={s.x + s.larghezza / 2} y={y0 + altezzaBarra / 2 + 4 + interlinea} text-anchor="middle">{conteggio}</text>
          {/if}
        {/if}
      {/each}
      <!-- Filetto uniforme attorno a TUTTA la barra: stacca il tono chiaro dal fondo -->
      <rect class="contorno" x={sinistra + 0.5} y={y0 + 0.5} width={Math.max(larghezzaBarra - 1, 0)} height={altezzaBarra - 1} />
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

  /* Tre toni dalla scala sequenziale del design system. Tutti con lo stesso
     trattamento: un separatore bianco sottile fra i segmenti. */
  .tono {
    stroke: var(--color-white);
    stroke-width: 1px;
  }

  .tono.t1 {
    fill: var(--seq-1);
  }

  .tono.t3 {
    fill: var(--seq-3);
  }

  .tono.t5 {
    fill: var(--seq-5);
  }

  /* Contorno della barra intera (uguale per tutti i toni) */
  .contorno {
    fill: none;
    stroke: var(--seq-3);
    stroke-width: 1px;
  }

  .separatore {
    stroke: var(--color-rule);
    stroke-width: 1px;
  }

  /* Colore del testo scritto sopra ogni tono (contrasto sopra 4.5:1) */
  .dentro {
    fill: var(--color-ink);
  }

  .dentro.t5 {
    fill: var(--color-white);
  }

  .dentro.forte {
    font-weight: var(--weight-bold);
  }

  .fuori {
    fill: var(--color-ink);
  }

  .legenda {
    fill: var(--color-ink);
  }

  .nome {
    fill: var(--color-ink);
    font-family: var(--font-display);
    font-size: var(--type-chart-sub-size);
  }

  .nome.rif {
    font-style: italic;
  }

  .sub {
    fill: var(--color-muted);
  }
</style>
