const player = document.getElementById('player');
let score = 0;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let isGameOver = false;
let enemySpeed = 2; // Initial speed of the enemy planes
let lastBulletTime = 0;
let canShoot = true;
let doubleBulletMode = false; // Double bullet power-up
let backgroundColors = ['#87CEEB', '#FFD700', '#FF6347', '#6A5ACD']; // Different background colors
let currentBackgroundIndex = 0;
let isPowerUpActive = false;
let lives = 3; // Number of player lives
const heartImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Heart_icon.svg/2048px-Heart_icon.svg.png'; // URL for heart image

// Mobile controls
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const shootBtn = document.getElementById('shoot-btn');

// Function to control the player's movement
document.addEventListener('mousemove', (event) => {
    if (!isGameOver) {
        let x = event.clientX - player.clientWidth / 2;
        player.style.left = `${x}px`;
    }
});

// Control player via buttons on mobile
leftBtn.addEventListener('click', () => movePlayer(-10));
rightBtn.addEventListener('click', () => movePlayer(10));
shootBtn.addEventListener('touchstart', () => shootBullet());
shootBtn.addEventListener('touchend', () => canShoot = true); // Release button to stop shooting

function movePlayer(offset) {
    if (!isGameOver) {
        let x = player.offsetLeft + offset;
        player.style.left = `${x}px`;
    }
}

// Automatic shooting
setInterval(() => {
    if (!isGameOver && canShoot) {
        shootBullet();
    }
}, 300); // Shoot every 300 ms

function shootBullet() {
    if (canShoot) {
        canShoot = false; // Prevent multiple bullets at once
        const bullet = document.createElement('div');
        bullet.classList.add('bullet');
        bullet.style.left = `${player.offsetLeft + player.clientWidth / 2 - 2}px`;
        bullet.style.bottom = `${player.clientHeight}px`;

        document.body.appendChild(bullet);
        bullets.push(bullet);

        if (doubleBulletMode) {
            // Fire double bullet
            const secondBullet = bullet.cloneNode(true);
            secondBullet.style.left = `${player.offsetLeft + player.clientWidth / 2 + 20}px`;
            document.body.appendChild(secondBullet);
            bullets.push(secondBullet);
        }
    }
}

function createEnemy() {
    if (!isGameOver) {
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        enemy.style.left = `${Math.random() * window.innerWidth}px`;
        enemy.style.top = '0px';

        document.body.appendChild(enemy);
        enemies.push(enemy);
    }
}

function shootEnemyBullet(enemy) {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${enemy.offsetLeft + enemy.clientWidth / 2 - 2}px`;
    bullet.style.top = `${enemy.offsetTop + enemy.clientHeight}px`;
    bullet.style.backgroundColor = 'red';

    document.body.appendChild(bullet);
    enemyBullets.push(bullet);
}

// Increase enemy speed based on the score
function increaseEnemySpeed() {
    if (score % 100 === 0) {
        enemySpeed += 1;
        changeBackgroundColor(); // Change background color
    }
}

// Update game loop
function updateGame() {
    if (!isGameOver) {
        // Move bullets up
        bullets.forEach((bullet, index) => {
            bullet.style.bottom = `${parseInt(bullet.style.bottom) + 10}px`;

            if (parseInt(bullet.style.bottom) > window.innerHeight) {
                bullet.remove();
                bullets.splice(index, 1);
            }
        });

        // Move enemy bullets down
        enemyBullets.forEach((bullet, index) => {
            bullet.style.top = `${parseInt(bullet.style.top) + 7}px`;

            if (parseInt(bullet.style.top) > window.innerHeight) {
                bullet.remove();
                enemyBullets.splice(index, 1);
            }

            // Check if enemy bullet hits the player
            if (isCollision(bullet, player)) {
                loseLife(); // Decrease life instead of ending the game
                bullet.remove();
                enemyBullets.splice(index, 1); // Remove the bullet on hit
            }
        });

        // Move enemies down
        enemies.forEach((enemy, index) => {
            enemy.style.top = `${parseInt(enemy.style.top) + enemySpeed}px`;

            if (parseInt(enemy.style.top) > window.innerHeight) {
                endGame();
            }

            // Check for collisions between bullets and enemies
            bullets.forEach((bullet, bulletIndex) => {
                if (isCollision(bullet, enemy)) {
                    bullet.remove();
                    enemy.remove();
                    bullets.splice(bulletIndex, 1);
                    enemies.splice(index, 1);
                    updateScore();
                }
            });

            // Randomly fire bullets from enemies
            if (Math.random() < 0.01) {
                shootEnemyBullet(enemy);
            }
        });

        requestAnimationFrame(updateGame);
    }
}

function isCollision(obj1, obj2) {
    const obj1Rect = obj1.getBoundingClientRect();
    const obj2Rect = obj2.getBoundingClientRect();

    return !(
        obj1Rect.bottom < obj2Rect.top ||
        obj1Rect.top > obj2Rect.bottom ||
        obj1Rect.right < obj2Rect.left ||
        obj1Rect.left > obj2Rect.right
    );
}

function updateScore() {
    score += 10;
    document.getElementById('score').textContent = score;
    increaseEnemySpeed();
}

function changeBackgroundColor() {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundColors.length;
    document.body.style.backgroundColor = backgroundColors[currentBackgroundIndex];
}

function endGame() {
    isGameOver = true;
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = score;
}

// Function to lose a life
function loseLife() {
    lives -= 1;
    updateLivesDisplay();
    if (lives <= 0) {
        endGame(); // End the game if no lives are left
    }
}

// Function to update lives display
function updateLivesDisplay() {
    const livesDisplay = document.getElementById('lives');
    livesDisplay.innerHTML = ''; // Clear previous hearts
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('img');
        heart.src = heartImageUrl;
        heart.classList.add('heart');
        livesDisplay.appendChild(heart);
    }
}

// Spawn enemies every 2 seconds
setInterval(createEnemy, 2000);

// Start game loop
updateGame();
