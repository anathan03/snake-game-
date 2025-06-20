window.addEventListener("keydown", function(e) {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (keys.includes(e.key)) {
    e.preventDefault();
  }
}, { passive: false });

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highscore");
const restartBtn = document.getElementById("restart");
const countdownOverlay = document.getElementById("countdown");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreEl = document.getElementById("final-score");
const finalHighScoreEl = document.getElementById("final-highscore");
const playAgainBtn = document.getElementById("play-again");
const themeSelect = document.getElementById("theme-select");
const loadingScreen = document.getElementById("loading-screen");

// Mobile arrow buttons
document.getElementById("up").onclick = () => bufferDirection("UP");
document.getElementById("down").onclick = () => bufferDirection("DOWN");
document.getElementById("left").onclick = () => bufferDirection("LEFT");
document.getElementById("right").onclick = () => bufferDirection("RIGHT");

const box = 20;
const canvasSize = 400;
let snake, direction, nextDirection, food, score, highScore, gameOver, gameLoop;
let konami = [], konamiUnlocked = false;

const themes = {
  classic: { snake: "#00e676", body: "#69f0ae", food: "#ff4081", bg: "#111" },
  dark:    { snake: "#ffffff", body: "#777", food: "#ff5722", bg: "#000" },
  neon:    { snake: "#00ffff", body: "#00bcd4", food: "#ffeb3b", bg: "#222" },
  pastel:  { snake: "#a5d6a7", body: "#81c784", food: "#f48fb1", bg: "#fce4ec" },
  rainbow: { snake: "rainbow", body: "rainbow", food: "#ff00ff", bg: "#222" }
};
let currentTheme = themes.classic;

document.addEventListener("keydown", (e) => {
  handleKonami(e.key);
  changeDirection(e);
});
restartBtn.addEventListener("click", startCountdown);
playAgainBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  startCountdown();
});
themeSelect.addEventListener("change", (e) => {
  const selected = e.target.value;
  currentTheme = themes[selected];
  canvas.style.backgroundColor = currentTheme.bg;
});

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
  snake = [{ x: 160, y: 160 }];
  direction = "RIGHT";
  nextDirection = direction;
  score = 0;
  gameOver = false;
  scoreDisplay.textContent = score;

  highScore = localStorage.getItem("snakeHighScore") || 0;
  highScoreDisplay.textContent = highScore;
  generateFood();
  canvas.style.backgroundColor = currentTheme.bg;

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(draw, 120);
}

// Swipe controls
let startX = 0, startY = 0;
canvas.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
canvas.addEventListener("touchmove", (e) => {
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

function bufferDirection(dir) {
  if (
    (dir === "UP" && direction !== "DOWN") ||
    (dir === "DOWN" && direction !== "UP") ||
    (dir === "LEFT" && direction !== "RIGHT") ||
    (dir === "RIGHT" && direction !== "LEFT")
  ) nextDirection = dir;
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

function generateFood() {
  food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box
  };
}

function draw() {
  if (gameOver) return;

  direction = nextDirection;
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  ctx.fillStyle = currentTheme.food;
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
  ctx.fill();

  for (let i = 0; i < snake.length; i++) {
    if (currentTheme.snake === "rainbow") {
      ctx.fillStyle = `hsl(${(i * 36) % 360}, 100%, 50%)`;
    } else {
      ctx.fillStyle = i === 0 ? currentTheme.snake : currentTheme.body;
    }
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
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    gameOver = true;
    finalScoreEl.textContent = score;
    finalHighScoreEl.textContent = Math.max(score, highScore);
    if (score > highScore) {
      localStorage.setItem("snakeHighScore", score);
    }
    gameOverScreen.style.display = "flex";
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    generateFood();
  } else {
    snake.pop();
  }
}

window.onload = () => {
  loadingScreen.style.display = "none";
  startCountdown();
};
