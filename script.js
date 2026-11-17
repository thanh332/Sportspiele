


let totalPoints = 0;

const $ = id => document.getElementById(id);

function addPoints(points) {
  totalPoints += points;
  $("totalPoints").textContent = totalPoints;
  $("finalPoints").textContent = totalPoints;
}

function setFeedback(id, message) {
  $(id).textContent = message;
}

function setRound(id, current, max, label) {
  $(id).textContent = `${label} ${current} / ${max}`;
}

function randomPosition() {
  return Math.floor(Math.random() * 80) + 10;
}

function makeGame(config) {
  let active = false;
  let round = 0;
  let score = 0;
  let timer = null;
  let value = 0;
  let direction = 1;

  const maxRounds = config.maxRounds;

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function reset() {
    stop();
    active = false;
    round = 0;
    score = 0;
    value = 0;
    direction = 1;
    config.updateScore(score);
    config.updateRound(round + 1);
    config.feedback(config.readyText);
    config.resetVisual();
    config.button.disabled = false;
    config.button.textContent = config.startText;
  }

  function end() {
    active = false;
    stop();
    config.button.disabled = false;
    config.button.textContent = "NOCHMAL SPIELEN ↻";
    config.feedback(`SPIEL BEENDET! Du hast ${score} Punkte erreicht.`);
  }

  function start() {
    stop();
    active = true;
    round = 1;
    score = 0;
    value = 0;
    direction = 1;

    config.updateScore(score);
    config.updateRound(round);
    config.resetVisual();
    config.feedback(config.startFeedback);
    config.button.disabled = true;

    config.begin(value, direction, next => {
      value = next;
    }, (newDirection) => {
      direction = newDirection;
    });

    if (config.animate) {
      timer = setInterval(() => {
        const result = config.animate(value, direction);
        value = result.value;
        direction = result.direction;
      }, config.speed || 35);
    }
  }

  function attempt(result) {
    if (!active) return;

    const points = Math.max(0, result);
    score += points;
    addPoints(points);
    config.updateScore(score);

    if (round >= maxRounds) {
      end();
    } else {
      round++;
      config.updateRound(round);
      config.feedback(config.roundFeedback(points, round));
      config.nextRound?.(round);
    }
  }

  config.button.addEventListener("click", start);
  config.area.addEventListener("click", event => {
    if (!active) return;
    config.action(event, value, direction, attempt);
  });

  return { reset };
}

// VOLLEYBALL
const volleyball = makeGame({
  button: $("volleyStart"),
  area: $("volleyCourt"),
  maxRounds: 5,
  speed: 30,
  startText: "AUFSCHLAG STARTEN ↗",
  readyText: "Starte das Spiel und erwische den richtigen Moment.",
  startFeedback: "DER BALL KOMMT! ZIEL ANVISIEREN!",
  updateScore: value => $("volleyScore").textContent = value,
  updateRound: round => setRound("volleyRound", round, 5, "RUNDE"),
  feedback: message => setFeedback("volleyFeedback", message),
  resetVisual: () => {
    $("volleyBall").style.left = "10%";
    $("volleyBall").style.top = "130px";
  },
  begin: () => {},
  
animate: (value, direction) => {
  value += direction * 0.7;

  if (value >= 82 || value <= 8) {
    direction *= -1;
  }

  $("volleyBall").style.left = value + "%";
  $("volleyBall").style.top =
    120 + Math.sin(value / 18) * 35 + "px";

  return { value, direction };
},

  action: (event, value, direction, attempt) => {
    const accuracy = 100 - Math.abs(value - 50);
    let points = 0;

    if (accuracy > 94) points = 15;
    else if (accuracy > 82) points = 10;
    else if (accuracy > 65) points = 5;

    attempt(points);

    if (points >= 10) {
      setFeedback("volleyFeedback", `SUPER AUFSCHLAG! +${points} Punkte`);
    } else if (points > 0) {
      setFeedback("volleyFeedback", `GUTER TREFFER! +${points} Punkte`);
    } else {
      setFeedback("volleyFeedback", "KNAPP DANEBEN! Weiter geht's.");
    }
  },
  roundFeedback: points => points ? `Treffer! +${points} Punkte.` : "Diesmal leider kein Treffer.",
  nextRound: () => {
    $("volleyBall").style.top = "130px";
  }
});

