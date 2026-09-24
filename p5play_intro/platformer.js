let player;
let platforms;
let coins;
let goal;
let score = 0;
let gameWon = false;

function setup() {
  new Canvas(900, 500);
  background(17, 23, 38);
  world.gravity.y = 1500;

  platforms = new Group();
  platforms.collider = 'static';
  platforms.color = '#7bd389';

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
    coin.color = '#ffd166';
    coins.add(coin);
  }

  goal = new Sprite(1820, 110, 24, 80);
  goal.collider = 'static';
  goal.color = '#8ecae6';

  player = new Sprite(80, 410, 30, 42);
  player.collider = 'dynamic';
  player.color = '#4cc9f0';
  player.rotationLock = true;
  player.bounciness = 0;
  player.maxSpeed = 500;
  player.drag = 0.85;
}

function createPlatform(x, y, w, h) {
  const platform = new Sprite(x, y, w, h);
  platform.collider = 'static';
  platform.color = '#7bd389';
  platforms.add(platform);
}

function draw() {
  background(17, 23, 38);

  if (!gameWon) {
    if (kb.pressing('left') || kb.pressing('a')) {
      player.vel.x = -260;
    }
    else if (kb.pressing('right') || kb.pressing('d')) {
      player.vel.x = 260;
    }
    else {
      player.vel.x *= 0.8;
    }

    if ((kb.presses('up') || kb.presses('w') || kb.presses('space')) && player.colliding(platforms)) {
      player.vel.y = -680;
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
