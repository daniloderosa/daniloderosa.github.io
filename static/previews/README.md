# Anteprime dei progetti

Qui vanno le immagini e i video che compaiono nelle schede della pagina Progetti.

Per ogni progetto, in `src/lib/data/projects.js`:

- **Anteprima animata**: un file MP4 (`video`) piu il suo primo fotogramma in PNG
  (`poster`). Il video parte da solo, muto e in loop, solo quando la scheda e
  visibile. Chi ha attivato "riduci movimento" nel sistema vede solo il poster.
- **Anteprima statica**: un solo PNG o JPG (`image`).
- Nessuna delle due: si vede un riquadro a righe con il testo alternativo.

Le immagini non vengono ritagliate: qualunque proporzione va bene, ma 16:10
(per esempio 1280 x 800) riempie il riquadro senza bordi bianchi.

Il testo alternativo (`alt`) e obbligatorio, nelle due lingue.
Le GIF non vanno usate: pesano dieci volte tanto e non si possono fermare.
