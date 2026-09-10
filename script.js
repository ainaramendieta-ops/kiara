const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const restartButton = document.getElementById("restart");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const colors = [
    null,
    "#00ffff", // I
    "#ffff00", // O
    "#aa00ff", // T
    "#00ff66", // S
    "#ff3333", // Z
    "#3366ff", // J
    "#ff8800"  // L
];

let board;
let player;
let score;
let lives;
let gameOver;
let dropCounter;
let dropInterval;
let lastTime;


/* =========================
   CREAR TABLERO
========================= */

function createBoard() {
    return Array.from(
        { length: ROWS },
        () => Array(COLS).fill(0)
    );
}


/* =========================
   PIEZAS
========================= */

const pieces = [
    [
        [1, 1, 1, 1]
    ],

    [
        [2, 2],
        [2, 2]
    ],

    [
        [0, 3, 0],
        [3, 3, 3]
    ],

    [
        [0, 4, 4],
        [4, 4, 0]
    ],

    [
        [5, 5, 0],
        [0, 5, 5]
    ],

    [
        [6, 0, 0],
        [6, 6, 6]
    ],

    [
        [0, 0, 7],
        [7, 7, 7]
    ]
];


/* =========================
   CREAR PIEZA ALEATORIA
========================= */

function createPiece() {

    const random =
        pieces[Math.floor(Math.random() * pieces.length)];

    return random.map(row => [...row]);
}


/* =========================
   NUEVA PIEZA
========================= */

function spawnPiece() {

    player.matrix = createPiece();

    player.y = 0;

    player.x =
        Math.floor(COLS / 2) -
        Math.floor(player.matrix[0].length / 2);

    if (collides(board, player)) {
        gameOver = true;
    }
}


/* =========================
   COLISIONES
========================= */

function collides(board, player) {

    const matrix = player.matrix;

    for (let y = 0; y < matrix.length; y++) {

        for (let x = 0; x < matrix[y].length; x++) {

            if (
                matrix[y][x] !== 0 &&
                (
                    board[y + player.y] === undefined ||
                    board[y + player.y][x + player.x] === undefined ||
                    board[y + player.y][x + player.x] !== 0
                )
            ) {
                return true;
            }
        }
    }

    return false;
}


/* =========================
   UNIR PIEZA AL TABLERO
========================= */

function merge(board, player) {

    player.matrix.forEach((row, y) => {

        row.forEach((value, x) => {

            if (value !== 0) {

                board[y + player.y][x + player.x] =
                    value;
            }
        });
    });
}


/* =========================
   ELIMINAR LÍNEAS
========================= */

function sweepRows() {

    let lines = 0;

    outer:
    for (let y = ROWS - 1; y >= 0; y--) {

        for (let x = 0; x < COLS; x++) {

            if (board[y][x] === 0) {
                continue outer;
            }
        }

        board.splice(y, 1);

        board.unshift(
            new Array(COLS).fill(0)
        );

        lines++;
        y++;
    }

    if (lines > 0) {

        const points = [0, 100, 300, 500, 800];

        score += points[lines] || lines * 200;

        updateHUD();
    }
}


/* =========================
   BAJAR PIEZA
========================= */

function playerDrop() {

    player.y++;

    if (collides(board, player)) {

        player.y--;

        merge(board, player);

        sweepRows();

        spawnPiece();
    }

    dropCounter = 0;
}


/* =========================
   MOVER
========================= */

function playerMove(direction) {

    player.x += direction;

    if (collides(board, player)) {
        player.x -= direction;
    }
}


/* =========================
   ROTAR
========================= */

function rotate(matrix) {

    return matrix[0].map(
        (_, index) =>
            matrix.map(row => row[index]).reverse()
    );
}


function playerRotate() {

    const oldMatrix = player.matrix;

    player.matrix = rotate(player.matrix);

    const oldX = player.x;

    let offset = 1;

    while (collides(board, player)) {

        player.x += offset;

        offset =
            -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matrix[0].length) {

            player.matrix = oldMatrix;
            player.x = oldX;

            return;
        }
    }
}


/* =========================
   CAÍDA RÁPIDA
========================= */

