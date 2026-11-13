# ATP Finals Simulator: how it works

The playable game is in `static/finals-simulator/` (English page) and `static/it/finals-simulator/` (Italian page). This folder holds the engine, the tools that build and calibrate the player models, and the source of the 3D version. The game is bilingual: like the rest of the website, the English page sends visitors whose browser prefers Italian to the Italian page, and the language can be changed in the start menu before the first match. Each page has its own link preview image (`static/og-finals-simulator-en.png`, `static/og-finals-simulator-it.png`), because chat apps read one image per address.

---

## In short

Imagine a tennis match played with dice. Every time a player has to hit the ball, a loaded die is rolled: its faces don't all weigh the same, they weigh as much as that player's real matches say.

**Where the weights come from.** From 88 real hard-court matches played between September and November 2026 by the 8 players in the game. TennisViz tracks them shot by shot: for every shot we know where it was hit from, where it bounced, how fast it went and how it ended.

**The serve.** One die says whether the serve goes in. Another says whether it is an ace, whether the return fails to stay in play, or whether the rally starts. The faces change with the zone you pick: wide, body or T.

**The rally.** You pick the shot, for example a crosscourt forehand, and the die decides the outcome:
- positive: a winner, or it takes you into attack, or it puts your opponent in big trouble;
- neutral: the rally goes on unchanged;
- negative: an error, or it puts your opponent in attack, or it hands them a big advantage.

**The traffic light.** Whoever is in attack gets slightly better dice, whoever is on defence slightly worse ones. The advantage doesn't last forever: after a neutral shot it can fade away.

**Big trouble.** If your opponent's shot put you in big trouble, your next shot is almost always an error (92%), but never for sure. The same holds the other way round for a big advantage.

**Who is on the other side matters.** Against players who defend or return very well, your dice get slightly worse.

**The moment in the point matters.** After a second serve, for example, the server's third shot ends in an error more often than in a winner. The data say so, and the game follows them.

**How we know it works.** We replayed the 88 real matches on the computer thousands of times and checked that the same numbers come out: serve points won, winners, errors, rally length. Whenever something didn't match, we adjusted the weights and tried again.

Then came the harder test. We built the model without some of the matches and checked whether it still predicted them. It does: on average it is off by about one percentage point on serve points won.

---

## Technical explanation

### 1. Data

- **Source**: the TennisViz API (Courtside Advantage portal).
- **Matches**: 88 ATP main-draw matches on hard courts (46 indoor, 42 outdoor), from Tokyo to Paris-Bercy, September to November 2026.
- **Players**: 63, that is the 8 in the game plus 55 opponents.
- **Endpoints used**:
  - `point_by_point`: for every point the server, first or second serve, outcome, who ended it and with which stroke (`fh/bh/vol/ret × win/ue/fe`), rally length;
  - `hot_and_cold_plays`: every rally shot with contact point, bounce, speed, hot/neutral/cold class and reason;
  - `court_graphics`: serve direction and unreturned serves by zone, return placement by serve zone, the server's third shot;
  - `performance`: `serve_effectiveness`, `capitalisation` (conversion and steal), `balance_of_power`;
  - the player's averages over the last 52 weeks.

The raw data are not in the repository; the derived model is (`model.json`, `calib.json`).

### 2. Three data definitions to respect

Rebuilding the points brought out three conventions in the data. If you ignore them, winners and errors get counted twice.

1. **Rally length.** `rally_length` counts the shots that stayed in play: the missed shot is not counted, a double fault is 0, an ace 1, a missed return 1.
2. **Forced error.** The final unforced error is tagged `cold/error`. The final forced error is tagged `neutral`, with no reason, 95% of the time.
3. **The shot that sets up the end.** `opponent_error` and `opponent_winner` sit on the second-to-last shot. The next shot is an error or a winner 99% of the time.