// BASKETBALL
const basketball = makeGame({
  button: $("basketStart"),
  area: $("basketCourt"),
  maxRounds: 5,
  speed: 25,
  startText: "WURF STARTEN ↗",
  readyText: "Triff den perfekten Moment für deinen Wurf.",
  startFeedback: "ACHTE AUF DIE ANZEIGE!",
  updateScore: value => $("basketScore").textContent = value,
  updateRound: round => setRound("basketRound", round, 5, "WURF"),
  feedback: message => setFeedback("basketFeedback", message),
  resetVisual: () => {
    $("basketMeter").style.left = "0%";
    $("basketMeter").style.width = "5%";
    $("basketBall").style.left = "18%";
    $("basketBall").style.bottom = "75px";
  },
  begin: () => {},
  animate: (value, direction) => {
    value += direction * 2.4;
    if (value >= 95 || value <= 0) direction *= -1;
    $("basketMeter").style.left = value + "%";
    return { value, direction };
  },
  action: (event, value, direction, attempt) => {
    const distance = Math.abs(value - 50);
    let points = 0;

    if (distance < 7) {
      points = 15;
      $("basketBall").style.left = "76%";
      $("basketBall").style.bottom = "205px";
    } else if (distance < 15) {
      points = 10;
      $("basketBall").style.left = "65%";
      $("basketBall").style.bottom = "175px";
    } else if (distance < 27) {
      points = 5;
    }

    attempt(points);
    setFeedback("basketFeedback",
      points ? `KORBWURF! +${points} Punkte 🏀` : "Leider daneben! Nächster Versuch.");
  },
  roundFeedback: points => points ? `Starker Wurf! +${points} Punkte.` : "Daneben! Versuche es erneut.",
  nextRound: () => {
    $("basketBall").style.left = "18%";
    $("basketBall").style.bottom = "75px";
  }
});

// FUSSBALL
const soccer = makeGame({
  button: $("soccerStart"),
  area: $("soccerCourt"),
  maxRounds: 5,
  startText: "ELFMETER STARTEN ↗",
  readyText: "Kannst du den Torwart austricksen?",
  startFeedback: "DER TORWART IST BEREIT!",
  updateScore: value => $("soccerScore").textContent = value,
  updateRound: round => setRound("soccerRound", round, 5, "SCHUSS"),
  feedback: message => setFeedback("soccerFeedback", message),
  resetVisual: () => {
    $("goalKeeper").style.left = "44%";
    $("penaltyBall").style.left = "calc(50% - 18px)";
    $("penaltyBall").style.bottom = "65px";
  },
  begin: () => {},
  action: (event, value, direction, attempt) => {
    const zone = event.target.closest(".goal-zone");
    if (!zone) return;

    const chosen = zone.dataset.zone;
    const keeperZones = ["left", "middle", "right"];
    const keeper = keeperZones[Math.floor(Math.random() * 3)];

    const keeperPositions = {
      left: "10%",
      middle: "44%",
      right: "78%"
    };

    $("goalKeeper").style.left = keeperPositions[keeper];

    const ballPositions = {
      left: "18%",
      middle: "calc(50% - 18px)",
      right: "78%"
    };

    $("penaltyBall").style.left = ballPositions[chosen];
    $("penaltyBall").style.bottom = "220px";

    let points = 0;

    if (chosen !== keeper) {
      points = 10;
      setFeedback("soccerFeedback", "TOOOOR! Der Torwart war in der falschen Ecke! ⚽");
    } else {
      points = 0;
      setFeedback("soccerFeedback", "GEHALTEN! Der Torwart hat deine Ecke erwischt.");
    }

    attempt(points);
  },
  roundFeedback: points => points ? `Tor erzielt! +${points} Punkte.` : "Gehalten! Nächster Elfmeter.",
  nextRound: () => {
    $("goalKeeper").style.left = "44%";
    $("penaltyBall").style.left = "calc(50% - 18px)";
    $("penaltyBall").style.bottom = "65px";
  }
});


animate: (value, direction) => {
  value += direction * 0.75;

  if (value >= 83 || value <= 7) {
    direction *= -1;
  }

  $("tennisBall").style.left = value + "%";
  $("tennisBall").style.top =
    45 + Math.sin(value / 18) * 10 + "%";

  return { value, direction };
},

  action: (event, value, direction, attempt) => {
    const accuracy = 100 - Math.abs(value - 50);
    let points = 0;

    if (accuracy > 94) points = 12;
    else if (accuracy > 82) points = 8;
    else if (accuracy > 65) points = 4;

    attempt(points);
    setFeedback("tennisFeedback",
      points ? `GUTER RÜCKSCHLAG! +${points} Punkte 🎾` : "Der Ball ist weg! Weiter geht's.");
  },
  roundFeedback: points => points ? `Ballwechsel geschafft! +${points}.` : "Verpasst! Versuche es nochmals.",
  nextRound: () => {
    $("tennisBall").style.left = "10%";
  }
});

