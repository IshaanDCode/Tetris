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
let currentPiece;

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
    