`classify.mjs` reclassifies every shot based on how the point actually ends:
- the final shot is found by matching the `point_end` speed with the stroke family (forehand, backhand, volley), and it is found in 97% of the points;
- there are eight classes: `winner`, `in_attack`, `opponent_error`, `neutral`, `error` (unforced), `fe` (forced), `in_defence`, `opponent_winner`;
- on top of these come `x_err` and `x_win`: the final shots that follow an `opponent_error` or an `opponent_winner`. The engine generates them with the extreme phases (section 4), so they are removed from the play's "normal" frequencies.

### 3. Each player's model (`build.mjs`)

Every probability is estimated as a Bayesian mean pulled towards a prior:

$$\hat p = \frac{k + M\,p_0}{n + M}$$

where $k$ is the number of successes out of $n$ cases, $p_0$ the prior and $M$ its weight in pseudo-observations. The weights differ by parameter group:

| Group | Prior | M |
|---|---|---|
| Shot outcomes and frequencies, serve | Player's 52-week average | 10 |
| Outcomes by shot direction | Player's average on the same data | 30 |
| Return by direction | Player's average / court-graphics averages | 40 |
| Unforced share among errors (statistics) | All players' average | 10 |

The model contains:

- **Serve**, for first and second serve:
  - probability of going in, $p_{in}$;
  - zone usage (wide, body, T) per side, and share of unreturned serves per zone;
  - share of aces among the unreturned serves;
  - distribution of the state on the third shot (attack, neutral, defence, return winner), from `serve_effectiveness`.
- **Return**, per side and direction: usage, error rate, share of points won.
- **Rally shots**, for each of the 9 play types:
  - frequency, and weights by starting zone (where the player hits it from);
  - distribution of the landing zone;
  - outcomes by group $v = (v_{hot}, v_{neu}, v_{cold})$ and, within each group, by class;
  - outcomes by direction;
  - speed and spin, used only by the animation.
- **Opponent indices**, as observed over expected with a pseudo-count $C$:
  - defensive index $D = (\text{obs}+C)/(\text{exp}+C)$ on the hot and cold shots faced, with $C = 300$;
  - return index $R$ on unreturned serves, with $C = 100$.

### 4. The engine: a point as a chain of states (`engine.js`)

The state is made of:
- who is hitting and from which zone;
- who is leading the rally (traffic light: A, B or nobody);
- any extreme phase;
- the shot number within the point;
- first or second serve.

**Serve.** In zone $z$:
- the serve goes in with probability $p_{in}$;
- it goes unreturned with probability $u = \min(0.9;\ \text{unret}_z \cdot R_{ret})$;
- the ace has probability $u \cdot \text{aceShare}$;
- the rest of the unreturned serves becomes the probability of a return error, scaled by the chosen direction $d$: $p_{err}\cdot err_d/\overline{err}$.

**State after the return.** It comes from `serve_effectiveness`, tilted by the share of points won $w_d$ with that direction: attack $\times(1-w_d)/(1-\bar w)$, defence and return winner $\times w_d/\bar w$.

**Possible shots.** They start from the player's weights from the incoming zone, with these rules:
- a shot is possible if it accounts for at least 5% of the shots from that zone;
- on defence there is no inside-out and no drop shot;
- a volley is possible only after one's own serve, after one's own drop shot, after an opponent's volley, or after one's own shot that led to attack; never on defence;
- the server's third shot has a forehand corrector per side;
- every shot has a calibrated frequency corrector.

**Outcome of a shot** of type $p$ towards direction $d$, in phase $s$ ($+1$ attack, $0$ neutral, $-1$ defence):

$$w_{hot} = v^{(d)}_{hot}\, c_{hot}\, e^{s k} D^{opp}_{hot}, \quad w_{neu} = v^{(d)}_{neu}\, c_{neu}, \quad w_{cold} = v^{(d)}_{cold}\, c_{cold}\, e^{-s k} D^{opp}_{cold}$$

