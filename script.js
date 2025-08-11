// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const bonusMessage = document.getElementById('bonusMessage');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const blockchainStatus = document.getElementById('blockchainStatus');
const pharosBonus = document.getElementById('pharosBonus');
const blocksenseBonus = document.getElementById('blocksenseBonus');

// Game Settings
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 4;
const BULLET_SPEED = 10;
const NUM_ENEMIES = 5;

// Game State
let gameRunning = false;
let gameStarted = false;
let score = 0;
let pharosUnlocked = false;
let blocksenseUnlocked = false;
let blockchainSubmitted = false;

// Player
let player = {
    x: GAME_WIDTH / 2 - 32,
    y: GAME_HEIGHT - 100,
    width: 64,
    height: 64,
    speed: PLAYER_SPEED
};

// Enemies
let enemies = [];
for (let i = 0; i < NUM_ENEMIES; i++) {
    enemies.push({
        x: Math.random() * (GAME_WIDTH - 40),
        y: Math.random() * -600 - 40,
        width: 40,
        height: 40
    });
}

// Bullets
let bullets = [];

// Images
let playerImage = new Image();
let pharosImage = new Image();
let blocksenseImage = new Image();

// Load Images
playerImage.src = 'assets/player.png';
pharosImage.src = 'assets/pharos.jpg';
blocksenseImage.src = 'assets/blocksense.jpg';

// Keyboard State
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false,
    Enter: false
};

// Keyboard Events
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.key === 'ArrowRight') keys.ArrowRight = true;
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (gameRunning) {
            keys.Space = true;
        }
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        keys.Enter = true;
        if (!gameStarted) {
            startGame();
        } else if (gameOverScreen.classList.contains('hidden') && !gameRunning) {
            startGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.key === 'ArrowRight') keys.ArrowRight = false;
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
    if (e.key === ' ') {
        e.preventDefault();
        keys.Space = false;
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        keys.Enter = false;
    }
});

// Button Events
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);

// Start Game
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        startScreen.classList.add('hidden');
        updateScore();
    } else if (gameOverScreen.classList.contains('hidden') && !gameRunning) {
        gameRunning = true;
    }
}

// Reset Game
function resetGame() {
    gameRunning = true;
    score = 0;
    pharosUnlocked = false;
    blocksenseUnlocked = false;
    blockchainSubmitted = false;
    
    // Hide bonus messages
    pharosBonus.classList.add('hidden');
    blocksenseBonus.classList.add('hidden');
    
    player.x = GAME_WIDTH / 2 - 32;
    player.y = GAME_HEIGHT - 100;
    
    enemies = [];
    for (let i = 0; i < NUM_ENEMIES; i++) {
        enemies.push({
            x: Math.random() * (GAME_WIDTH - 40),
            y: Math.random() * -600 - 40,
            width: 40,
            height: 40
        });
    }
    
    bullets = [];
    bonusMessage.textContent = '';
    gameOverScreen.classList.add('hidden');
    blockchainStatus.textContent = 'Sending score to blockchain automatically...';
    blockchainStatus.className = 'info';
    document.getElementById('transactionInfo').classList.add('hidden');
    
    updateScore();
}

// Update Score
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Show Bonus Message (temporary)
function showBonusMessage(message) {
    bonusMessage.textContent = message;
    setTimeout(() => {
        if (bonusMessage.textContent === message) {
            bonusMessage.textContent = '';
        }
    }, 3000);
}

// Show Game Over Screen
async function showGameOver() {
    gameRunning = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
    
    // Reset blockchain section
    blockchainStatus.textContent = 'Sending score to blockchain automatically...';
    blockchainStatus.className = 'info';
    document.getElementById('transactionInfo').classList.add('hidden');
    
    // Automatically send score to blockchain
    setTimeout(async () => {
        if (!blockchainSubmitted) {
            await sendScoreToBlockchain();
        }
    }, 1000); // 1 second after game over
}

