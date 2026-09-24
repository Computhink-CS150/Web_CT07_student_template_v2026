let player;
let platforms;
let coins;
let goal;
let score = 0;
let gameWon = false;

function setup() {
  new Canvas(900, 500);
  background('#87CEEB');
  world.gravity.y = 240;

  platforms = new Group();
  platforms.collider = 'static';
  platforms.color = '#8b5a2b';

  createPlatform(450, 490, 1100, 40);
  createPlatform(220, 390, 220, 24);
  createPlatform(520, 310, 180, 24);
  createPlatform(820, 240, 180, 24);
  createPlatform(1120, 330, 200, 24);
  createPlatform(1425, 250, 200, 24);
  createPlatform(1700, 180, 180, 24);

  coins = new Group();
  coins.color = '#ffd166';

  const coinPositions = [
    [220, 340],
    [520, 260],
    [820, 190],
    [1120, 280],
    [1425, 200],
    [1700, 130]
  ];

  for (const [x, y] of coinPositions) {
    const coin = new Sprite(x, y, 18, 18);
    coin.collider = 'none';
    coin.color = '#f7d154';
    coin.stroke = '#d9a300';
    coin.strokeWeight = 2;
    coins.add(coin);
  }

  goal = new Sprite(1820, 110, 24, 80);
  goal.collider = 'static';
  goal.color = '#f4d35e';
  goal.stroke = '#6d4c41';
  goal.strokeWeight = 2;

  player = new Sprite(80, 410, 30, 42);
  player.collider = 'dynamic';
  player.color = '#e63946';
  player.stroke = '#1d3557';
  player.strokeWeight = 2;
  player.rotationLock = true;
  player.bounciness = 0;
  player.maxSpeed = 56;
  player.drag = 0.88;
}

function createPlatform(x, y, w, h) {
  const platform = new Sprite(x, y, w, h);
  platform.collider = 'static';
  platform.color = '#c86b2b';
  platform.stroke = '#7a3d22';
  platform.strokeWeight = 2;
  platforms.add(platform);
}

function drawMarioBackground() {
  push();
  translate(-camera.x * 0.3, 0);

  noStroke();

  fill('#dff6ff');
  drawCloud(150, 100, 70, 28);
  drawCloud(460, 120, 80, 30);
  drawCloud(830, 90, 72, 26);
  drawCloud(1220, 130, 75, 30);
  drawCloud(1560, 100, 70, 28);

  fill('#7ecb6a');
  beginShape();
  vertex(0, 500);
  vertex(80, 430);
  vertex(180, 480);
  vertex(300, 420);
  vertex(430, 490);
  vertex(560, 440);
  vertex(700, 500);
  vertex(900, 450);
  vertex(1060, 500);
  vertex(1200, 440);
  vertex(1350, 490);
  vertex(1490, 420);
  vertex(1650, 500);
  vertex(1800, 470);
  vertex(1960, 500);
  vertex(1960, 560);
  vertex(0, 560);
  endShape(CLOSE);

  fill('#5ca84f');
  rect(0, 450, 1960, 110);

  pop();
}

function drawCloud(x, y, w, h) {
  ellipse(x, y, w, h);
  ellipse(x + w * 0.35, y - h * 0.2, w * 0.8, h * 0.9);
  ellipse(x - w * 0.35, y - h * 0.2, w * 0.75, h * 0.8);
}

function draw() {
  background('#87CEEB');
  drawMarioBackground();

  if (!gameWon) {
    if (kb.pressing('left') || kb.pressing('a')) {
      player.vel.x = -36;
    }
    else if (kb.pressing('right') || kb.pressing('d')) {
      player.vel.x = 36;
    }
    else {
      player.vel.x *= 0.8;
    }

    if ((kb.presses('up') || kb.presses('w') || kb.presses('space')) && player.colliding(platforms)) {
      player.vel.y = -52;
    }

    player.collides(platforms);
    player.overlaps(coins, collectCoin);

    if (player.colliding(goal)) {
      gameWon = true;
      player.vel.x = 0;
      player.vel.y = 0;
    }
  }

  camera.x = player.x;
  camera.y = 250;

  fill(255);
  textSize(22);
  text('Coins: ' + score + ' / ' + coins.length, 20, 32);

  if (gameWon) {
    fill('#ffd166');
    textSize(42);
    text('You Win!', 350, 220);
    textSize(24);
    fill(255);
    text('Press R to restart', 340, 260);

    if (kb.presses('r')) {
      location.reload();
    }
  }

  if (player.y > height + 200) {
    player.position.x = 80;
    player.position.y = 410;
    player.vel.x = 0;
    player.vel.y = 0;
  }
}

function collectCoin(playerSprite, coin) {
  coin.remove();
  score += 1;
}
