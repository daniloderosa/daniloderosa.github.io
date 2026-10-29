<script>
  // I token entrano una volta sola, qui: valgono per tutto il sito.
  import '$lib/styles/tokens.css';
  import '$lib/styles/base.css';
  import { page } from '$app/state';

  let { children } = $props();

  // Lingua della pagina per lettori di schermo e correttori. Al primo
  // caricamento la scrive il server (hooks.server.js); quando si cambia pagina
  // senza ricaricare (per esempio col selettore lingua) la aggiorna questo effetto.
  $effect(() => {
    document.documentElement.lang = page.url.pathname.startsWith('/it') ? 'it' : 'en';
  });
</script>

{@render children()}
