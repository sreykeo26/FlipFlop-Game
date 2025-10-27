const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

// Bird (rectangle)
const bird = {
  x: 40,
  y: 40,
  width: 24,
  height: 20,
  gravity: 0.8,
  lift: -11,
  velocity: 0,
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
    // ground collision (handled in checkCollision too)
    if (this.y + this.height > H) {
      this.y = H - this.height;
      this.velocity = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  },
  flap() {
    this.velocity = this.lift;
  },
  draw() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // simple eye
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + this.width - 8, this.y + 4, 3, 3);
  }
};

// Pipes
const pipes = [];
const pipeWidth = 48;
const pipeGap = 120;
let frame = 0;
let score = 0;

// Ground
const groundHeight = 48;
let groundX = 0;
const groundSpeed = 2;

// Controls
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'ArrowUp') {
    bird.flap();
  }
});
document.addEventListener('mousedown', () => bird.flap()); // optional mouse

function createPipe() {
  const minTop = 20;
  const maxTop = H - pipeGap - groundHeight - 20;
  const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
  const bottomY = topHeight + pipeGap;
  pipes.push({ x: W, topHeight, bottomY, scored: false });
}

function updatePipes() {
  for (let p of pipes) p.x -= groundSpeed;
  // remove off-screen
  while (pipes.length && pipes[0].x + pipeWidth < 0) pipes.shift();
}

function drawPipes() {
  ctx.fillStyle = '#129025ff'; 
  for (let p of pipes) {
    ctx.fillRect(p.x, 0, pipeWidth, p.topHeight); // top
    ctx.fillRect(p.x, p.bottomY, pipeWidth, H - p.bottomY - groundHeight); // bottom (stop above ground)
    
    ctx.fillStyle = '#0a4b2aff';
    ctx.fillRect(p.x, p.topHeight - 8, pipeWidth, 8);
    ctx.fillRect(p.x, p.bottomY, pipeWidth, 8);
    ctx.fillStyle = '#0a9436ff';
  }
}

function checkScore() {
  for (let p of pipes) {
    if (!p.scored && p.x + pipeWidth < bird.x) {
      score++;
      p.scored = true;
    }
  }
}

function drawScore() {
  ctx.fillStyle = '#1a0c0cff';
  ctx.font = '18px Arial';
  ctx.fillText('Score: ' + score, 10, 28);
}


function drawBackground() {
  // gradient already in CSS background; we clear canvas first and draw a soft cloud band
  // but to keep everything on canvas, draw a light cloud rectangle near top
  ctx.clearRect(0, 0, W, H);
  // optional cloud stripe
  ctx.fillStyle = 'rgba(27, 192, 79, 0.06)';
  ctx.fillRect(0, 30, W, 60);
}

function drawGround() {
  // two rectangles to create scrolling ground effect
  ctx.fillStyle = '#d1723bff';
  ctx.fillRect(groundX, H - groundHeight, W, groundHeight);
  ctx.fillRect(groundX + W, H - groundHeight, W, groundHeight);
  groundX -= groundSpeed;
  if (groundX <= -W) groundX = 0;

  // small stripes to add texture
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect((i * 60 + (groundX % 60)), H - 18, 30, 4);
  }
}

// collision detection
function checkCollision() {
  // pipes
  for (let p of pipes) {
    if (
      bird.x < p.x + pipeWidth &&
      bird.x + bird.width > p.x &&
      (bird.y < p.topHeight || bird.y + bird.height > p.bottomY)
    ) {
      return true;
    }
  }
  // ground
  if (bird.y + bird.height > H - groundHeight) return true;
  // ceiling
  if (bird.y < 0) return true;
  return false;
}

// restart
const restartBtn = document.getElementById('restartBtn');
restartBtn.addEventListener('click', restartGame);

function restartGame() {
  // reset state
  bird.y = 150;
  bird.velocity = 0;
  pipes.length = 0;
  frame = 0;
  score = 0;
  groundX = 0;
  // start loop again
  if (!running) {
    running = true;
    gameLoop();
  }
}

// game loop
let running = true;
function gameLoop() {
  drawBackground();

  // update
  bird.update();
  if (frame % 100 === 0) createPipe();
  frame++;
  updatePipes();
  checkScore();

  // draw
  drawPipes();
  bird.draw();
  drawGround();
  drawScore();

  // collision
  if (checkCollision()) {
    running = false;
    // Game Over display
    ctx.fillStyle = 'rgba(103, 76, 76, 0.6)';
    ctx.fillRect(0, H / 2 - 36, W, 70);
    ctx.fillStyle = 'red';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', W / 2, H / 2 + 8);
    ctx.textAlign = 'start';
    return;
  }

  if (running) requestAnimationFrame(gameLoop);
}

// start
gameLoop();
const birdImg = new Image();
birdImg.src = '/imgs/Bird.png';

const pipeImg = new Image();
pipeImg.src = '/imgs/Pipe.png';

const backgroundImg = new Image();
backgroundImg.src = '/imgs/Background.png';
// sounds
const flapSound = new Audio('/sounds/flap.mp3');
const scoreSound = new Audio('/sounds/score.mp3');
const hitSound = new Audio('/sounds/hit.mp3');

// Optional: loop only if you want continuous play
flapSound.loop = true;
scoreSound.loop = true;
hitSound.loop = true;

flapSound.volume = 0.3;
scoreSound.volume = 0.3;
hitSound.volume = 0.3;

document.addEventListener('click', function startMusic() {
    flapSound.play().catch(err => console.log("Flap play failed:", err));
    scoreSound.play().catch(err => console.log("Score play failed:", err));
    hitSound.play().catch(err => console.log("Hit play failed:", err));
    document.removeEventListener('click', startMusic);
    });