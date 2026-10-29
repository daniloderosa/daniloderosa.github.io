<script>
  import TabellaDati from './TabellaDati.svelte';
  import PulsanteIcona from './PulsanteIcona.svelte';
  import { scaricaGrafico, nomeFileDaTitolo } from '$lib/scaricaGrafico.js';
  import { site } from '$lib/data/site.js';

  /**
   * CONTENITORE CONDIVISO DEI GRAFICI.
   * Ogni grafico del sito passa da qui: garantisce che titolo, sottotitolo,
   * fonte e riassunto testuale ci siano sempre e stiano sempre nello stesso
   * posto. Il grafico vero e proprio si passa dentro (snippet `children`).
   *
   * title     titolo del grafico: dice cosa si vede
   * subtitle  come si legge il grafico
   * summary   riassunto testuale, obbligatorio: e cio che leggono i lettori
   *           di schermo prima del disegno
   * source    riga della fonte dei dati
   * note      nota metodologica. Si mette SOLO se i dati sono stati
   *           elaborati; se sono usati come sono, si lascia vuota.
   * tabella   (facoltativo ma consigliato) { intestazioni, righe, nota }: i
   *           numeri del grafico in forma di tabella, apribile dal pulsante
   *           "Dati in tabella" (accessibile da lettore di schermo e tastiera)
   * lang      'it' o 'en': lingua dei pulsanti (tabella, download) e degli avvisi
   *
   * Esempio d'uso:
   *   <ChartFrame title="..." subtitle="..." summary="..." source="...">
   *     <svg ...>...</svg>
   *   </ChartFrame>
   */
  let { title, subtitle, summary, source, note = null, tabella = null, lang = 'it', children } = $props();

  // Scritte dei pulsanti e degli avvisi nella lingua della pagina
  const lingua = $derived(lang === 'en' ? 'en' : 'it');
  const ui = $derived(site[lingua].chart);

  // Prefisso unico per gli id: serve a collegare titolo e sottotitolo al
  // grafico anche quando nella pagina ci sono piu ChartFrame.
  const uid = $props.id();

  // Download dell'immagine del grafico (PNG). Il riquadro intero viene
  // "fotografato" da scaricaGrafico, tranne gli elementi marcati
  // data-escludi-immagine (le due icone).
  /** @type {HTMLElement | undefined} */
  let figura = $state();
  let occupato = $state(false);
  let errore = $state('');

  async function scarica() {
    if (!figura || occupato) return;
    occupato = true;
    errore = '';
    try {
      await scaricaGrafico(figura, nomeFileDaTitolo(title));
    } catch (e) {
      console.error(e);
      errore = ui.imageError;
    } finally {
      occupato = false;
    }
  }
</script>

