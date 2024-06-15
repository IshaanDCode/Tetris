const canvas = document.getElementById('game-board');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const restartButton = document.getElementById('restart-button');
const grid = 30;
const rows = 20;
const cols = 10;
let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 1000;
let lastDropTime = Date.now();

const colors = ['#00f0f0', '#f0f000', '#f0a000', '#a000f0', '#0000f0', '#00f000', '#f00000'];

const shapes = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1]], // T
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 1, 1], [1]], // L
    [[1, 1, 1], [0, 0, 1]] // J
];

let currentPiece;

function resetPiece() {
    const random = Math.floor(Math.random() * shapes.length);
    currentPiece = {
        shape: shapes[random],
        color: colors[random],
        x: Math.floor(cols / 2) - 1,
        y: 0
    };
    if (isCollision()) {
        alert('Game Over');
        board = Array.from({ length: rows }, () => Array(cols).fill(0));
        score = 0;
        lines = 0;
        level = 1;
        dropInterval = 1000;
        updateScore();
        updateLevel();
        updateLines();
    }
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = value;
                context.fillRect(x * grid, y * grid, grid, grid);
                context.strokeRect(x * grid, y * grid, grid, grid);
            }
        });
    });
}

function drawPiece() {
    context.fillStyle = currentPiece.color;
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                context.fillRect((currentPiece.x + dx) * grid, (currentPiece.y + dy) * grid, grid, grid);
                context.strokeRect((currentPiece.x + dx) * grid, (currentPiece.y + dy) * grid, grid, grid);
            }
        });
    });
}

function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;

    if (isCollision()) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        if (dy !== 0) {
            mergePiece();
            resetPiece();
        }
    }
}

function rotatePiece() {
    const tempShape = currentPiece.shape.map((row, y) =>
        row.map((value, x) => currentPiece.shape[currentPiece.shape.length - 1 - x][y])
    );
    const originalX = currentPiece.x;
    currentPiece.shape = tempShape;
    if (isCollision()) {
        currentPiece.x = originalX - 1;
        if (isCollision()) {
            currentPiece.x = originalX + 1;
            if (isCollision()) {
                currentPiece.shape = tempShape.map((row, y) =>
                    row.map((value, x) => currentPiece.shape[x][currentPiece.shape.length - 1 - y])
                );
            }
        }
    }
}

function mergePiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[currentPiece.y + dy][currentPiece.x + dx] = currentPiece.color;
            }
        });
    });

    let clearedRows = 0;
    board = board.filter(row => {
        if (row.every(value => value !== 0)) {
            clearedRows++;
            return false;
        }
        return true;
    });

    for (let i = 0; i < clearedRows; i++) {
        board.unshift(Array(cols).fill(0));
    }

    score += clearedRows * 10;
    lines += clearedRows;
    if (lines >= level * 10) {
        level++;
        dropInterval -= 100;
    }

    updateScore();
    updateLines();
    updateLevel();
}

function updateScore() {
    scoreElement.innerText = score;
}

function updateLines() {
    linesElement.innerText = lines;
}

function updateLevel() {
    levelElement.innerText = level;
}

function isCollision() {
    return currentPiece.shape.some((row, dy) =>
        row.some((value, dx) => {
            const newX = currentPiece.x + dx;
            const newY = currentPiece.y + dy;
            return (
                value &&
                (newX < 0 || newX >= cols || newY >= rows || board[newY][newX])
            );
        })
    );
}

function gameLoop() {
    const now = Date.now();
    if (now - lastDropTime > dropInterval) {
        movePiece(0, 1);
        lastDropTime = now;
    }
    drawBoard();
    drawPiece();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        movePiece(-1, 0);
    } else if (event.keyCode === 39) {
        movePiece(1, 0);
    } else if (event.keyCode === 40) {
        movePiece(0, 1);
    } else if (event.keyCode === 38) {
        rotatePiece();
    }
});

restartButton.addEventListener('click', () => {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    updateScore();
    updateLines();
    updateLevel();
    resetPiece();
});

resetPiece();
updateScore();
updateLines();
updateLevel();
gameLoop();
