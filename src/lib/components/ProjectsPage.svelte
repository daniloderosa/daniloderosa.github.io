<script>
  import InnerPage from './InnerPage.svelte';
  import ProjectCard from './ProjectCard.svelte';
  import { projects, projectsPage } from '$lib/data/projects.js';
  import { path } from '$lib/data/routes.js';

  /**
   * Pagina "Progetti": elenco dei progetti.
   * Testi e progetti stanno in src/lib/data/projects.js.
   *
   * @type {{ lang: 'en' | 'it' }}
   */
  let { lang } = $props();

  const t = $derived(projectsPage[lang]);

  // Arco degli anni ("2025" oppure "2025 — 2026"), calcolato dai progetti.
  const years = projects.map((p) => p.year);
  const first = Math.min(...years);
  const lastYear = Math.max(...years);
  const span = first === lastYear ? `${first}` : `${first} — ${lastYear}`;
</script>

<InnerPage {lang} page="projects" title={t.title} description={t.description}>
  <div class="intro">
    <div>
      <h1 class="display">{t.heading}</h1>
      <p class="lead">{t.lead}</p>
    </div>
    <p class="counter">
      <span><strong>{projects.length}</strong> {t.counter}</span>
      <span>{span}</span>
    </p>
  </div>

  <div class="grid">
    {#each projects as project (project.id)}
      <ProjectCard
        item={project[lang]}
        year={project.year}
        badge={t.categories[project.category === 'tennis' ? 'tennis' : 'other']}
        primary={project.category === 'tennis'}
        image={project.image}
        video={project.video}
        poster={project.poster}
        external={project.external}
      />
    {/each}
  </div>

  <aside class="pitch">
    <div>
      <p class="pitch-title">{t.pitch.title}</p>
      <p class="pitch-text">{t.pitch.text}</p>
    </div>
    <a class="button pitch-button" href={path('contact', lang)}>{t.pitch.cta} <span aria-hidden="true">→</span></a>
  </aside>
</InnerPage>

<style>
  .intro {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-5) var(--space-7);
  }

  .counter {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-label-s);
    letter-spacing: var(--tracking-label);
    color: var(--fg-2);
  }

  .counter strong {
    color: var(--acc);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-7) var(--space-6);
    margin-top: var(--space-6);
  }

  .pitch {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5) var(--space-7);
    margin-top: var(--space-7);
    padding: var(--space-5);
    border: var(--line-thin) dashed var(--rule-2);
  }

  .pitch-button {
    flex: none;
  }

  .pitch-title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-box);
    line-height: var(--type-box-line);
    color: var(--fg);
  }

  .pitch-text {
    margin: var(--space-1) 0 0;
    font-family: var(--font-text);
    font-size: var(--type-small);
    line-height: var(--type-small-line);
    color: var(--fg-2);
  }

  @media (min-width: 700px) {
    .counter {
      text-align: right;
    }

    .grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .pitch {
      padding: var(--space-6);
    }
  }

  /* Tre anteprime per riga, nella stessa larghezza di Chi sono e Contatti. */
  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
