const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
let gameRunning = false;

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const AI_SPEED = 5;
const BALL_SPEED_INIT = 5;

// Game objects
let playerScore = 0;
let computerScore = 0;

let playerPaddle = {
    x: 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

let computerPaddle = {
    x: canvas.width - PADDLE_WIDTH - 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: BALL_SIZE,
    dx: BALL_SPEED_INIT,
    dy: BALL_SPEED_INIT,
    speed: BALL_SPEED_INIT
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Event listeners for buttons
startBtn.addEventListener('click', toggleGame);
resetBtn.addEventListener('click', resetScore);

function toggleGame() {
    gameRunning = !gameRunning;
    startBtn.textContent = gameRunning ? 'Pause Game' : 'Resume Game';
    if (gameRunning) {
        gameLoop();
    }
}

function resetScore() {
    playerScore = 0;
    computerScore = 0;
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
    resetBall();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED_INIT;
    ball.dy = (Math.random() - 0.5) * BALL_SPEED_INIT;
}

function updatePlayerPaddle() {
    // Arrow keys control
    if (keys['ArrowUp']) {
        playerPaddle.y -= PADDLE_SPEED;
    }
    if (keys['ArrowDown']) {
        playerPaddle.y += PADDLE_SPEED;
    }

    // Mouse control
    const targetY = mouseY - PADDLE_HEIGHT / 2;
    const diff = targetY - playerPaddle.y;
    if (Math.abs(diff) > 2) {
        playerPaddle.y += diff * 0.1; // Smooth mouse following
    }

    // Boundary collision for player paddle
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

function updateComputerPaddle() {
    // Simple AI: follow the ball with some lag
    const paddleCenter = computerPaddle.y + computerPaddle.height / 2;
    const diff = ball.y - paddleCenter;

    if (Math.abs(diff) > 10) {
        if (diff > 0) {
            computerPaddle.y += AI_SPEED;
        } else {
            computerPaddle.y -= AI_SPEED;
        }
    }

    // Boundary collision for computer paddle
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy = -ball.dy;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        ball.dx = -ball.dx;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
        ball.dy += hitPos * 3;

        // Slightly increase ball speed on each paddle hit
        ball.speed *= 1.02;
        ball.dx = (ball.dx > 0 ? 1 : -1) * ball.speed;
        ball.dy = Math.max(-ball.speed, Math.min(ball.speed, ball.dy));
    }

    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.x = computerPaddle.x - ball.radius;
        ball.dx = -ball.dx;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computerPaddle.y + computerPaddle.height / 2)) / (computerPaddle.height / 2);
        ball.dy += hitPos * 3;

        // Slightly increase ball speed on each paddle hit
        ball.speed *= 1.02;
        ball.dx = (ball.dx > 0 ? 1 : -1) * ball.speed;
        ball.dy = Math.max(-ball.speed, Math.min(ball.speed, ball.dy));
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        resetBall();
    }
}

function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball glow effect
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
}

function update() {
    if (!gameRunning) return;

    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
}

function gameLoop() {
    update();
    draw();

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Initial draw
draw();
