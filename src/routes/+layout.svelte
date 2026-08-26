<script>
  // I token entrano una volta sola, qui: valgono per tutto il sito.
  import '$lib/styles/tokens.css';
  import '$lib/styles/base.css';

  let { children } = $props();
</script>

{@render children()}
