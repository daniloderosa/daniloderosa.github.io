# daniloderosa.github.io

Sito personale di Danilo De Rosa: portfolio e archivio di analisi tennistiche
basate sui dati. https://daniloderosa.github.io

## Come si lavora

```
npm install        # una volta sola, dopo aver clonato
npm run dev        # sviluppo locale su http://localhost:5173
npm run build      # build statica in build/
npm run preview    # anteprima della build
npm run check      # controllo tipi e sintassi Svelte
```

Il deploy e automatico: ogni push su `main` fa partire
`.github/workflows/deploy.yml`, che pubblica su GitHub Pages.

## Dove mettere le mani

| Cosa vuoi cambiare | File |
| --- | --- |
| Colori, caratteri, spaziature | `src/lib/styles/tokens.css` |
| Nome, motto, schede della home, menu, profili, email | `src/lib/data/site.js` |
| Pagina Progetti (testi ed elenco dei progetti) | `src/lib/data/projects.js` |
| Pagina Chi sono | `src/lib/data/about.js` |
| Pagina Contatti | `src/lib/data/contact.js` |
| Indirizzi delle pagine nelle due lingue | `src/lib/data/routes.js` |
| Anteprime delle schede | `static/previews/` |
| Immagini di anteprima social | `static/og-en.png`, `static/og-it.png` |

## Licenze

- Codice: MIT.
- Contenuti (testi e grafici): CC BY.
- Dati: dataset pubblici di Jeff Sackmann (Tennis Abstract, Match Charting
  Project), CC BY-NC-SA. Vanno sempre citati.
