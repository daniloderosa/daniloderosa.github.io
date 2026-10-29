<script>
  // ARTICOLO "Lione si gioca al secondo colpo" - versione italiana.
  // Indirizzo: /it/articoli/musetti-lione/
  //
  // La pagina e fatta a schede: titolo e sottotitolo, poi cinque linguette
  // (una per blocco). In ogni scheda il grafico sta a sinistra e il
  // testo a destra. La metodologia e in un pop-up, aperto dalla scritta "Metodologia"
  // in basso a sinistra.
  //
  // DOVE METTERE LE MANI
  //   testi.js      tutto il testo, i titoli dei grafici
  //   dati.json     i numeri (copia del pacchetto dati dell'articolo)
  //   grafici.js    come i numeri diventano righe per i grafici
  //   componenti/   i grafici
  import ArticleShell from '$lib/components/ArticleShell.svelte';
  import ChartFrame from '$lib/components/ChartFrame.svelte';
  import Schede from '$lib/components/Schede.svelte';
  import MetodoDialog from '$lib/components/MetodoDialog.svelte';
  import Dumbbell from './componenti/Dumbbell.svelte';
  import BarreImpilate from './componenti/BarreImpilate.svelte';
  import BarreImpatto from './componenti/BarreImpatto.svelte';

  import { meta, schede, fonte, notaDati, grafici as testiGrafici } from './testi.js';
  import { a1, a3, a4, b1, b3 } from './grafici.js';
</script>

<!-- noindex: la pagina non va indicizzata finche non e approvata e tradotta.
     Va tolto (riga sotto) quando l'articolo viene pubblicato nel portfolio. -->
<ArticleShell
  lang="it"
  title={meta.titoloPagina}
  description={meta.descrizione}
  href={meta.indirizzo}
  noindex
  schermata
>
  {#snippet footer()}
    <MetodoDialog etichetta="Metodologia" titolo={notaDati.titolo} voci={notaDati.voci} />
  {/snippet}

  <header class="testata">
    <h1 class="display">{meta.titolo}</h1>
    <p class="sottotitolo">{meta.sottotitolo}</p>
  </header>

  <Schede etichette={schede.map((s) => s.etichetta)} nome="Capitoli dell'articolo">
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
        <div class="figura" role="region" aria-label="Grafico: {blocco.etichetta}">
          {#if i === 0}
            <ChartFrame title={testiGrafici.A1.titolo} subtitle={testiGrafici.A1.sottotitolo} summary={a1.summary} source={fonte} tabella={a1.tabella}>
              <Dumbbell righe={a1.righe} riferimenti={a1.riferimenti} domain={a1.domain} ticks={a1.ticks} />
            </ChartFrame>
          {:else if i === 1}
            <ChartFrame title={testiGrafici.A3.titolo} subtitle={testiGrafici.A3.sottotitolo} summary={a3.summary} source={fonte} tabella={a3.tabella} note={testiGrafici.A3.nota}>
              <BarreImpilate barre={a3.barre} nomiDentro etichettaSopra />
            </ChartFrame>
          {:else if i === 2}
            <ChartFrame title={testiGrafici.A4.titolo} subtitle={testiGrafici.A4.sottotitolo} summary={a4.summary} source={fonte} tabella={a4.tabella}>
              <BarreImpilate barre={a4.barre} legenda={a4.legenda} />
            </ChartFrame>
          {:else if i === 3}
            <ChartFrame title={testiGrafici.B1.titolo} subtitle={testiGrafici.B1.sottotitolo} summary={b1.summary} source={fonte} tabella={b1.tabella}>
              <Dumbbell righe={b1.righe} riferimenti={b1.riferimenti} domain={b1.domain} ticks={b1.ticks} />
            </ChartFrame>
          {:else}
            <ChartFrame title={testiGrafici.B3.titolo} subtitle={testiGrafici.B3.sottotitolo} summary={b3.summary} source={fonte} tabella={b3.tabella} note={testiGrafici.B3.nota}>
              <BarreImpatto righe={b3.righe} riferimenti={b3.riferimenti} domain={b3.domain} ticks={b3.ticks} />
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
