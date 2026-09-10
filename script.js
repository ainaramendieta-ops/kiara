const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

let score = 0;

// Datos del jugador
const player = {
  x: 280,
  y: 180,
  size: 30,
  speed: 5,
  color: "#c54ebb" // Azul cyan
};

// Datos de la moneda
const coin = {
  x: Math.random() * (canvas.width - 20),
  y: Math.random() * (canvas.height - 20),
  size: 15,
  color: "#ffd700" // Dorado
};

// Estado de las teclas
const keys = {};

window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Lógica de movimiento
function update() {
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y + player.size < canvas.height) player.y += player.speed;
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.size < canvas.width) player.x += player.speed;

  // Detección de colisión con la moneda
  if (
    player.x < coin.x + coin.size &&
    player.x + player.size > coin.x &&
    player.y < coin.y + coin.size &&
    player.y + player.size > coin.y
  ) {
    score += 10;
    scoreElement.textContent = score;
    // Reubicar moneda
    coin.x = Math.random() * (canvas.width - coin.size);
    coin.y = Math.random() * (canvas.height - coin.size);
  }
}

// Dibujar en pantalla
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jugador
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Moneda
  ctx.fillStyle = coin.color;
  ctx.beginPath();
  ctx.arc(coin.x + coin.size / 2, coin.y + coin.size / 2, coin.size / 2, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