// Send Score to Blockchain
async function sendScoreToBlockchain() {
    try {
        // Web3 integration
        if (typeof submitScoreToBlockchain === 'function') {
            const result = await submitScoreToBlockchain(score);
            
            if (result.success) {
                blockchainStatus.textContent = 'Score sent successfully!';
                blockchainStatus.className = 'success';
                blockchainSubmitted = true;
                
                // Show transaction info
                const transactionInfo = document.getElementById('transactionInfo');
                const transactionLink = document.getElementById('transactionLink');
                
                transactionLink.textContent = result.txHash.substring(0, 20) + '...';
                transactionLink.href = `https://pharos-testnet.blocksense.ai/tx/${result.txHash}`;
                
                transactionInfo.classList.remove('hidden');
                
            } else {
                blockchainStatus.textContent = `Error: ${result.error}`;
                blockchainStatus.className = 'error';
            }
        } else {
            blockchainStatus.textContent = 'Web3 not available. Please install MetaMask.';
            blockchainStatus.className = 'error';
        }
    } catch (error) {
        blockchainStatus.textContent = `Error: ${error.message}`;
        blockchainStatus.className = 'error';
    }
}

// Move Player
function movePlayer() {
    if (keys.ArrowLeft) player.x -= player.speed;
    if (keys.ArrowRight) player.x += player.speed;
    if (keys.ArrowUp) player.y -= player.speed;
    if (keys.ArrowDown) player.y += player.speed;
    
    // Boundary Check
    player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(GAME_HEIGHT - player.height, player.y));
}

// Fire Bullet
function fireBullet() {
    if (keys.Space) {
        keys.Space = false; // One-time fire
        bullets.push({
            x: player.x + player.width / 2 - 15,
            y: player.y,
            width: 30,
            height: 30
        });
    }
}

// Move Bullets
function moveBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= BULLET_SPEED;
        
        // Remove bullets that go off-screen
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Move Enemies
function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += ENEMY_SPEED;
        
        // Reposition enemies that go off-screen
        if (enemies[i].y > GAME_HEIGHT) {
            enemies[i].x = Math.random() * (GAME_WIDTH - 40);
            enemies[i].y = Math.random() * -100 - 40;
        }
    }
}

// Check Collisions
function checkCollisions() {
    // Player-enemy collision
    for (let i = 0; i < enemies.length; i++) {
        if (isColliding(player, enemies[i])) {
            showGameOver();
            return;
        }
    }
    
    // Bullet-enemy collision
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (isColliding(bullets[i], enemies[j])) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                
                // Create new enemy
                enemies.push({
                    x: Math.random() * (GAME_WIDTH - 40),
                    y: Math.random() * -100 - 40,
                    width: 40,
                    height: 40
                });
                
                score++;
                updateScore();
                
                // Bonus check
                if (score >= 5 && !pharosUnlocked) {
                    pharosUnlocked = true;
                    pharosBonus.classList.remove('hidden');
                    pharosBonus.classList.add('pharos');
                    showBonusMessage('BONUS: FOLLOW Pharos on X');
                }
                
                if (score >= 10 && pharosUnlocked && !blocksenseUnlocked) {
                    blocksenseUnlocked = true;
                    blocksenseBonus.classList.remove('hidden');
                    blocksenseBonus.classList.add('blocksense');
                    showBonusMessage('BONUS: FOLLOW Blocksense on X');
                }
                
                break;
            }
        }
    }
}

// Collision Detection Function
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Draw Game
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw player
    if (playerImage.complete) {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw bullets
    for (let i = 0; i < bullets.length; i++) {
        if (blocksenseImage.complete) {
            ctx.drawImage(blocksenseImage, bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
        } else {
            ctx.fillStyle = '#f00';
            ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
        }
    }
    
    // Draw enemies
    for (let i = 0; i < enemies.length; i++) {
        if (pharosImage.complete) {
            ctx.drawImage(pharosImage, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
        } else {
            ctx.fillStyle = '#00f';
            ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
        }
    }
}

// Main Game Loop
function gameLoop() {
    if (gameRunning) {
        movePlayer();
        fireBullet();
        moveBullets();
        moveEnemies();
        checkCollisions();
        drawGame();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize Game
window.onload = function() {
    updateScore();
    gameLoop();
};