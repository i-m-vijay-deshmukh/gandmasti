const player = document.getElementById('player');
let score = 0;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let isGameOver = false;
let enemySpeed = 2;
let lastBulletTime = 0;
let canShoot = true;
let doubleBulletMode = false;
let lives = 3; // Number of lives
const maxLives = 3; // Maximum lives
let heartImages = [];

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
shootBtn.addEventListener('click', () => shootBullet());

function movePlayer(offset) {
    if (!isGameOver) {
        let x = player.offsetLeft + offset;
        player.style.left = `${x}px`;
    }
}

// Shoot bullets by pressing the spacebar
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && canShoot && !isGameOver) {
        shootBullet();
    }
});

function shootBullet() {
    if (canShoot) {
        canShoot = false;
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

        setTimeout(() => {
            canShoot = true;
        }, 500);
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

// Decrease lives and check for game over
function checkLives() {
    lives -= 1;
    if (lives <= 0) {
        endGame();
    } else {
        updateLivesDisplay();
    }
}

// Update lives display with heart images
function updateLivesDisplay() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = ''; // Clear previous hearts
    for (let i = 0; i < lives; i++) {
        const heartImg = document.createElement('img');
        heartImg.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Heart_icon_red.svg/1024px-Heart_icon_red.svg.png';
        heartImg.classList.add('heart');
        livesContainer.appendChild(heartImg);
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
                checkLives(); // Decrease life on hit
                bullet.remove(); // Remove bullet on hit
                enemyBullets.splice(index, 1);
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
}

function endGame() {
    isGameOver = true;
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = score;
}

// Spawn enemies every 2 seconds
setInterval(createEnemy, 2000);

// Start game loop
updateGame();
