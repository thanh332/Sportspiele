
const cards = document.querySelectorAll(".game-card");
const totalPointsDisplay = document.getElementById("totalPoints");

let totalPoints = 0;

function updateTotal(points) {
  totalPoints += points;
  totalPointsDisplay.textContent = totalPoints;
}

function setMessage(card, message) {
  card.querySelector(".game-message").textContent = message;
}

function setScore(card, points) {
  card.querySelector(".score b").textContent = points;
}

function finishGame(card, message) {
  card.dataset.playing = "false";
  card.querySelector(".play-button").textContent = "NOCHMAL ↻";
  setMessage(card, message);
}

cards.forEach(card => {
  const type = card.dataset.game;
  const arena = card.querySelector(".game-arena");
  const playButton = card.querySelector(".play-button");

  let score = 0;
  let playing = false;
  let timer = null;
  let animation = null;
  let clicks = 0;
  let direction = 1;
  let position = 15;
  let power = 0;

  const ball = card.querySelector(
    ".volley-ball, .tennis-ball, .basket-ball, .soccer-ball, .bowling-ball"
  );

  const meter = card.querySelector(
    ".basket-meter div, .power-meter div"
  );

  function stopMotion() {
    if (timer) clearInterval(timer);
    if (animation) cancelAnimationFrame(animation);
    timer = null;
    animation = null;
  }

  function resetVisuals() {
    position = 15;
    direction = 1;
    clicks = 0;
    power = 0;

    if (type === "volleyball") {
      ball.style.left = "15%";
      ball.style.top = "90px";
    }

    if (type === "tennis") {
      ball.style.left = "12%";
      ball.style.top = "85px";
    }

    if (type === "basketball") {
      ball.style.left = "15%";
      if (meter) meter.style.width = "30%";
    }

    if (type === "soccer") {
      ball.style.left = "34%";
      ball.style.bottom = "43px";
    }

    if (type === "bowling") {
      ball.style.left = "15%";
      if (meter) meter.style.width = "0%";
    }

    if (type === "swimming") {
      card.querySelector(".swimmer").style.left = "0%";
      card.querySelector(".swim-distance").textContent = "0 / 10";
    }
  }

  function startVolleyball() {
    setMessage(card, "JETZT TREFFEN!");
    timer = setInterval(() => {
      position += direction * 4;

      if (position > 75 || position < 10) direction *= -1;

      ball.style.left = position + "%";
      ball.style.top = (65 + Math.sin(position / 12) * 35) + "px";
    }, 100);
  }

  function startTennis() {
    setMessage(card, "DER BALL KOMMT!");
    timer = setInterval(() => {
      position += direction * 5;

      if (position > 78 || position < 10) direction *= -1;

      ball.style.left = position + "%";
      ball.style.top = (75 + Math.sin(position / 10) * 40) + "px";
    }, 90);
  }

  function startBasketball() {
    setMessage(card, "TIMING TREFFEN!");
    let value = 5;
    let speed = 3;

    timer = setInterval(() => {
      value += speed;

      if (value >= 95 || value <= 5) speed *= -1;

      meter.style.width = value + "%";
    }, 25);
  }

  function startBowling() {
    setMessage(card, "KRAFT WÄHLEN!");
    let value = 0;
    let speed = 2.5;

    timer = setInterval(() => {
      value += speed;

      if (value >= 100 || value <= 0) speed *= -1;

      meter.style.width = value + "%";
      power = value;
    }, 25);
  }

  function startSoccer() {
    setMessage(card, "LOS DRIBBELN!");
    setMessage(card, "KLICKE DICH ZUM TOR!");
  }

  function startSwimming() {
    setMessage(card, "AUF DIE PLÄTZE!");
  }

  function startGame() {
    stopMotion();
    score = 0;
    clicks = 0;
    playing = true;
    card.dataset.playing = "true";
    setScore(card, 0);
    resetVisuals();

    playButton.textContent = "NEUSTART ↻";

    if (type === "volleyball") startVolleyball();
    if (type === "basketball") startBasketball();
    if (type === "soccer") startSoccer();
    if (type === "tennis") startTennis();
    if (type === "bowling") startBowling();
    if (type === "swimming") startSwimming();
  }

  function addPoints(points) {
    score += points;
    setScore(card, score);
    updateTotal(points);
  }

  function playVolleyball() {
    const accuracy = 100 - Math.abs(position - 50);

    if (accuracy > 82) {
      addPoints(10);
      setMessage(card, "PERFEKT! +10 ✨");
    } else if (accuracy > 58) {
      addPoints(5);
      setMessage(card, "GUTER SCHLAG! +5");
    } else {
      setMessage(card, "KNAPP DANEBEN!");
    }
  }

  function playBasketball() {
    const value = parseFloat(meter.style.width);
    const distance = Math.abs(value - 50);

    if (distance < 9) {
      addPoints(15);
      setMessage(card, "KORBTREFFER! +15 🏀");
      ball.style.left = "72%";
      ball.style.top = "45px";
    } else if (distance < 23) {
      addPoints(5);
      setMessage(card, "FAST DRIN! +5");
    } else {
      setMessage(card, "DANEBEN!");
    }
  }

  function playSoccer() {
    clicks++;
    const progress = Math.min(clicks, 5) * 16;

    ball.style.left = (34 + progress * 0.7) + "%";
    ball.style.bottom = (43 + Math.sin(clicks) * 12) + "px";

    if (clicks < 5) {
      setMessage(card, "WEITER! " + clicks + " / 5");
    } else {
      addPoints(20);
      setMessage(card, "TOOOOR! +20 ⚽");
      ball.style.left = "84%";
      finishGame(card, "TOR! SUPER GESPIELT!");
      stopMotion();
    }
  }

  function playTennis() {
    const accuracy = 100 - Math.abs(position - 50);

    if (accuracy > 82) {
      addPoints(10);
      setMessage(card, "VOLLTREFFER! +10 🎾");
    } else if (accuracy > 55) {
      addPoints(5);
      setMessage(card, "GUT ERWISCHT! +5");
    } else {
      setMessage(card, "ZU SPÄT!");
    }
  }

  function playBowling() {
    const distance = Math.abs(power - 65);

    if (distance < 8) {
      addPoints(10);
      setMessage(card, "STRIKE! +10 🎳");
      ball.style.left = "75%";
    } else if (distance < 22) {
      addPoints(6);
      setMessage(card, "GUTER WURF! +6");
      ball.style.left = "65%";
    } else {
      addPoints(2);
      setMessage(card, "EIN PAAR PINS! +2");
      ball.style.left = "45%";
    }

    finishGame(card, "NOCH EINE RUNDE?");
    stopMotion();
  }

  function playSwimming() {
    clicks++;
    const progress = Math.min(clicks, 10) * 9;

    card.querySelector(".swimmer").style.left = progress + "%";
    card.querySelector(".swim-distance").textContent =
      clicks + " / 10";

    if (clicks < 10) {
      addPoints(1);
      setMessage(card, "WEITER SCHWIMMEN! " + clicks + " / 10");
    } else {
      addPoints(10);
      setMessage(card, "ZIEL ERREICHT! +10 🏊");
      finishGame(card, "GESCHAFFT! 🏅");
    }
  }

  playButton.addEventListener("click", startGame);

  arena.addEventListener("click", () => {
    if (!playing) return;

    if (type === "volleyball") playVolleyball();
    if (type === "basketball") playBasketball();
    if (type === "soccer") playSoccer();
    if (type === "tennis") playTennis();
    if (type === "bowling") playBowling();
    if (type === "swimming") playSwimming();
  });

  // Auch mit der Leertaste kann das aktuelle Spiel bedient werden.
  arena.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      arena.click();
    }
  });

  arena.setAttribute("tabindex", "0");
  arena.setAttribute("role", "button");
  arena.setAttribute("aria-label", "Spielfeld " + type);
});

document.getElementById("resetAll").addEventListener("click", () => {
  totalPoints = 0;
  totalPointsDisplay.textContent = "0";

  cards.forEach(card => {
    card.querySelector(".score b").textContent = "0";
    card.querySelector(".play-button").textContent = "SPIELEN ↗";
    card.querySelector(".game-message").textContent = "Bereit?";
    card.dataset.playing = "false";
  });
});
