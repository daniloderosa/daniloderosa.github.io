<script>
  // ARTICOLO "Come Musetti ha vinto il torneo 250 di Lione" / "How Musetti won
  // the ATP 250 in Lyon": un solo componente per le due lingue. Le due rotte
  //   /articles/musetti-lione/      (inglese)
  //   /it/articoli/musetti-lione/   (italiano)
  // sono due file sottili che lo chiamano con lang="en" o lang="it".
  //
  // La pagina e fatta a schede: titolo e sottotitolo, poi cinque linguette
  // (una per blocco). In ogni scheda il grafico sta a sinistra e il
  // testo a destra. La metodologia e in un pop-up, aperto dalla scritta
  // "Metodologia" / "Methodology" in basso a sinistra.
  //
  // DOVE METTERE LE MANI
  //   testi.it.js, testi.en.js   tutto il testo dell'articolo, nelle due lingue
  //   etichette.js               le piccole scritte dei grafici, nelle due lingue
  //   dati.json                  i numeri (copia del pacchetto dati dell'articolo)
  //   grafici.js                 come i numeri diventano righe per i grafici
  //   componenti/                i grafici
  import ArticleShell from '$lib/components/ArticleShell.svelte';
  import ChartFrame from '$lib/components/ChartFrame.svelte';
  import Schede from '$lib/components/Schede.svelte';
  import MetodoDialog from '$lib/components/MetodoDialog.svelte';
  import Dumbbell from './componenti/Dumbbell.svelte';
  import BarreImpilate from './componenti/BarreImpilate.svelte';
  import BarreImpatto from './componenti/BarreImpatto.svelte';

  import * as testiIt from './testi.it.js';
  import * as testiEn from './testi.en.js';
  import { etichette } from './etichette.js';
  import { creaGrafici } from './grafici.js';

  /** @type {{ lang: 'it' | 'en' }} */
  let { lang } = $props();

  // Testi, etichette e dati nella lingua della pagina
  const testi = $derived(lang === 'it' ? testiIt : testiEn);
  const meta = $derived(testi.meta);
  const schede = $derived(testi.schede);
  const fonte = $derived(testi.fonte);
  const notaDati = $derived(testi.notaDati);
  const testiGrafici = $derived(testi.grafici);
  const E = $derived(etichette[lang]);
  const { a1, a3, a4, b1, b3 } = $derived(creaGrafici(lang));
</script>

<ArticleShell
  {lang}
  title={meta.titoloPagina}
  description={meta.descrizione}
  page="musettiLione"
  image={meta.immagine}
  imageAlt={meta.immagineAlt}
  schermata
