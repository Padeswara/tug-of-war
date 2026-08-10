const openingScreen = document.getElementById("openingScreen");
const gameplayScreen = document.getElementById("gameplayScreen");
const closingScreen = document.getElementById("closingScreen");

const startButton = document.getElementById("startButton");
const playAgainButton = document.getElementById("playAgainButton");
const p1Button = document.getElementById("p1Button");

const marker = document.getElementById("marker");
const statusText = document.getElementById("statusText");

const p1PowerBar = document.getElementById("p1PowerBar");
const p2PowerBar = document.getElementById("p2PowerBar");

const p1PowerText = document.getElementById("p1PowerText");
const p2PowerText = document.getElementById("p2PowerText");

const p1ScoreText = document.getElementById("p1Score");
const p2ScoreText = document.getElementById("p2Score");

const finalReason = document.getElementById("finalReason");
const finalTitle = document.getElementById("finalTitle");
const finalMessage = document.getElementById("finalMessage");
const finalUserScore = document.getElementById("finalUserScore");
const finalRivalScore = document.getElementById("finalRivalScore");

let pullPosition = 0;
// 0 = tengah
// positif = Player 1 / biru unggul
// negatif = Player 2 / merah unggul

let p1Score = 0;
let p2Score = 0;

let gameActive = false;
let lockRound = false;
let currentScreen = "opening";

let decayTimer = null;
let botTimer = null;

const maxPull = 100;
const pullPower = 7.5;
const decayPower = 0.25;

function showScreen(screenName) {
  openingScreen.classList.remove("active");
  gameplayScreen.classList.remove("active");
  closingScreen.classList.remove("active");

  if (screenName === "opening") {
    openingScreen.classList.add("active");
  }

  if (screenName === "gameplay") {
    gameplayScreen.classList.add("active");
  }

  if (screenName === "closing") {
    closingScreen.classList.add("active");
  }

  currentScreen = screenName;
}

function clearAllTimers() {
  clearInterval(decayTimer);
  clearInterval(botTimer);

  decayTimer = null;
  botTimer = null;
}

function setMarkerStatus(title, subtitle = "", state = "") {
  if (subtitle) {
    statusText.innerHTML = `${title}<small>${subtitle}</small>`;
  } else {
    statusText.innerHTML = title;
  }

  marker.classList.remove("p1-win", "p2-win");

  if (state === "p1") {
    marker.classList.add("p1-win");
  }

  if (state === "p2") {
    marker.classList.add("p2-win");
  }
}

function updateScoreUI() {
  p1ScoreText.textContent = p1Score;
  p2ScoreText.textContent = p2Score;

  finalUserScore.textContent = p1Score;
  finalRivalScore.textContent = p2Score;
}

function updateGameUI() {
  const markerMove = Math.max(-130, Math.min(130, pullPosition * 1.25));

  marker.style.top = `calc(50% + ${markerMove}px)`;

  const p1Power = Math.min(100, Math.max(0, 50 + pullPosition / 2));
  const p2Power = Math.min(100, Math.max(0, 50 - pullPosition / 2));

  p1PowerBar.style.width = `${p1Power}%`;
  p2PowerBar.style.width = `${p2Power}%`;

  p1PowerText.textContent = `${Math.round(p1Power)}%`;
  p2PowerText.textContent = `${Math.round(p2Power)}%`;

  updateScoreUI();

  if (lockRound) {
    return;
  }

  if (pullPosition > 12) {
    setMarkerStatus("BLUE", "IS WINNING", "p1");
  } else if (pullPosition < -12) {
    setMarkerStatus("RED", "IS WINNING", "p2");
  } else {
    setMarkerStatus("CENTER");
  }
}

function startGame() {
  clearAllTimers();

  pullPosition = 0;
  p1Score = 0;
  p2Score = 0;

  gameActive = true;
  lockRound = false;

  updateGameUI();
  showScreen("gameplay");

  decayTimer = setInterval(gameDecay, 80);
  botTimer = setInterval(playerTwoPull, 430);
}

function playerOnePull() {
  if (!gameActive || lockRound) {
    return;
  }

  pullPosition += pullPower;

  checkWinner();
  updateGameUI();
}

function playerTwoPull() {
  if (!gameActive || lockRound) {
    return;
  }

  const botPower = 3.5 + Math.random() * 4.5;

  pullPosition -= botPower;

  checkWinner();
  updateGameUI();
}

function gameDecay() {
  if (!gameActive || lockRound) {
    return;
  }

  if (pullPosition > 0) {
    pullPosition -= decayPower;
  } else if (pullPosition < 0) {
    pullPosition += decayPower;
  }

  if (Math.abs(pullPosition) < 0.5) {
    pullPosition = 0;
  }

  updateGameUI();
}

function checkWinner() {
  if (!gameActive || lockRound) {
    return;
  }

  if (pullPosition >= maxPull) {
    playerWin();
  } else if (pullPosition <= -maxPull) {
    playerLose();
  }
}

function playerWin() {
  lockRound = true;
  gameActive = false;

  p1Score = 1;
  p2Score = 0;
  pullPosition = maxPull;

  clearAllTimers();
  updateGameUI();

  setMarkerStatus("PLAYER 1", "WINS!", "p1");

  setTimeout(() => {
    endGame("win");
  }, 900);
}

function playerLose() {
  lockRound = true;
  gameActive = false;

  p1Score = 0;
  p2Score = 1;
  pullPosition = -maxPull;

  clearAllTimers();
  updateGameUI();

  setMarkerStatus("PLAYER 2", "WINS!", "p2");

  setTimeout(() => {
    endGame("lose");
  }, 900);
}

function endGame(result) {
  updateScoreUI();

  if (result === "win") {
    finalReason.textContent = "YOU WIN";
    finalTitle.textContent = "KAMU MENANG!";
    finalMessage.textContent = "Mantap! Kamu berhasil menarik tali sampai ke sisi biru.";
  } else {
    finalReason.textContent = "GAME OVER";
    finalTitle.textContent = "KAMU KALAH!";
    finalMessage.textContent = "RivalMaster menarik lebih kuat. Coba tap lebih cepat lagi!";
  }

  showScreen("closing");
}

startButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);

p1Button.addEventListener("pointerdown", function (event) {
  event.preventDefault();
  playerOnePull();
});

document.addEventListener("keydown", function (event) {
  if (currentScreen === "opening") {
    if (event.code === "Enter" || event.code === "Space") {
      event.preventDefault();
      startGame();
    }

    return;
  }

  if (currentScreen === "closing") {
    if (event.code === "Enter" || event.code === "Space") {
      event.preventDefault();
      startGame();
    }

    return;
  }

  if (currentScreen === "gameplay") {
    if (event.code === "Space") {
      event.preventDefault();
      playerOnePull();
    }
  }
});

showScreen("opening");
updateGameUI();