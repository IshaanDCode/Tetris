const canvas = document.getElementById('game-board');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const grid = 30;
const rows = 20;
const cols = 10;
let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let score = 0;

const colors = ['#00f0f0', '#f0f000', '#f0a000', '#a000f0', '#0000f0', '#00f000', '#f00000'];

const pieces = [
    [1, 1, 1, 1], // I
    [1, 1, 1, 0, 1], // T
    [1, 1, 0, 0, 1, 1], // O
    [1, 1, 0, 1, 1], // S
    [0, 1, 1, 1, 1], // Z
    [1, 1, 1, 1, 0, 1, 1], // L
    [1, 1, 1, 0, 0, 1, 1], // J
];

let currentPiece = { shape: [], x: 0, y: 0, color: '' };

function resetPiece() {
    const random = Math.floor(Math.random() * pieces.length);
    currentPiece.shape = pieces[random].map((block, index) => {
        return block ? { x: index % 2, y: Math.floor(index / 2) } : null;
    }).filter(block => block !== null);
    currentPiece.x = Math.floor(cols / 2) - 1;
    currentPiece.y = 0;
    currentPiece.color = colors[random];
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
    currentPiece.shape.forEach(block => {
        context.fillRect((currentPiece.x + block.x) * grid, (currentPiece.y + block.y) * grid, grid, grid);
        context.strokeRect((currentPiece.x + block.x) * grid, (currentPiece.y + block.y) * grid, grid, grid);
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
            if (isCollision()) {
                alert('Game Over');
                board = Array.from({ length: rows }, () => Array(cols).fill(0));
                score = 0;
                updateScore();
            }
        }
    }
}

function rotatePiece() {
    const tempShape = currentPiece.shape.map(block => ({ x: block.y, y: -block.x }));
    const originalX = currentPiece.x;
    currentPiece.shape = tempShape;
    if (isCollision()) {
        currentPiece.x = originalX - 1;
        if (isCollision()) {
            currentPiece.x = originalX + 1;
            if (isCollision()) {
                currentPiece.shape = tempShape.map(block => ({ x: -block.y, y: block.x }));
            }
        }
    }
}

function mergePiece() {
    currentPiece.shape.forEach(block => {
        board[currentPiece.y + block.y][currentPiece.x + block.x] = currentPiece.color;
    });

    board = board.filter(row => row.some(value => value === 0)).concat(
        Array.from({ length: rows - board.filter(row => row.every(value => value !== 0)).length }, () => Array(cols).fill(0))
    );

    score += 10;
    updateScore();
}

function updateScore() {
    scoreElement.innerText = score;
}

function isCollision() {
    return currentPiece.shape.some(block => {
        const newX = currentPiece.x + block.x;
        const newY = currentPiece.y + block.y;
        return (
            newX < 0 ||
            newX >= cols ||
            newY >= rows ||
            board[newY] && board[newY][newX]
        );
    });
}

function gameLoop() {
    movePiece(0, 1);
    drawBoard();
    drawPiece();
    setTimeout(gameLoop, 500);
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

resetPiece();
updateScore();
gameLoop();
