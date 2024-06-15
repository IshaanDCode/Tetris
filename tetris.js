const canvas = document.getElementById('game-board');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const rotateButton = document.getElementById('rotate-button');
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
    [[1, 1, 1], [1, 0, 0]], // L
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

    context.strokeStyle = '#ddd';
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            context.strokeRect(x * grid, y * grid, grid, grid);
        }
    }
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
    const originalShape = currentPiece.shape;
    const N = currentPiece.shape.length;
    // Create a new empty matrix for the rotated shape
    let rotatedShape = Array.from({ length: N }, () => Array(N).fill(0));
    // Rotate the shape matrix 90 degrees clockwise
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            rotatedShape[j][N - 1 - i] = currentPiece.shape[i][j];
        }
    }

    currentPiece.shape = rotatedShape;

    // Check for collision after rotation
    let offset = 0;
    while (isCollision()) {
        currentPiece.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (Math.abs(offset) > currentPiece.shape[0].length) {
            currentPiece.shape = originalShape;
            currentPiece.x = Math.min(Math.max(currentPiece.x, 0), cols - currentPiece.shape[0].length);
            return;
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
    if (event.keyCode === 37) { // Left arrow key
        movePiece(-1, 0);
        event.preventDefault(); // Prevent default scroll behavior
    } else if (event.keyCode === 39) { // Right arrow key
        movePiece(1, 0);
        event.preventDefault(); // Prevent default scroll behavior
    } else if (event.keyCode === 40) { // Down arrow key
        movePiece(0, 1);
        event.preventDefault(); // Prevent default scroll behavior
    } else if (event.keyCode === 38) { // Up arrow key
        rotatePiece();
        event.preventDefault(); // Prevent default scroll behavior
    }
});

rotateButton.addEventListener('click', () => {
    rotatePiece();
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
//