// BOWLING
const bowling = makeGame({
  button: $("bowlingStart"),
  area: $("bowlingCourt"),
  maxRounds: 5,
  speed: 28,
  startText: "WURF STARTEN ↗",
  readyText: "Finde die richtige Kombination aus Kraft und Richtung.",
  startFeedback: "ACHTE AUF KRAFT UND RICHTUNG!",
  updateScore: value => $("bowlingScore").textContent = value,
  updateRound: round => setRound("bowlingRound", round, 5, "WURF"),
  feedback: message => setFeedback("bowlingFeedback", message),
  resetVisual: () => {
    $("bowlingPower").style.width = "5%";
    $("bowlingDirection").style.width = "5%";
    $("bowlingBall").style.left = "50%";
    $("pins").textContent = "🎳";
  },
  begin: () => {},
  animate: (value, direction) => {
    value += direction * 2.2;
    if (value >= 95 || value <= 0) direction *= -1;

    $("bowlingPower").style.width = value + "%";
    $("bowlingDirection").style.width =
      (50 + Math.sin(value / 10) * 40) + "%";

    return { value, direction };
  },
  action: (event, value, direction, attempt) => {
    const powerDistance = Math.abs(value - 65);
    const directionValue = 50 + Math.sin(value / 10) * 40;
    const directionDistance = Math.abs(directionValue - 50);

    let pins = 0;

    if (powerDistance < 9 && directionDistance < 12) pins = 10;
    else if (powerDistance < 18 && directionDistance < 25) pins = 7;
    else if (powerDistance < 30) pins = 4;
    else pins = 1;

    $("bowlingBall").style.left = "50%";
    $("bowlingBall").style.bottom = "210px";

    if (pins === 10) $("pins").textContent = "✨";
    else if (pins >= 7) $("pins").textContent = "🎳";
    else $("pins").textContent = "🎳";

    attempt(pins * 2);
    setFeedback("bowlingFeedback",
      pins === 10 ? "STRIKE! ALLE PINS! +20 🎳" :
      `${pins} PINS ERWISCHT! +${pins * 2} Punkte`);
  },
  roundFeedback: points => points ? `Guter Wurf! +${points} Punkte.` : "Versuche es erneut.",
  nextRound: () => {
    $("bowlingBall").style.bottom = "12px";
    $("pins").textContent = "🎳";
  }
});

// SCHWIMMEN
let swimActive = false;
let swimRound = 0;
let swimScore = 0;
let swimProgress = 0;
let swimLastSide = null;

function resetSwim() {
  swimActive = false;
  swimRound = 0;
  swimScore = 0;
  swimProgress = 0;
  swimLastSide = null;

  $("swimScore").textContent = "0";
  $("swimRound").textContent = "BAHN 1 / 3";
  $("swimProgress").style.width = "0%";
  $("swimmer").style.left = "0%";
  $("swimStart").disabled = false;
  $("swimStart").textContent = "RENNEN STARTEN ↗";
  setFeedback("swimFeedback", "Bringe deinen Schwimmer ins Ziel!");
}

$("swimStart").addEventListener("click", () => {
  resetSwim();
  swimActive = true;
  $("swimStart").disabled = true;
  setFeedback("swimFeedback", "LOS! KLICKE ABWECHSELND LINKS UND RECHTS!");
});

$("swimCourt").addEventListener("click", event => {
  if (!swimActive) return;

  const rect = $("swimCourt").getBoundingClientRect();
  const side = event.clientX < rect.left + rect.width / 2 ? "left" : "right";

  if (side === swimLastSide) {
    setFeedback("swimFeedback", "WECHSLE DIE SEITE!");
    return;
  }

  swimLastSide = side;
  swimProgress += 12;
  swimScore += 1;

  $("swimmer").style.left = Math.min(swimProgress, 90) + "%";
  $("swimProgress").style.width = Math.min(swimProgress, 100) + "%";
  $("swimScore").textContent = swimScore;
  addPoints(2);

  if (swimProgress >= 100) {
    swimRound++;

    if (swimRound >= 3) {
      swimActive = false;
      addPoints(10);
      setFeedback("swimFeedback", "GESCHAFFT! Du hast alle drei Bahnen beendet! 🏅");
      $("swimStart").disabled = false;
      $("swimStart").textContent = "NOCHMAL SCHWIMMEN ↻";
      $("swimRound").textContent = "FERTIG!";
    } else {
      swimProgress = 0;
      swimLastSide = null;
      $("swimmer").style.left = "0%";
      $("swimProgress").style.width = "0%";
      $("swimRound").textContent = `BAHN ${swimRound + 1} / 3`;
      setFeedback("swimFeedback", `BAHN ${swimRound} GESCHAFFT! Weiter geht's!`);
    }
  } else {
    setFeedback("swimFeedback", "GUT! Weiter im Wechsel! 🌊");
  }
});

// ALLES ZURÜCKSETZEN
$("resetAll").addEventListener("click", () => {
  totalPoints = 0;
  $("totalPoints").textContent = "0";
  $("finalPoints").textContent = "0";

  volleyball.reset();
  basketball.reset();
  soccer.reset();
  tennis.reset();
  bowling.reset();
  resetSwim();
});