function hardDrop() {

    while (!collides(board, player)) {
        player.y++;
    }

    player.y--;

    merge(board, player);

    sweepRows();

    spawnPiece();

    dropCounter = 0;
}


/* =========================
   DIBUJAR BLOQUE
========================= */

function drawBlock(x, y, color) {

    ctx.fillStyle = colors[color];

    ctx.fillRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );

    ctx.strokeStyle = "#111122";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );

    // Brillo interior
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        x * BLOCK_SIZE + 3,
        y * BLOCK_SIZE + 3,
        BLOCK_SIZE - 6,
        BLOCK_SIZE - 6
    );
}


/* =========================
   DIBUJAR MATRIZ
========================= */

function drawMatrix(matrix, offset) {

    matrix.forEach((row, y) => {

        row.forEach((value, x) => {

            if (value !== 0) {

                drawBlock(
                    x + offset.x,
                    y + offset.y,
                    value
                );
            }
        });
    });
}


/* =========================
   DIBUJAR TABLERO
========================= */

function drawBoard() {

    ctx.fillStyle = "#080817";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Rejilla
    ctx.strokeStyle =
        "rgba(0,255,255,0.07)";

    ctx.lineWidth = 1;

    for (let x = 0; x <= COLS; x++) {

        ctx.beginPath();

        ctx.moveTo(
            x * BLOCK_SIZE,
            0
        );

        ctx.lineTo(
            x * BLOCK_SIZE,
            canvas.height
        );

        ctx.stroke();
    }

    for (let y = 0; y <= ROWS; y++) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y * BLOCK_SIZE
        );

        ctx.lineTo(
            canvas.width,
            y * BLOCK_SIZE
        );

        ctx.stroke();
    }

    drawMatrix(board, { x: 0, y: 0 });

    if (!gameOver) {
        drawMatrix(player.matrix, player);
    }
}


/* =========================
   GAME OVER
========================= */

function drawGameOver() {

    ctx.fillStyle =
        "rgba(0,0,0,0.78)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#ff3cac";

    ctx.font = "bold 30px Arial";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2 - 20
    );

    ctx.fillStyle = "#00ffff";

    ctx.font = "16px Arial";

    ctx.fillText(
        "PUNTOS: " + score,
        canvas.width / 2,
        canvas.height / 2 + 20
    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "12px Arial";

    ctx.fillText(
        "Presioná REINICIAR",
        canvas.width / 2,
        canvas.height / 2 + 50
    );
}


/* =========================
   ACTUALIZAR HUD
========================= */

function updateHUD() {

    scoreElement.textContent =
        "PUNTOS: " + score;

    livesElement.textContent =
        "VIDAS: " + lives;
}


/* =========================
   GAME LOOP
========================= */

function update(time = 0) {

    const deltaTime =
        time - lastTime;

    lastTime = time;

    dropCounter += deltaTime;

    if (
        dropCounter >
        dropInterval &&
        !gameOver
    ) {
        playerDrop();
    }

    drawBoard();

    if (gameOver) {
        drawGameOver();
    }

    requestAnimationFrame(update);
}


/* =========================
   TECLADO
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (gameOver) return;

        if (
            event.key === "ArrowLeft"
        ) {

            playerMove(-1);

            event.preventDefault();
        }

        else if (
            event.key === "ArrowRight"
        ) {

            playerMove(1);

            event.preventDefault();
        }

        else if (
            event.key === "ArrowDown"
        ) {

            playerDrop();

            event.preventDefault();
        }

        else if (
            event.key === "ArrowUp"
        ) {

            playerRotate();

            event.preventDefault();
        }

        else if (
            event.code === "Space"
        ) {

            hardDrop();

            event.preventDefault();
        }
    }
);


/* =========================
   REINICIAR
========================= */

restartButton.addEventListener(
    "click",
    restartGame
);


function restartGame() {

    board = createBoard();

    score = 0;

    lives = 3;

    gameOver = false;

    dropCounter = 0;

    dropInterval = 700;

    lastTime = 0;

    player = {
        x: 0,
        y: 0,
        matrix: null
    };

    updateHUD();

    spawnPiece();
}


/* =========================
   INICIAR JUEGO
========================= */

restartGame();

update();
