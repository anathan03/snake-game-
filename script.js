// --- Globals & Setup ---
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const box = 20;
const canvasSize = 400;
let snake, food, direction, nextDirection, score, highScore, gameOver;
let obstacles = [];
let gameLoop, speed = 120;
let mode = null;
let currentLevel = 0;
let currentTheme = {};
let konami = [], konamiUnlocked = false;

const themes = {
  classic: { snake: "#00e676", body: "#69f0ae", food: "#ff4081", bg: "#111" },
  dark:    { snake: "#ffffff", body: "#777", food: "#ff5722", bg: "#000" },
  neon:    { snake: "#00ffff", body: "#00bcd4", food: "#ffeb3b", bg: "#222" },
  pastel:  { snake: "#a5d6a7", body: "#81c784", food: "#f48fb1", bg: "#fce4ec" },
  rainbow: { snake: "rainbow", body: "rainbow", food: "#ff00ff", bg: "#222" }
};

// --- DOM ---
const restartBtn = document.getElementById("restart");
const countdownOverlay = document.getElementById("countdown");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreEl = document.getElementById("final-score");
const finalHighScoreEl = document.getElementById("final-highscore");
const playAgainBtn = document.getElementById("play-again");
const themeSelect = document.getElementById("theme-select");
const loadingScreen = document.getElementById("loading-screen");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highscore");
const saveBtn = document.getElementById("save-btn");

const normalBtn = document.getElementById("normal-mode-btn");
const endlessBtn = document.getElementById("endless-mode-btn");
const storyBtn = document.getElementById("story-mode-btn");
const resumeBtn = document.getElementById("resume-game-btn");

const ui = document.getElementById("ui");
const modeSelector = document.getElementById("mode-selector");

// --- Story Levels ---
const levels = [
  { goal: 5, speed: 150, obstacles: [] },
  { goal: 10, speed: 130, obstacles: [{ x: 100, y: 100 }] },
  { goal: 15, speed: 110, obstacles: [{ x: 100, y: 100 }, { x: 200, y: 200 }] }
];

// --- Events ---
window.addEventListener("keydown", e => {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (keys.includes(e.key)) e.preventDefault();
  handleKonami(e.key);
  changeDirection(e);
}, { passive: false });

themeSelect.addEventListener("change", (e) => {
  const selected = e.target.value;
  currentTheme = themes[selected];
  canvas.style.backgroundColor = currentTheme.bg;
});

document.getElementById("up").onclick = () => bufferDirection("UP");
document.getElementById("down").onclick = () => bufferDirection("DOWN");
document.getElementById("left").onclick = () => bufferDirection("LEFT");
document.getElementById("right").onclick = () => bufferDirection("RIGHT");

restartBtn.onclick = startCountdown;
playAgainBtn.onclick = () => {
  gameOverScreen.style.display = "none";
  showModeSelector();
};

saveBtn.onclick = saveGame;

normalBtn.onclick = () => {
  mode = "normal";
  ui.style.display = "block";
  modeSelector.style.display = "none";
  startCountdown();
};

endlessBtn.onclick = () => {
  mode = "endless";
  ui.style.display = "block";
  modeSelector.style.display = "none";
  startCountdown();
};

storyBtn.onclick = () => {
  mode = "story";
  currentLevel = 0;
  ui.style.display = "block";
  modeSelector.style.display = "none";
  startCountdown();
};

resumeBtn.onclick = () => {
  loadGame();
  ui.style.display = "block";
  modeSelector.style.display = "none";
};

// --- Core Functions ---
function showModeSelector() {
  modeSelector.style.display = "flex";
  ui.style.display = "none";
  if (localStorage.getItem("snakeSave")) {
    resumeBtn.style.display = "inline-block";
  } else {
    resumeBtn.style.display = "none";
  }
}

function handleKonami(key) {
  const sequence = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  konami.push(key);
  if (konami.length > sequence.length) konami.shift();
  if (konami.join('').toLowerCase() === sequence.join('').toLowerCase()) {
    alert("✨ Secret Theme Unlocked!");
    konamiUnlocked = true;
    themes.secret = themes.rainbow;
    const option = document.createElement("option");
    option.value = "rainbow";
    option.text = "Rainbow (Secret)";
    themeSelect.appendChild(option);
  }
}

function startCountdown() {
  let count = 3;
  countdownOverlay.style.visibility = "visible";
  countdownOverlay.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) countdownOverlay.textContent = count;
    else if (count === 0) countdownOverlay.textContent = "Go!";
    else {
      clearInterval(interval);
      countdownOverlay.style.visibility = "hidden";
      initGame();
    }
  }, 800);
}