<figure class="frame" aria-labelledby="{uid}-titolo" bind:this={figura}>
  <!-- Il titolo e un paragrafo, non un'intestazione: dentro una scheda il
       grafico viene prima del titolo della scheda (h2) e un h3 darebbe un
       salto di livello. Il nome del grafico lo prende da qui via aria-labelledby. -->
  <p class="title" id="{uid}-titolo">{title}</p>
  <p class="subtitle" id="{uid}-sottotitolo">{subtitle}</p>

  <!-- Il gruppo ha come nome il titolo e come descrizione il sottotitolo
       (come si legge il grafico). Il riassunto testuale viene letto per
       primo, dentro il gruppo, cosi chi non vede il disegno ha subito i
       dati a parole. I testi statici dentro l'SVG (assi, etichette) sono
       marcati aria-hidden dal grafico stesso, per non ripetere il riassunto. -->
  <div class="plot" role="group" aria-labelledby="{uid}-titolo" aria-describedby="{uid}-sottotitolo">
    <p class="sr-only">{summary}</p>
    {@render children()}
  </div>

  <figcaption class="foot">
    <!-- Fonte e nota a sinistra; a destra, sulla stessa riga, le icone. -->
    <div class="testi">
      <span class="source">{source}</span>
      {#if note}
        <span class="note">{note}</span>
      {/if}
    </div>
    <!-- data-escludi-immagine: le icone non compaiono nell'immagine scaricata -->
    <div class="azioni" data-escludi-immagine>
      {#if tabella}
        <TabellaDati titolo={title} intestazioni={tabella.intestazioni} righe={tabella.righe} nota={tabella.nota} lang={lingua} />
      {/if}
      <PulsanteIcona etichetta={ui.download} onclick={scarica} {occupato}>
        <!-- Icona del download: freccia verso un vassoio -->
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.5v10.5M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14" />
        </svg>
      </PulsanteIcona>
    </div>
    <!-- Avviso per i lettori di schermo se il download non riesce -->
    <span class="sr-only" role="status">{errore}</span>
  </figcaption>
</figure>

<style>
  .frame {
    margin: var(--space-6) 0;
    background: var(--color-white);
    border: var(--chart-border);
    padding: var(--space-4);
    /* Se il contenitore ha un'altezza definita (desktop, scheda a schermata
       intera) il riquadro la riempie: titolo in alto, grafico che cresce,
       fonte in fondo. Senza altezza definita (mobile) height:100% non conta
       e il riquadro resta alto quanto il suo contenuto. */
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-bold);
    letter-spacing: var(--tracking-tight);
    font-size: var(--type-chart-title-m);
    line-height: var(--type-chart-title-line-m);
    color: var(--color-ink);
  }

  .subtitle {
    margin: var(--space-2) 0 0;
    font-family: var(--font-display);
    font-weight: var(--weight-regular);
    font-size: var(--type-chart-sub-size);
    line-height: var(--type-chart-sub-line);
    color: var(--color-muted);
  }

  .plot {
    position: relative; /* tiene dentro il riassunto .sr-only (position: absolute) */
    /* Il grafico si misura sul contenitore: la sua larghezza non deve spingere
       il contenitore. Senza questo, sotto i 360px il grafico (che parte da 320px)
       fa uscire la pagina dallo schermo. */
    contain: inline-size;
    margin-top: var(--space-3);
    /* Prende lo spazio che resta. Niente min-height:0 di proposito: se il
       grafico non ci sta nemmeno alla sua altezza naturale, il riquadro
       trabocca (e il contenitore scorre) invece di sovrapporre la fonte. */
    flex: 1 1 auto;
  }

  /* Il riassunto usa la classe .sr-only di base.css: sta nel flusso ma non
     a schermo, ed e cio che leggono i lettori di schermo prima del disegno. */

  /* Riga in fondo al riquadro: testi a sinistra, icone a destra */
  .foot {
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: var(--chart-hairline);
    flex: none;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-3);
    font-family: var(--font-display);
    font-weight: var(--weight-regular);
    font-size: var(--type-source-size);
    line-height: var(--type-source-line);
    color: var(--color-faint);
  }

  .testi {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  /* Le icone hanno un'area di 44px ma non rendono piu alta la riga: i margini
     negativi "restituiscono" l'altezza in eccesso, quindi il riquadro resta
     compatto com'era (l'area sporge solo di poco sopra e sotto). */
  .azioni {
    flex: none;
    display: flex;
    align-items: center;
    margin-block: calc((var(--type-source-line) - var(--tap-min)) / 2);
  }

  @media (min-width: 700px) {
    .frame {
      padding: var(--space-5) var(--space-6);
    }

    .title {
      font-size: var(--type-chart-title);
      line-height: var(--type-chart-title-line);
    }
  }

  /* Schermo largo ma basso (pagina a una schermata): riquadro piu compatto,
     per lasciare piu altezza al disegno. */
  @media (min-width: 900px) and (min-height: 700px) and (max-height: 840px) {
    .frame {
      padding: var(--space-3) var(--space-4);
    }

    .title {
      font-size: var(--type-chart-title-m);
      line-height: var(--type-chart-title-line-m);
    }

    .subtitle {
      margin-top: var(--space-1);
    }

    .plot {
      margin-top: var(--space-2);
    }

    .foot {
      margin-top: var(--space-1);
      padding-top: var(--space-1);
    }

    .testi {
      gap: 0;
    }
  }
</style>
