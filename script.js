const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restart");
const countdownOverlay = document.getElementById("countdown");

const box = 20;
const canvasSize = 400;
let snake, direction, food, score, gameOver, gameLoop;

document.addEventListener("keydown", changeDirection);
restartBtn.addEventListener("click", startCountdown);

// Mobile touch buttons
document.getElementById("up").onclick = () => changeDirFromButton("UP");
document.getElementById("down").onclick = () => changeDirFromButton("DOWN");
document.getElementById("left").onclick = () => changeDirFromButton("LEFT");
document.getElementById("right").onclick = () => changeDirFromButton("RIGHT");

// Swipe support
let startX = 0, startY = 0;
canvas.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
canvas.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) changeDirFromButton("RIGHT");
    else changeDirFromButton("LEFT");
  } else {
    if (dy > 0) changeDirFromButton("DOWN");
    else changeDirFromButton("UP");
  }
});

function changeDirFromButton(dir) {
  if (dir === "UP" && direction !== "DOWN") direction = "UP";
  if (dir === "DOWN" && direction !== "UP") direction = "DOWN";
  if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
}

function changeDirection(e) {
  changeDirFromButton({
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT"
  }[e.key]);
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
  score = 0;
  gameOver = false;
  scoreDisplay.textContent = score;
  generateFood();

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(draw, 150);
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box,
    anim: 1
  };
}

function draw() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Food animation (pulse on spawn)
  const pulse = food.anim > 0 ? Math.sin(food.anim * 10) * 5 : 0;
  const radius = (box / 2) - pulse;
  ctx.fillStyle = "#ff4081";
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, radius, 0, 2 * Math.PI);
  ctx.fill();

  if (food.anim > 0) food.anim -= 0.05;

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#00e676" : "#69f0ae";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00e676";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.shadowBlur = 0;
  }

  // Move
  const head = { ...snake[0] };
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;
  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;

  // Check collision
  if (
    head.x < 0 || head.x >= canvasSize ||
    head.y < 0 || head.y >= canvasSize ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    alert("Game Over! Score: " + score);
    gameOver = true;
    return;
  }

  snake.unshift(head);

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    generateFood();
  } else {
    snake.pop();
  }
}

startCountdown();