where the $c$ are the calibration correctors. Each group splits into its classes, which are multiplied by a corrector $m_{n,sn}$ depending on the shot number $n$ (3, 4, 5, 6, 7 and beyond) and on the serve $sn$. Then one class is drawn.

**Consequences.**
- `winner` ends the point; `error` and `fe` end it with an unforced or forced error.
- `in_attack` and `in_defence` move the traffic light.
- A neutral shot keeps the advantage with probability $\pi = 0.65$, otherwise the traffic light goes back to neutral.
- `opponent_error` puts the opponent, for the next shot only, in **extreme defence**: error 92%, winner 0.3%, otherwise play goes on.
- `opponent_winner` puts them in **clear attack**: winner 92%, error 0.8%.

In the data the next shot ends the point 99% of the time. The 92% cap is a game choice: a ball still in play shouldn't have a decided outcome. It costs about 0.1 shots of average rally length.

**Error type.** After an `opponent_error`, unforced or forced is decided with the share observed for the player who errs (62% unforced on average).

### 5. Calibration (`calibrate2.cjs`)

The frequencies estimated from the data are averages over all phases. The traffic light and the correctors distort them, so the "base" probabilities have to be solved for so that the simulated margins match the estimated ones. The tool is raking (iterative proportional fitting) on the real matches replayed. Each match is simulated with the models of both players and a number of points proportional to the real ones.

At each iteration a corrector is updated as $x \leftarrow x\,(t/\hat t)^{0.8\,\omega}$, where $t$ is the target, $\hat t$ the simulated value and $\omega = n/(n+n_0)$ the sample weight. The updated correctors are:
- shot frequency per player, towards the estimated frequency;
- hot/neutral/cold outcomes per player and play, towards the estimates;
- the forehand on the third shot, towards the real share blended with the simulated one;
- how points end by shot number, serve and outcome. There are 50 cells: winner, unforced and forced error on shot $n$, plus the winners and errors of an extreme phase, which are corrected on shot $n-1$.

The traffic light $k$ and the persistence $\pi$ are chosen on a grid, redoing the raking for each pair. The loss is a sum of standardized gaps:

$$L = \sum \frac{(\hat s - s)^2}{s(1-s)/n}$$

The 8 players times 9 metrics give 72 terms. The metrics are:
- conversion and steal;
- share of points with an advantage;
- share of shots in attack;
- serve and return points won;
- shares of rallies of 0-4, 5-8 and 9 or more shots.

Result: $k = 0.25$ and $\pi = 0.65$, with $L \approx 110$. A perfect model with the simulation noise would give about 84. The minimum is flat between $k = 0.2$ and $0.3$, so $k$ is estimated with little precision. After the raking the outcome correctors stay close to 1: median 1.03, between 0.79 and 1.40.

A declared assumption: conversion and steal match the data only if "in attack" also includes whoever plays a positive shot, not just whoever holds the traffic light. We did not find TennisViz's official definition. Their phase is a shot-by-shot classification based on position, so the assumption is plausible.

### 6. Choice of the weights and validation

**Shrinkage weights** (`kfold.mjs`, `idxcv.mjs`).
- The method is 5-fold cross-validation: we measure the log-likelihood of the shots and serves in the held-out matches.
- For directions, return and opponent indices there is a clear optimum, at the values in the table in section 3.
- For outcomes and serve, the shot-level likelihood would reward a high weight on the 52-week average. On out-of-sample match statistics, instead, a weight of 10 is the best or close to it for aces, winners, forced errors and rally length.
- The most likely explanation is that the 52-week average includes clay and grass. It also partly contains the held-out matches themselves.

**In sample** (`validate.cjs`). The 8 players, 10 simulations for each real point:

