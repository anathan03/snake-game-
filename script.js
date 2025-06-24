const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const canvasSize = canvas.width;
let snake = [{ x: 160, y: 160 }];
let direction = "right";
let food = getRandomFood();
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let snakeColor = "#00cc00"; // Classic green
let foodColor = "#ff3333";  // Classic red
let gameInterval;
let speed = 150;
let mode = "normal";
let currentLevel = 0;
let countdownInterval;

// DOM Elements
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highscore");
const countdownEl = document.getElementById("countdown");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");
const finalHighScore = document.getElementById("final-highscore");
const playAgainBtn = document.getElementById("play-again");
const restartBtn = document.getElementById("restart");
const themeSelect = document.getElementById("theme-select");
const ui = document.getElementById("ui");
const loadingScreen = document.getElementById("loading-screen");
const normalBtn = document.getElementById("normal-mode-btn");
const endlessBtn = document.getElementById("endless-mode-btn");
const storyBtn = document.getElementById("story-mode-btn");
const resumeBtn = document.getElementById("resume-game-btn");
const modeSelector = document.getElementById("mode-selector");
const saveBtn = document.getElementById("save-btn");

// Themes
function applyTheme(theme) {
  if (theme === "classic") {
    snakeColor = "#00cc00";
    foodColor = "#ff3333";
    canvas.style.backgroundColor = "#000";
  } else if (theme === "dark") {
    snakeColor = "#ccc";
    foodColor = "#ff9900";
    canvas.style.backgroundColor = "#111";
  } else if (theme === "neon") {
    snakeColor = "#39ff14";
    foodColor = "#ff073a";
    canvas.style.backgroundColor = "#000";
  } else if (theme === "pastel") {
    snakeColor = "#a2d2ff";
    foodColor = "#ffafcc";
    canvas.style.backgroundColor = "#fff0f6";
  }
}

// Start Game
function startCountdown() {
  let count = 3;
  countdownEl.textContent = count;
  countdownEl.style.display = "block";
  countdownInterval = setInterval(() => {
    count--;
    countdownEl.textContent = count;
    if (count <= 0) {
      clearInterval(countdownInterval);
      countdownEl.style.display = "none";
      startGame();
    }
  }, 1000);
}

function startGame() {
  snake = [{ x: 160, y: 160 }];
  direction = "right";
  food = getRandomFood();
  score = 0;
  speed = 150;
  currentLevel = 0;
  updateScore();
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
}

function gameLoop() {
  let head = { ...snake[0] };
  if (direction === "right") head.x += gridSize;
  if (direction === "left") head.x -= gridSize;
  if (direction === "up") head.y -= gridSize;
  if (direction === "down") head.y += gridSize;

  if (checkCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    food = getRandomFood();
  } else {
    snake.pop();
  }

  if (mode === "endless") {
    if (speed > 60) {
      clearInterval(gameInterval);
      speed -= 1;
      gameInterval = setInterval(gameLoop, speed);
    }
  }

  draw();
}

function updateScore() {
  scoreDisplay.textContent = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  highScoreDisplay.textContent = highScore;
}

function endGame() {
  clearInterval(gameInterval);
  finalScore.textContent = score;
  finalHighScore.textContent = highScore;
  gameOverScreen.style.display = "flex";
}

function draw() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.fillStyle = snakeColor;
  snake.forEach(seg => ctx.fillRect(seg.x, seg.y, gridSize, gridSize));
  ctx.fillStyle = foodColor;
  ctx.beginPath();
  ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2.5, 0, 2 * Math.PI);
  ctx.fill();
}

function getRandomFood() {
  return {
    x: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize
  };
}

function checkCollision(head) {
  return (
    head.x < 0 ||
    head.x >= canvasSize ||
    head.y < 0 ||
    head.y >= canvasSize ||
    snake.some((seg, i) => i !== 0 && seg.x === head.x && seg.y === head.y)
  );
}

// Fix Arrow Key Scrolling
document.addEventListener("keydown", e => {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (keys.includes(e.key)) {
    e.preventDefault(); // ← This prevents scrolling the page
  }

  if (e.key === "ArrowUp" && direction !== "down") direction = "up";
  if (e.key === "ArrowDown" && direction !== "up") direction = "down";
  if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
  if (e.key === "ArrowRight" && direction !== "left") direction = "right";
});

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

// Mobile Controls
document.getElementById("up").onclick = () => direction = "up";
document.getElementById("down").onclick = () => direction = "down";
document.getElementById("left").onclick = () => direction = "left";
document.getElementById("right").onclick = () => direction = "right";

// Restart / Play Again
restartBtn.onclick = startCountdown;
playAgainBtn.onclick = () => {
  gameOverScreen.style.display = "none";
  startCountdown();
};

// Mode Selectors
function showLoadingScreen(modeName) {
  loadingScreen.style.display = "flex";
  document.getElementById("loading-mode-text").textContent = `Loading ${modeName}...`;
}

normalBtn.onclick = () => {
  mode = "normal";
  modeSelector.style.display = "none";
  showLoadingScreen("Normal Mode");
  setTimeout(() => {
    loadingScreen.style.display = "none";
    ui.style.display = "block";
    startCountdown();
  }, 1500);
};

endlessBtn.onclick = () => {
  mode = "endless";
  modeSelector.style.display = "none";
  showLoadingScreen("Endless Mode");
  setTimeout(() => {
    loadingScreen.style.display = "none";
    ui.style.display = "block";
    startCountdown();
  }, 1500);
};

storyBtn.onclick = () => {
  mode = "story";
  currentLevel = 0;
  modeSelector.style.display = "none";
  showLoadingScreen("Story Mode");
  setTimeout(() => {
    loadingScreen.style.display = "none";
    ui.style.display = "block";
    startCountdown();
  }, 1500);
};

resumeBtn.onclick = () => {
  loadGame();
  modeSelector.style.display = "none";
  ui.style.display = "block";
};

saveBtn.onclick = () => {
  const saveData = {
    snake,
    direction,
    food,
    score,
    highScore,
    mode
  };
  localStorage.setItem("snakeSave", JSON.stringify(saveData));
};

function loadGame() {
  const saveData = JSON.parse(localStorage.getItem("snakeSave"));
  if (saveData) {
    snake = saveData.snake;
    direction = saveData.direction;
    food = saveData.food;
    score = saveData.score;
    highScore = saveData.highScore;
    mode = saveData.mode;
    updateScore();
    gameInterval = setInterval(gameLoop, speed);
  }
}

// Initialize
applyTheme("classic");
themeSelect.value = "classic";
if (localStorage.getItem("snakeSave")) {
  resumeBtn.style.display = "inline-block";
}
