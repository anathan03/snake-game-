// Grab elements
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const canvasSize = canvas.width;

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highscore");
const finalScoreDisplay = document.getElementById("final-score");
const finalHighScoreDisplay = document.getElementById("final-highscore");
const loadingScreen = document.getElementById("loading-screen");
const loadingModeText = document.getElementById("loading-mode-text");
const ui = document.getElementById("ui");
const modeSelector = document.getElementById("mode-selector");
const gameOverScreen = document.getElementById("game-over-screen");
const countdownEl = document.getElementById("countdown");

let snake, direction, directionQueue, food, score, speed, mode, gameInterval;
let highScore = 0;

// Initialize state variables
function initState() {
  snake = [{ x: 160, y: 160 }];
  direction = "right";
  directionQueue = [];
  food = getRandomFood();
  score = 0;
  speed = 100;
}

// Draw function
function draw() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, gridSize, gridSize);
  // Draw snake
  ctx.fillStyle = "lime";
  for (let segment of snake) {
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  }
}

// Main game loop
function gameLoop() {
  // Process queued directions fully, apply first valid
  while (directionQueue.length > 0) {
    const next = directionQueue.shift();
    if (
      (direction === "up" && next !== "down") ||
      (direction === "down" && next !== "up") ||
      (direction === "left" && next !== "right") ||
      (direction === "right" && next !== "left")
    ) {
      direction = next;
      break;
    }
  }

  // Move snake head
  let head = { ...snake[0] };
  if (direction === "right") head.x += gridSize;
  else if (direction === "left") head.x -= gridSize;
  else if (direction === "up") head.y -= gridSize;
  else if (direction === "down") head.y += gridSize;

  // Collision check
  if (checkCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);
  // Eat or move
  if (head.x === food.x && head.y === food.y) {
    score++;
    if (score > highScore) highScore = score;
    updateScore();
    food = getRandomFood();
  } else {
    snake.pop();
  }

  draw();
}

// Collision detection
function checkCollision(head) {
  return (
    head.x < 0 ||
    head.x >= canvasSize ||
    head.y < 0 ||
    head.y >= canvasSize ||
    snake.some((segment, i) => i !== 0 && segment.x === head.x && segment.y === head.y)
  );
}

// Update score displays
function updateScore() {
  scoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
}

// End game: stop loop and show game-over UI
function endGame() {
  clearInterval(gameInterval);
  finalScoreDisplay.textContent = score;
  finalHighScoreDisplay.textContent = highScore;
  gameOverScreen.style.display = "flex";
  ui.style.display = "none";
}

// Random food position
function getRandomFood() {
  return {
    x: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize
  };
}

// Reset and start the game loop
function resetGame() {
  initState();
  updateScore();
  ui.style.display = "block";
  gameOverScreen.style.display = "none";
  countdownEl.style.display = "none";
  countdownEl.textContent = "";
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
}

// 3-2-1-Go countdown
function startCountdown(callback) {
  let count = 3;
  countdownEl.style.display = "block";
  countdownEl.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else if (count === 0) {
      countdownEl.textContent = "Go!";
    } else {
      clearInterval(interval);
      countdownEl.style.display = "none";
      countdownEl.textContent = "";
      callback(); // Begin game
    }
  }, 1000);
}

// Keyboard input handling with queue
document.addEventListener("keydown", (e) => {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (keys.includes(e.key)) e.preventDefault();

  const lastDir = directionQueue.length > 0
    ? directionQueue[directionQueue.length - 1]
    : direction;

  if (e.key === "ArrowUp" && lastDir !== "down") directionQueue.push("up");
  if (e.key === "ArrowDown" && lastDir !== "up") directionQueue.push("down");
  if (e.key === "ArrowLeft" && lastDir !== "right") directionQueue.push("left");
  if (e.key === "ArrowRight" && lastDir !== "left") directionQueue.push("right");
});

// Mobile button input
document.getElementById("up").onclick = () => directionQueue.push("up");
document.getElementById("down").onclick = () => directionQueue.push("down");
document.getElementById("left").onclick = () => directionQueue.push("left");
document.getElementById("right").onclick = () => directionQueue.push("right");

// Restart button
document.getElementById("restart").onclick = () => resetGame();

// Play again on game over
document.getElementById("play-again").onclick = () => {
  gameOverScreen.style.display = "none";
  modeSelector.style.display = "flex";
};

// Helper to capitalize
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Start game with loading screen + countdown
function startGameWithCountdown(selectedMode) {
  mode = selectedMode;
  modeSelector.style.display = "none";

  // Show loading screen with "Made by Andrew Nathan"
  loadingScreen.style.display = "flex";
  loadingModeText.textContent = `Loading ${capitalizeFirstLetter(selectedMode)} Mode...`;

  // After 1 second, hide loading screen, show game UI + countdown, then start countdown
  setTimeout(() => {
    loadingScreen.style.display = "none";

    // Show game UI and countdown
    ui.style.display = "block";
    countdownEl.style.display = "block";

    // Start countdown, then start the game
    startCountdown(() => {
      countdownEl.style.display = "none";  // Hide countdown after finishing
      resetGame();  // Start the game loop
    });
  }, 1000);
}

// Mode button handlers
document.getElementById("normal-mode-btn").onclick = () => {
  startGameWithCountdown("normal");
};
document.getElementById("endless-mode-btn").onclick = () => {
  startGameWithCountdown("endless");
};
document.getElementById("story-mode-btn").onclick = () => {
  startGameWithCountdown("story");
};

// On load: show mode selector, hide countdown
window.onload = () => {
  modeSelector.style.display = "flex";
  countdownEl.style.display = "none";
  countdownEl.textContent = "";
};