| | Simulated | Real |
|---|---|---|
| Serve points won | 67.3% | 67.6% |
| Points won on first / second serve | 74.9% / 51.6% | 74.6% / 52.9% |
| Aces per serve point | 11.1% | 11.3% |
| Mean rally length | 4.29 | 4.20 |
| Rallies of 0-4 / 5-8 / 9+ shots | 66.5 / 20.6 / 12.9% | 67.0 / 21.0 / 12.0% |
| Rally winners / unforced / forced errors, per 100 points | 11.3 / 12.1 / 9.2 | 11.9 / 12.2 / 9.1 |
| Shots in attack | 27.9% | 27.8% |
| Volleys / drop shots out of all shots | 5.6 / 1.8% | 5.4 / 1.7% |

How points end by shot number matches almost cell by cell, on first and second serve.

**Out of sample** (`oos.mjs`, `oossum.cjs`). Model and calibration are estimated without one fold of matches, then the held-out matches are replayed. Mean absolute error over the 8 players:

| Metric | Mean error |
|---|---|
| Serve points won | 1.3 percentage points |
| Return points won | 1.8 percentage points |
| Aces per serve point | 0.4 percentage points |
| Mean rally length | 0.07 shots |
| Rally winners / unforced / forced errors | 0.56 / 0.36 / 0.47 per 100 points |
| Conversion / steal | 1.8 / 2.1 percentage points |

### 7. Known limits

- **Independent points.** There is no effect of pressure (break points, tiebreaks), fatigue or score.
- **Opponents with little data.** The opponents' models rely on few matches. The game only uses the 8 players, who have between 6 and 18 each.
- **Volleys on defence.** By game rule they are never played on defence, so forced volley errors after a passing shot are missing: 0.25 against 0.6 per 100 points.
- **Two different phases.** TennisViz's point-by-point "extreme defence" is a positional classification, different from the engine's extreme phase. It is not used as a target.
- **Indoor and outdoor.** All matches weigh the same. Indoors, rallies are 0.25 shots shorter.
- **Directions in the 3D version.** The directions are three bands: left, middle and right of the court, in the receiver's frame.

### 8. Files and usage

| File | What it does |
|---|---|
| `engine.js` | The engine: serve, return, possible shots, outcomes, traffic light, extreme phases, simulated point |
| `model.json` | The model of the 8 players used by the game |
| `calib.json` | Calibrated parameters and correctors |
| `build.mjs` | From the raw data to the model (`ALL=1 OUT=file` for all 63 players) |
| `classify.mjs` | Shot reclassification (section 2) |
| `realstats.mjs` | Real statistics per match, with the same definitions as the simulator |
| `vallib.cjs`, `validate.cjs` | Replay the real matches and compare about 100 statistics |
| `calibrate2.cjs` | Full calibration |
| `kfold.mjs`, `idxcv.mjs` | Cross-validation of the shrinkage weights and of the opponent indices |
| `oos.mjs`, `oossum.cjs` | Out-of-sample validation of match statistics |
| `sim3d/template.html` | The 3D game: three.js, scene, animations, interface, Italian and English texts |
| `sim3d/build3d.mjs` | Injects model and engine into the game |
| `sim3d/build_site.mjs` | Builds the two website pages (English and Italian) with their link previews |
| `sim3d/rig.json` | Bone hierarchy and idle/run clips used by the players (the bodies themselves are built by code) |

Rebuild the game from the included model:

```bash
cd finals-simulator
node sim3d/build3d.mjs
node sim3d/build_site.mjs ../static
```

Rebuilding and recalibrating the model requires the raw data in `data/raw/`, which are not included:

```bash
node realstats.mjs data/raw/*.json.gz
ALL=1 OUT=model_all.json node build.mjs data/raw/*.json.gz
node calibrate2.cjs model_all.json calib.json
node build.mjs data/raw/*.json.gz
ALL=1 OUT=model_all_cal.json node build.mjs data/raw/*.json.gz
node validate.cjs model_all_cal.json 10
```

Validation needs the model with all players (`model_all_cal.json`), because every match is replayed with both players.

Personal, unofficial project. The matches in the game are simulated: the results do not predict real ones.