function initGame() {
  direction = "RIGHT";
  nextDirection = direction;
  snake = [{ x: 160, y: 160 }];
  score = 0;
  gameOver = false;
  obstacles = [];

  if (mode === "story") {
    const lvl = levels[currentLevel];
    speed = lvl.speed;
    obstacles = [...lvl.obstacles];
  } else if (mode === "endless") {
    speed = 120;
  } else if (mode === "normal") {
    speed = 120;
    obstacles = [];
  }

  highScore = localStorage.getItem("snakeHighScore") || 0;
  highScoreDisplay.textContent = highScore;
  scoreDisplay.textContent = score;
  generateFood();

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(draw, speed);
}

function saveGame() {
  const saveData = {
    snake, food, direction, nextDirection, score,
    mode, currentLevel, obstacles, speed, theme: themeSelect.value
  };
  localStorage.setItem("snakeSave", JSON.stringify(saveData));
  alert("💾 Game Saved!");
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("snakeSave"));
  snake = data.snake;
  food = data.food;
  direction = data.direction;
  nextDirection = data.nextDirection;
  score = data.score;
  mode = data.mode;
  currentLevel = data.currentLevel;
  obstacles = data.obstacles;
  speed = data.speed;
  currentTheme = themes[data.theme];
  themeSelect.value = data.theme;
  canvas.style.backgroundColor = currentTheme.bg;

  scoreDisplay.textContent = score;
  highScore = localStorage.getItem("snakeHighScore") || 0;
  highScoreDisplay.textContent = highScore;

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(draw, speed);
}

function changeDirection(e) {
  const dir = {
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT"
  }[e.key];
  if (dir) bufferDirection(dir);
}

function bufferDirection(dir) {
  if (
    (dir === "UP" && direction !== "DOWN") ||
    (dir === "DOWN" && direction !== "UP") ||
    (dir === "LEFT" && direction !== "RIGHT") ||
    (dir === "RIGHT" && direction !== "LEFT")
  ) nextDirection = dir;
}

let startX = 0, startY = 0;
canvas.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
canvas.addEventListener("touchmove", e => {
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) bufferDirection("RIGHT");
    else if (dx < -30) bufferDirection("LEFT");
  } else {
    if (dy > 30) bufferDirection("DOWN");
    else if (dy < -30) bufferDirection("UP");
  }
  e.preventDefault();
}, { passive: false });

function generateFood() {
  food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box
  };
}

function generateObstacle() {
  let newObstacle;
  let collides;
  do {
    newObstacle = {
      x: Math.floor(Math.random() * (canvasSize / box)) * box,
      y: Math.floor(Math.random() * (canvasSize / box)) * box
    };
    collides = snake.some(s => s.x === newObstacle.x && s.y === newObstacle.y) ||
               (food.x === newObstacle.x && food.y === newObstacle.y) ||
               obstacles.some(o => o.x === newObstacle.x && o.y === newObstacle.y);
  } while (collides);
  obstacles.push(newObstacle);
}

function draw() {
  if (gameOver) return;
  direction = nextDirection;
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw food
  ctx.fillStyle = currentTheme.food;
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
  ctx.fill();

  // Obstacles
  ctx.fillStyle = "#555";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, box, box));

  // Snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = currentTheme.snake === "rainbow"
      ? `hsl(${(i * 36) % 360}, 100%, 50%)`
      : (i === 0 ? currentTheme.snake : currentTheme.body);
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  const head = { ...snake[0] };
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;
  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;

  if (
    head.x < 0 || head.x >= canvasSize ||
    head.y < 0 || head.y >= canvasSize ||
    snake.some(s => s.x === head.x && s.y === head.y) ||
    obstacles.some(o => o.x === head.x && o.y === head.y)
  ) {
    gameOver = true;
    finalScoreEl.textContent = score;
    finalHighScoreEl.textContent = Math.max(score, highScore);
    if (score > highScore) localStorage.setItem("snakeHighScore", score);
    gameOverScreen.style.display = "flex";
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    generateFood();
    if (mode === "endless" && score % 5 === 0) {
      generateObstacle();
      speed = Math.max(60, speed - 5);
      clearInterval(gameLoop);
      gameLoop = setInterval(draw, speed);
    }
    if (mode === "story" && score >= levels[currentLevel].goal) {
      currentLevel++;
      if (currentLevel >= levels.length) {
        alert("🎉 You've completed Story Mode!");
        showModeSelector();
        return;
      }
      alert(`📘 Level ${currentLevel + 1} begins!`);
      startCountdown();
      return;
    }
  } else {
    snake.pop();
  }
}

window.onload = () => {
  loadingScreen.style.display = "none";
  showModeSelector();
};
// ...[keep all previous code]...

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

// ...[rest of your script.js unchanged]...
