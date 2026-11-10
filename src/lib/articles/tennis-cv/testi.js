/**
 * Testi della pagina "Computer vision sul tennis", nelle due lingue.
 * Stessa forma per it ed en: quando si cambia un testo in una lingua,
 * va cambiato anche nell'altra.
 *
 * I grafici sono immagini (PNG in static/articles/tennis-cv/) con i testi in
 * inglese; titolo e lettura sono ripetuti qui sotto, nella lingua della pagina.
 */

export const testi = {
  it: {
    meta: {
      titoloPagina: "Computer vision sul tennis: la finale di Parigi 2026 - Danilo De Rosa",
      descrizione:
        "Campo, palla e giocatori tracciati da un video televisivo, con un normale processore, senza scheda grafica: colpi, rimbalzi e spostamenti della finale Alcaraz - Shelton.",
    },
    occhiello: "COMPUTER VISION · PARIGI 2026",
    avviso:
      "Questo è un test: un esperimento per provare le tecniche di computer vision. I risultati non hanno alcun valore statistico né informativo.",
    titolo: "Dal video al campo: Alcaraz e Shelton tracciati frame per frame",
    sottotitolo:
      "Un esperimento di computer vision sugli highlights della finale del Masters 1000 di Parigi: dove sono il campo, la palla e i due giocatori in ogni fotogramma, e cosa se ne ricava. Tutto su un processore comune, senza scheda grafica e senza addestrare modelli.",
    scambio: {
      titolo: "Uno scambio, visto due volte",
      testo:
        "A sinistra il video della televisione con le annotazioni della pipeline: righe del campo, scia della palla, scheletro dei giocatori e tipo di colpo. A destra lo stesso scambio riportato sul campo visto dall'alto: le linee sono gli spostamenti dei piedi, i punti gialli i rimbalzi.",
      legenda: [
        { colore: "#eb6834", testo: "Alcaraz" },
        { colore: "#2a78d6", testo: "Shelton" },
        { colore: "#d9f24e", testo: "rimbalzo", punto: true },
      ],
      altVideo:
        "Video dello scambio con annotazioni: righe del campo sovrapposte, scia gialla della palla, scheletri colorati dei due giocatori ed etichette dritto e rovescio sui colpi.",
      altMappa:
        "Animazione del campo visto dall'alto: due tracce colorate seguono gli spostamenti dei giocatori dietro le linee di fondo e sei punti gialli segnano i rimbalzi.",
      fonteVideo: "Immagini: highlights ufficiali Tennis TV. Annotazioni: mie elaborazioni.",
    },
    metodo: {
      titolo: "Come funziona",
      passi: [
        "Il montaggio viene tagliato in inquadrature e si tengono solo quelle dalla camera alta dietro la linea di fondo.",
        "Le righe bianche del campo danno l'omografia: la trasformazione che converte ogni pixel del campo in metri.",
        "Una rete neurale addestrata su video di tennis trova la palla guardando tre fotogrammi alla volta.",
        "Un modello di stima della posa trova i giocatori e 17 punti del corpo; i pantaloncini gialli dicono chi è Alcaraz.",
        "Colpi e rimbalzi si ricavano dalla geometria della traiettoria: cambi bruschi di velocità vicino al giocatore, \"spigoli\" quando la palla tocca terra.",
      ],
    },
    grafici: [
      {
        id: "bounces",
        titolo: "Dove rimbalzano i colpi",
        testo:
          "Il rimbalzo è l'unico istante in cui la palla è sicuramente a terra, quindi l'unico in cui il video può dire dove si trova in metri. Il campo è ruotato in modo che chi colpisce stia sempre in basso.",
        alt: "Due mezzi campi visti dall'alto, uno per giocatore, con i punti di rimbalzo dei loro colpi: la gran parte cade nella metà avversaria tra la linea del servizio e quella di fondo; 2 rimbalzi di Alcaraz e 9 di Shelton risultano fuori dalle righe.",
        larghezza: 1440,
        altezza: 1056,
      },
      {
        id: "positions",
        titolo: "Dove si muovono i giocatori",
        testo:
          "La posizione dei piedi in ogni fotogramma, riportata sulla propria metà campo. Entrambi giocano quasi sempre dietro la linea di fondo, a poca distanza dal centro: in questi scambi la rete si vede di rado.",
        alt: "Due mappe di calore sulla propria metà campo: per entrambi i giocatori la zona più intensa è dietro la linea di fondo, vicino al centro.",
        larghezza: 1440,
        altezza: 896,
      },
      {
        id: "shot_speed",
        titolo: "Quanto vanno veloci i colpi",
        testo:
          "Velocità media tra impatto e rimbalzo, non quella di picco mostrata in TV: vale circa l'80-85% di quel valore. Servizio mediano: 153 km/h Alcaraz, 168 km/h Shelton.",
        alt: "Grafico a punti della velocità dei colpi per tipo e giocatore. Mediane: servizio 153 km/h Alcaraz e 168 Shelton, dritto 91 e 97, rovescio 89 e 94.",
        larghezza: 1280,
        altezza: 672,
      },
    ],
    noteGrafici: "Grafici in inglese. Dati: mie elaborazioni sul video degli highlights.",
  },
  en: {
    meta: {
      titoloPagina: "Computer vision on tennis: the Paris 2026 final - Danilo De Rosa",
      descrizione:
        "Court, ball and players tracked from a TV broadcast on an ordinary processor, with no graphics card: shots, bounces and movement in the Alcaraz - Shelton final.",
    },
    occhiello: "COMPUTER VISION · PARIS 2026",
    avviso:
      "This is a test: an experiment to try out computer vision techniques. The results have no statistical or informative value.",
    titolo: "From broadcast to court: Alcaraz and Shelton tracked frame by frame",
    sottotitolo:
      "A computer vision experiment on the highlights of the Paris Masters 1000 final: where the court, the ball and both players are in every frame, and what that tells us. All of it on an ordinary processor, with no graphics card and no model training.",
    scambio: {
      titolo: "One rally, seen twice",
      testo:
        "On the left, the broadcast with the pipeline's annotations: court lines, ball trail, player skeletons and shot type. On the right, the same rally mapped onto the court from above: the lines are the players' footsteps, the yellow dots the bounces.",
      legenda: [
        { colore: "#eb6834", testo: "Alcaraz" },
        { colore: "#2a78d6", testo: "Shelton" },
        { colore: "#d9f24e", testo: "bounce", punto: true },
      ],
      altVideo:
        "Video of the rally with annotations: court lines overlaid, a yellow ball trail, coloured skeletons on both players and forehand and backhand labels on the shots.",
      altMappa:
        "Animation of the court from above: two coloured trails follow the players behind the baselines and six yellow dots mark the bounces.",
      fonteVideo: "Footage: official Tennis TV highlights. Annotations: my own processing.",
    },
    metodo: {
      titolo: "How it works",
      passi: [
        "The edit is cut into shots, and only those from the high camera behind the baseline are kept.",
        "The white court lines give the homography: the transformation that turns every court pixel into metres.",
        "A neural network trained on tennis videos finds the ball by looking at three frames at a time.",
        "A pose estimation model finds the players and 17 body points; the yellow shorts tell which one is Alcaraz.",
        "Shots and bounces come from the geometry of the trajectory: sharp speed changes near a player, \"kinks\" when the ball hits the ground.",
      ],
    },
    grafici: [
      {
        id: "bounces",
        titolo: "Where the shots land",
        testo:
          "The bounce is the only moment the ball is certainly on the ground, so the only one where the video can say where it is in metres. The court is rotated so the hitter is always at the bottom.",
        alt: "Two half courts seen from above, one per player, with the bounce points of their shots: most land in the opponent's half between the service line and the baseline; 2 of Alcaraz's bounces and 9 of Shelton's fall outside the lines.",
        larghezza: 1440,
        altezza: 1056,
      },
      {
        id: "positions",
        titolo: "Where the players move",
        testo:
          "Feet position in every frame, mapped onto each player's own half. Both play almost always behind the baseline, not far from the centre: in these rallies the net is a rare sight.",
        alt: "Two heat maps on each player's own half: for both, the most intense area is behind the baseline, close to the centre.",
        larghezza: 1440,
        altezza: 896,
      },
      {
        id: "shot_speed",
        titolo: "How fast the shots are",
        testo:
          "Average speed between impact and bounce, not the peak speed shown on TV: it is about 80-85% of that value. Median serve: 153 km/h for Alcaraz, 168 km/h for Shelton.",
        alt: "Dot plot of shot speed by type and player. Medians: serve 153 km/h Alcaraz and 168 Shelton, forehand 91 and 97, backhand 89 and 94.",
        larghezza: 1280,
        altezza: 672,
      },
    ],
    noteGrafici: "Data: my own processing of the highlights video.",
  },
};