>
  {#snippet footer()}
    <MetodoDialog etichetta={E.metodologia} titolo={notaDati.titolo} voci={notaDati.voci} {lang} />
  {/snippet}

  <header class="testata">
    <h1 class="display">{meta.titolo}</h1>
    <p class="sottotitolo">{meta.sottotitolo}</p>
  </header>

  <Schede etichette={schede.map((s) => s.etichetta)} nome={E.capitoli}>
    {#snippet pannello(i)}
      {@const blocco = schede[i]}
      <div class="scheda">
        <!-- Testo (a destra da 900px, senza scorrimento): in alto il "callout" col
             numero guida; i paragrafi stanno al centro dello spazio che resta. -->
        <div class="testo">
          <div class="callout">
            <p class="cifra">{blocco.numero.cifra}</p>
            <p class="cifra-frase">{blocco.numero.frase}</p>
          </div>
          <div class="paragrafi">
            {#each blocco.passi as passo (passo.testo)}
              <p class="paragrafo">
                {#if passo.tag}<span class="tag">{passo.tag}</span>{/if}
                {passo.testo}
              </p>
            {/each}
          </div>
        </div>

        <!-- Grafico (a sinistra da 900px; nel DOM viene dopo il testo, per l'ordine di lettura). -->
        <div class="figura" role="region" aria-label="{E.grafico}: {blocco.etichetta}">
          {#if i === 0}
            <ChartFrame title={testiGrafici.A1.titolo} subtitle={testiGrafici.A1.sottotitolo} summary={a1.summary} source={fonte} {lang} tabella={a1.tabella}>
              <Dumbbell righe={a1.righe} riferimenti={a1.riferimenti} domain={a1.domain} ticks={a1.ticks} ui={E} />
            </ChartFrame>
          {:else if i === 1}
            <ChartFrame title={testiGrafici.A3.titolo} subtitle={testiGrafici.A3.sottotitolo} summary={a3.summary} source={fonte} {lang} tabella={a3.tabella} note={testiGrafici.A3.nota}>
              <BarreImpilate barre={a3.barre} nomiDentro etichettaSopra {lang} />
            </ChartFrame>
          {:else if i === 2}
            <ChartFrame title={testiGrafici.A4.titolo} subtitle={testiGrafici.A4.sottotitolo} summary={a4.summary} source={fonte} {lang} tabella={a4.tabella}>
              <BarreImpilate barre={a4.barre} legenda={a4.legenda} {lang} />
            </ChartFrame>
          {:else if i === 3}
            <ChartFrame title={testiGrafici.B1.titolo} subtitle={testiGrafici.B1.sottotitolo} summary={b1.summary} source={fonte} {lang} tabella={b1.tabella}>
              <Dumbbell righe={b1.righe} riferimenti={b1.riferimenti} domain={b1.domain} ticks={b1.ticks} ui={E} />
            </ChartFrame>
          {:else}
            <ChartFrame title={testiGrafici.B3.titolo} subtitle={testiGrafici.B3.sottotitolo} summary={b3.summary} source={fonte} {lang} tabella={b3.tabella} note={testiGrafici.B3.nota}>
              <BarreImpatto righe={b3.righe} riferimenti={b3.riferimenti} domain={b3.domain} ticks={b3.ticks} ui={E} {lang} />
            </ChartFrame>
          {/if}
        </div>
      </div>
    {/snippet}
  </Schede>
</ArticleShell>

<style>
  /* Misure dei caratteri: quelle del sito di riferimento (Funafuti), espresse
     con i token del design system piu vicini. */
  .testata {
    margin-bottom: var(--space-3);
  }

  .testata h1 {
    margin: 0;
    font-size: var(--type-index-m);
    line-height: var(--type-index-line-m);
  }

  .sottotitolo {
    margin: var(--space-2) 0 0;
    max-width: 128ch;
    font-family: var(--font-text);
    font-style: italic;
    font-size: var(--type-small);
    line-height: var(--type-small-line);
    color: var(--fg-2);
  }

  /* Una scheda: su mobile grafico e testo impilati */
  .scheda {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'figura'
      'testo';
    gap: var(--space-5);
    padding-top: var(--space-4);
  }

  .figura {
    grid-area: figura;
    min-width: 0;
  }

  .figura :global(.frame) {
    margin: 0;
  }

  .testo {
    grid-area: testo;
    min-width: 0;
  }

  /* Callout in alto a destra: numero guida e la sua frase in corsivo */
  .callout {
    padding: var(--space-3) var(--space-4);
    border-left: var(--space-1) solid var(--acc);
    background: var(--hatch-2);
  }

  .cifra {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-display-m);
    line-height: var(--type-display-line-m);
    letter-spacing: var(--tracking-display);
    color: var(--acc);
  }

  .cifra-frase {
    margin: var(--space-2) 0 0;
    font-family: var(--font-text);
    font-style: italic;
    font-size: var(--type-small);
    line-height: var(--type-small-line);
    color: var(--fg-2);
  }

  .paragrafi {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  .paragrafo {
    margin: 0;
    font-family: var(--font-text);
    font-size: var(--type-body-m);
    line-height: var(--type-body-line-m);
    color: var(--fg);
  }

  /* Etichetta "IPOTESI" / "STIMA": dice che quel paragrafo non e un dato. */
  .tag {
    display: inline-block;
    margin-right: var(--space-2);
    padding: 0 var(--space-2);
    border: var(--border-thin);
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-label);
    color: var(--acc);
  }

  /* Desktop, una schermata: grafico a sinistra, testo a destra (colonna di
     testo larga al massimo 38rem, come nel riferimento). */
  @media (min-width: 900px) and (min-height: 700px) {
    .testata h1 {
      font-size: var(--type-display-m);
      line-height: var(--type-display-line-m);
    }

    .sottotitolo {
      max-width: none;
      font-size: var(--type-lead-m);
      line-height: var(--type-lead-line-m);
    }

    .scheda {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr);
      grid-template-areas: 'figura testo';
      gap: clamp(var(--space-4), 3vw, var(--space-7));
      height: 100%;
      padding-top: var(--space-4);
    }

    /* Il grafico riempie tutta l'altezza della scheda; lo scorrimento serve
       solo da rete di sicurezza. */
    .figura {
      min-height: 0;
      overflow-y: auto;
    }

    .figura :global(.frame) {
      height: 100%;
    }

    /* Callout e paragrafi nello spazio della colonna. Paragrafi al centro
       verticale; il callout sta a meta strada fra il bordo alto e l'inizio
       del testo. Le righe vuote (1fr, 1fr, 2fr) dividono lo spazio libero in
       un quarto sopra il callout, un quarto fra callout e testo, meta sotto. */
    .testo {
      display: grid;
      grid-template-rows: 1fr auto 1fr auto 2fr;
      min-height: 0;
    }

    .callout {
      grid-row: 2;
    }

    .paragrafi {
      grid-row: 4;
      margin-top: 0;
    }

    .cifra {
      font-size: var(--type-index);
      line-height: var(--type-index-line);
    }
  }

  /* Finestre basse (portatili con la barra del browser): un corpo del testo
     un po' piu piccolo, cosi il testo continua a starci senza scorrere. */
  @media (min-width: 900px) and (min-height: 700px) and (max-height: 859px) {
    .paragrafo {
      font-size: var(--type-small);
      line-height: var(--type-small-line);
    }

    .cifra {
      font-size: var(--type-index-m);
      line-height: var(--type-index-line-m);
    }
  }
</style>
