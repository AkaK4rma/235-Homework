// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

const app = new PIXI.Application();
//#region Variables
let sceneWidth, sceneHeight;

// aliases
let stage;
let assets;

// game variables
let startScene;
let instructionsScene;
let gameScene,
  ship,
  shipbox,
  boss,
  scoreLabel,
  lifeLabel,
  warpableLabel,
  gameOverScoreLabel,
  shootSound,
  pickUpSound,
  hitSound,
  hurtSound,
  explosionSound,
  colorChangeSound,
  powerUpSound;
let gameOverScene;

let power1, power2, power3 = true;
let dead = true;

let timeScale = 1;
const HITSTOP_DURATION = 0.3;

let circles = [];
let evilCircles = [];
let evilMovingCircles = [];
let bullets = [];
let explosions = [];
let explosionTextures;
let score = 0;
let shipBlue = false;
let siphonCount = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let angle = 10;

let newX;
let newY;

let fireInterval = 100;

let lastNumber = null;
let iFrames = false;
let warpable = true;
let spawnInterval = 60;
let spawnTimer = 0;

let phaseChanging = false;
let phaseChangeInterval = 5000;
let phaseChangeTimer = 0;
let phaseChangeTimer2 = 0;
let flip = true;

let spawnInterval2 = 60;
let spawnTimer2 = 0;

let attackInterval = 2500;
let attackTimer = 0;

let attackInterval2 = 1000;
let attackTimer2 = 0;

let siphonInterval = 100;
let siphonTimer = 0;

let warpInterval = 1000;
let warpTimer = 0;

let grid = [[], [], [], []];

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  s: false,
  a: false,
  d: false,
  W: false,
  S: false,
  A: false,
  D: false,
  Shift: false,
};
//#endregion

//#region Setup
document.addEventListener("keydown", (e) => {
  if (e.repeat) return; // Prevent stuttering from OS key repeat
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.repeat) return; // Prevent stuttering from OS key repeat
  if (e.code === "Space") {
    if (siphonTimer >= siphonInterval) {
      colorChangeSound.play();
      shipBlue = shipBlue ? false : true;
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
});

// Load all assets
loadImages();

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  PIXI.Assets.addBundle("sprites", {
    spaceship: "images/spaceship.png",
    explosions: "images/explosions.png",
    move: "images/move.png",
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });

  setup();
}

function createLabelsAndButtons() {
  let buttonStyle = {
    fill: "0xff0000",
    fontSize: 48,
    fontFamily: "Futura",
  };

  let startLabel1 = new PIXI.Text("Project 3", {
    fill: 0xffffff,
    fontSize: 96,
    fontFamily: "Futura",
    stroke: "0xff0000",
    strokeThickness: 6,
  });
  startLabel1.x = 125;
  startLabel1.y = 120;
  startScene.addChild(startLabel1);

  let startLabel2 = new PIXI.Text("play my game, boy..?", {
    fill: 0xffffff,
    fontSize: 32,
    fontFamily: "Futura",
    fontStyle: "italic",
    stroke: "0xff0000",
    strokeThickness: 6,
  });
  startLabel2.x = 155;
  startLabel2.y = 300;
  startScene.addChild(startLabel2);

  let startButton = new PIXI.Text("this is the play button", buttonStyle);
  startButton.x = sceneWidth / 2 - startButton.width / 2;
  startButton.y = sceneHeight - 100;
  startButton.interactive = true;
  startButton.buttonMode = true;
  startButton.on("pointerup", startGame);
  startButton.on("pointerover", (e) => (e.target.alpha = 0.7));
  startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
  startScene.addChild(startButton);

  let instructionsButton = new PIXI.Text("instructions", buttonStyle);
  instructionsButton.x = sceneWidth / 2 - instructionsButton.width / 2;
  instructionsButton.y = sceneHeight - 200;
  instructionsButton.interactive = true;
  instructionsButton.buttonMode = true;
  instructionsButton.on("pointerup", toInstructions);
  instructionsButton.on("pointerover", (e) => (e.target.alpha = 0.7));
  instructionsButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
  startScene.addChild(instructionsButton);

  let instructionsLabel = new PIXI.Text("Instructions", {
    fill: 0xffffff,
    fontSize: 96,
    fontFamily: "Futura",
    stroke: "0xff0000",
    strokeThickness: 6,
  });
  instructionsLabel.x = 75;
  instructionsLabel.y = 40;
  instructionsScene.addChild(instructionsLabel);

  let textStyle = {
    fill: 0xffffff,
    fontSize: 18,
    fontFamily: "Futura",
    stroke: 0xff0000,
    strokeThickness: 4,
  };

  let instructionsText = new PIXI.Text(
    "Hold LMB/M1 to fire \n\t\t\t\tWASD to move",
    textStyle
  );
  instructionsText.x = 75;
  instructionsText.y = 250;
  instructionsScene.addChild(instructionsText);

  let instructionsText2 = new PIXI.Text(
    "You can wrap around to \nthe other side of the grid\nto dodge attacks",
    textStyle
  );
  instructionsText2.x = 75;
  instructionsText2.y = 350;
  instructionsScene.addChild(instructionsText2);

  let instructionsText3 = new PIXI.Text(
    "The evil green circle\nhas 200 hp, make sure to\nget rid of that guy",
    textStyle
  );
  instructionsText3.x = sceneWidth - 75 - instructionsText3.width;
  instructionsText3.y = 250;
  instructionsScene.addChild(instructionsText3);

  let instructionsText4 = new PIXI.Text(
    "Press Space to absorb attacks\n(7 sec cd) after absorbing 10\nattacks you'll get an upgrade!",
    textStyle
  );
  instructionsText4.x = sceneWidth - 50 - instructionsText4.width;
  instructionsText4.y = 350;
  instructionsScene.addChild(instructionsText4);

  let backToStartButton = new PIXI.Text("main menu", buttonStyle);
  backToStartButton.x = sceneWidth / 2 - backToStartButton.width / 2;
  backToStartButton.y = sceneHeight - 100;
  backToStartButton.interactive = true;
  backToStartButton.buttonMode = true;
  backToStartButton.on("pointerup", backToStart);
  backToStartButton.on("pointerover", (e) => (e.target.alpha = 0.7));
  backToStartButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
  instructionsScene.addChild(backToStartButton);

  scoreLabel = new PIXI.Text("", textStyle);
  scoreLabel.x = 5;
  scoreLabel.y = 5;

  lifeLabel = new PIXI.Text("", textStyle);
  lifeLabel.x = 5;
  lifeLabel.y = 26;

  warpableLabel = new PIXI.Text("", textStyle);
  warpableLabel.x = 5;
  warpableLabel.y = 46;

  let grdOffsetY = 30;
  let grdOffsetX = 50;

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 5; j++) {
      let color = 0xffffff;
      let gridRect = new Grid(color, 30 + j * grdOffsetX, 180 + i * grdOffsetY);
      grid[i].push(gridRect);
      gameScene.addChild(gridRect);
    }
  }

  let gameOverText = new PIXI.Text("Game Over!\n        :-O", {
    fill: 0xffffff,
    fontSize: 64,
    fontFamily: "Futura",
    stroke: 0xff0000,
    strokeThickness: 6,
  });
  gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
  gameOverText.y = sceneHeight / 2 - 160;
  gameOverScene.addChild(gameOverText);

  gameOverScoreLabel = new PIXI.Text(``, {
    fill: "0xffffff",
    fontSize: 48,
    fontFamily: "Futura",
    fontStyle: "italic",
    stroke: "0xff0000",
    strokeThickness: 6,
  });
  gameOverScoreLabel.x = 115;
  gameOverScoreLabel.y = 400;
  gameOverScene.addChild(gameOverScoreLabel);

  let playAgainButton = new PIXI.Text("Play Again?", buttonStyle);
  playAgainButton.x = sceneWidth / 2 - playAgainButton.width / 2;
  playAgainButton.y = sceneHeight - 100;
  playAgainButton.interactive = true;
  playAgainButton.buttonMode = true;
  playAgainButton.on("pointerup", startGame);
  playAgainButton.on("pointerover", (e) => (e.target.alpha = 0.7));
  playAgainButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
  gameOverScene.addChild(playAgainButton);
}

function backToStart() {
  startScene.visible = true;
  gameOverScene.visible = false;
  instructionsScene.visible = false;
  gameScene.visible = false;
}

function toInstructions() {
  startScene.visible = false;
  instructionsScene.visible = true;
  gameOverScene.visible = false;
  gameScene.visible = false;
}

function loadSpriteSheet() {
  let spriteSheet = PIXI.Texture.from("images/explosions.png");
  let width = 64;
  let height = 64;
  let numFrames = 16;
  let textures = [];
  for (let i = 0; i < numFrames; i++) {
    let frame = new PIXI.Texture({
      source: spriteSheet,
      frame: new PIXI.Rectangle(i * width, 64, width, height),
    });
    textures.push(frame);
  }
  return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
  let w2 = frameWidth / 2;
  let h2 = frameHeight / 2;
  let expl = new PIXI.AnimatedSprite(explosionTextures);
  expl.x = x - w2;
  expl.y = y - h2;
  expl.animationSpeed = 1 / 7;
  expl.loop = false;
  expl.onComplete = end;
  explosions.push(expl);
  gameScene.addChild(expl);
  explosionSound.play();
  expl.play();
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function setup() {
  await app.init({ width: 600, height: 600 });

  document.body.appendChild(app.canvas);

  stage = app.stage;
  sceneWidth = app.renderer.width;
  sceneHeight = app.renderer.height;

  // #1 - Create the `start` scene
  startScene = new PIXI.Container();
  stage.addChild(startScene);

  // #1 - Create the `instructions` scene
  instructionsScene = new PIXI.Container();
  instructionsScene.visible = false;
  stage.addChild(instructionsScene);

  // #2 - Create the main `game` scene and make it invisible
  gameScene = new PIXI.Container();
  gameScene.visible = false;
  stage.addChild(gameScene);
  // #3 - Create the `gameOver` scene and make it invisible
  gameOverScene = new PIXI.Container();
  gameOverScene.visible = false;
  stage.addChild(gameOverScene);
  // #4 - Create labels for all 3 scenes
  createLabelsAndButtons();
  // #5 - Create ship
  ship = new Ship(assets.spaceship);
  shipbox = new ShipBox(5);

  // #6 - Load Sounds

  shootSound= new Howl({
    src: ["sounds/laserShoot.wav"],
  });

  hitSound= new Howl({
    src: ["sounds/hitHurt.wav"],
  });

  hurtSound= new Howl({
    src: ["sounds/hurtHit.wav"],
  });

  pickUpSound = new Howl({
    src: ["sounds/pickupCoin.wav"],
  });

  explosionSound= new Howl({
    src: ["sounds/explosion.wav"],
  });

  colorChangeSound= new Howl({
    src: ["sounds/powerUp.wav"],
  });

  powerUpSound= new Howl({
    src: ["sounds/powerUp2.wav"],
  });

  // #7 - Load sprite sheet
  explosionTextures = loadSpriteSheet();

  // #8 - Start update loop
  app.ticker.add(gameLoop);
  // #9 - Start listening for click events on the canvas

  // Now our `startScene` is visible
  // Clicking the button calls startGame()
}

let holdIntervalId = null;

function startAction() {
  if (holdIntervalId !== null) return;

  holdIntervalId = setInterval(function () {
    if (siphonCount < 30) {
      fireBullet();
    }
    if (siphonCount >= 30) {
      if(power1){
        power1= false
        powerUpSound.play();
      }
      fireBullet2();
    }
    if (siphonCount >= 125) {
      if(power2){
        power2 = false
        powerUpSound.play();
      }
      fireBullets();
    }
    if (siphonCount >= 200) {
      if(power3){
        power3 = false
        powerUpSound.play();
      }
      fireBullets2();
    }
  }, fireInterval);
}

function stopAction() {
  if (holdIntervalId !== null) {
    clearInterval(holdIntervalId);
    holdIntervalId = null;
  }
}

//#endregion

//#region Game Logic
function startGame() {
  startScene.visible = false;
  gameOverScene.visible = false;
  gameScene.visible = true;
  levelNum = 1;
  score = 0;
  warpable = true;
  shipBlue = false;
  siphonCount = 0;
  life = 100;
  power1, power2, power3 = true;
  gameScene.addChild(ship);
  gameScene.addChild(shipbox);
  boss = new Boss(220, 0x00ff00, sceneWidth / 2 - 150, sceneHeight / 8 - 50);
  attackInterval = 2500;
  attackInterval2 = 1000;
  gameScene.addChild(boss);
  gameScene.addChild(scoreLabel);
  gameScene.addChild(lifeLabel);
  gameScene.addChild(warpableLabel);
  boss.hp = 1500;
  dead = true;
  fireInterval = 100;
  spawnTimer = 0;
  spawnTimer2 = 0;
  attackTimer = 0;
  attackTimer2 = 0;
  siphonTimer = 0;
  phaseChangeTimer = 0;
  phaseChangeTimer2 = 0;
  ship.x = sceneWidth / 2;
  ship.y = sceneHeight - (60 + 75 / 2);
  newX = ship.x;
  newY = ship.y;
  phase1();
  setTimeout(() => {
    paused = false;
  }, 50);
}

function increaseScoreBy(value) {
  score += value;
  hitSound.play();
  if (boss) {
    scoreLabel.text = `Boss Hp: ${boss.hp}`;
  }
}

function fireBullet() {
  if (paused) return;
  let color = (shipBlue) ? 0x3f9ff0 : 0xff0000;
  let b = new Bullet(color, ship.x, ship.y);
  bullets.push(b);
  gameScene.addChild(b);
  shootSound.play();
}

function fireBullets() {
  if (paused) return;
let color = (shipBlue) ? 0x3f9ff0 : 0xff0000;
  let b;
  for (let i = 0; i < 3; i++) {
    b = new Bullet(color, ship.x + (-10 + i * 10), ship.y);
    if (i == 0) b.fwd.x = Math.cos(360);
    if (i == 2) b.fwd.x = Math.cos(-5);
    bullets.push(b);
    gameScene.addChild(b);
  }
  shootSound.play();
}

function fireBullet2() {
  if (paused) return;
  let color = (shipBlue) ? 0x3f9ff0 : 0xff0000;
  let b = new Bullet(color, ship.x, ship.y);
  let b2 = new Bullet(color, ship.x, ship.y + 12);
  bullets.push(b);
  bullets.push(b2);
  gameScene.addChild(b);
  gameScene.addChild(b2);
  shootSound.play();
}

function fireBullets2() {
  if (paused) return;
  let b;
  let color = (shipBlue) ? 0x3f9ff0 : 0xff0000;
  for (let i = 0; i < 5; i++) {
    b = new Bullet(color, ship.x + (-10 + i * 5), ship.y);
    if (i == 0) b.fwd.x = Math.cos((110 * Math.PI) / 180);
    if (i == 1) b.fwd.x = Math.cos((100 * Math.PI) / 180);
    if (i == 3) b.fwd.x = Math.cos((80 * Math.PI) / 180);
    if (i == 4) b.fwd.x = Math.cos((70 * Math.PI) / 180);
    bullets.push(b);
    gameScene.addChild(b);
  }
  shootSound.play();
}

function invincible() {
  iFrames = true;
  ship.tint = 0xff00ff;
  setTimeout(() => {
    iFrames = false;
  }, 1000);
}

function decreaseLifeBy(value) {
  if (!iFrames) {
    triggerHitStop();
    life -= value;
    hurtSound.play();
    life = parseInt(life);
    lifeLabel.text = `Life: ${life}%`;
    if (ship) invincible();
  }
}

function createSideEvilCircles() {
  let type = getRandomIntInclusive(1, 2);
  let color = type == 1 ? 0x3f9ff0 : 0xff0000;
  for (let i = 0; i < 2; i++) {
    let c = new EvilCircle(20, color);
    c.x = 100 + (sceneWidth - 100 - 40) * i;
    c.y = sceneHeight / 2 - 10;
    evilCircles.push(c);
    gameScene.addChild(c);
  }
}

function createEvilCircle() {
  let type = getRandomIntInclusive(1, 2);
  let color = type == 1 ? 0x3f9ff0 : 0xff0000;
  let c = new EvilCircle(20, color);
  c.moving = true;
  c.x = sceneWidth / 2 - 10;
  c.y = 50;
  c.speed = 75;
  evilMovingCircles.push(c);
  gameScene.addChild(c);
}

function createCircles(numCircles = 10) {
  for (let i = 0; i < numCircles; i++) {
    let c = new Circle(10);
    c.x = 100 * getRandomIntInclusive(1, 5);
    c.y = Math.random() * (sceneHeight - 400) + 25;
    circles.push(c);
    gameScene.addChild(c);
  }
}

function createRow() {
  let attack = getRandomIntInclusive(1, 2);
  switch (attack) {
    case 1:
      for (let i = 0; i < 20; i++) {
        let c = new Circle(10);
        c.x = 75 + 25 * i;
        c.y = 25 + 12.5 * i;
        c.red = true;
        circles.push(c);
        gameScene.addChild(c);
      }
      break;
    case 2:
      for (let i = 20; i > 0; i--) {
        let c = new Circle(10);
        c.x = sceneWidth - 25 - 25 * i;
        c.y = 25 + 12.5 * i;
        c.red = true;
        circles.push(c);
        gameScene.addChild(c);
      }
      break;
  }
}

function createRowBlue() {
  let attack = getRandomIntInclusive(1, 2);
  switch (attack) {
    case 1:
      for (let i = 0; i < 20; i++) {
        let c = new Circle(10, 0x3f9ff0);
        c.x = 75 + 25 * i;
        c.y = 25 + 12.5 * i;
        c.red = false;
        circles.push(c);
        gameScene.addChild(c);
      }
      break;
    case 2:
      for (let i = 20; i > 0; i--) {
        let c = new Circle(10, 0x3f9ff0);
        c.x = sceneWidth - 25 - 25 * i;
        c.y = 25 + 12.5 * i;
        c.red = false;
        circles.push(c);
        gameScene.addChild(c);
      }
      break;
  }
}

function dangerGrid() {
  let attack = getRandomIntInclusive(1, 2);
  let timers = [];
  switch (attack) {
    case 1:
      attack = getRandomIntInclusive(0, 4);
      for (let i = 0; i < 4; i++) {
        grid[i][attack].setColor("0xffff00");
        timers.push(
          setTimeout(() => {
            if (!grid[i][attack].isAttacking) {
              if (rectsIntersect(grid[i][attack], shipbox)) {
                decreaseLifeBy(20);
              }
              grid[i][attack].setColor("0xff0000");
              grid.isAttacking = true;
            }
          }, 1000)
        );
        timers.push(
          setTimeout(() => {
            if (!grid[i][attack].isAttacking)
              grid[i][attack].setColor("0xffffff");
            grid.isAttacking = false;
          }, 1500)
        );
      }
      break;
    case 2:
      attack = getRandomIntInclusive(0, 3);
      for (let i = 0; i < 5; i++) {
        grid[attack][i].setColor("0xffff00");
        timers.push(
          setTimeout(() => {
            if (rectsIntersect(grid[attack][i], shipbox)) {
              decreaseLifeBy(20);
            }
            grid[attack][i].setColor("0xff0000");
          }, 1000)
        );
        timers.push(
          setTimeout(() => {
            grid[attack][i].setColor("0xffffff");
          }, 1500)
        );
      }
      break;
  }
}

function phase1() {
  let attack;
  angle = 10;
  spawnInterval2 = 60;
  if (attackTimer >= attackInterval) {
    attackTimer = 0;
    do {
      attack = getRandomIntInclusive(1, 2);
    } while (attack === lastNumber);
    lastNumber = attack;
    switch (attack) {
      case 1:
        if (evilMovingCircles.length == 0) {
          createEvilCircle();
          setTimeout(() => {
            for (let c of evilMovingCircles) {
              gameScene.removeChild(c);
              c.IsAlive = false;
            }
          }, 6000);
        }
        break;
      case 2:
        createRow();
        break;
    }
  }
}

function phase2() {
  let attack;
  attackInterval = 2000;
  attackInterval2 = 1000;
  angle = 15;
  spawnInterval = 60;
  spawnInterval2 = 60;
  if (attackTimer >= attackInterval) {
    attackTimer = 0;
    do {
      attack = getRandomIntInclusive(1, 2);
    } while (attack === lastNumber);
    lastNumber = attack;
    switch (attack) {
      case 1:
        if (evilCircles.length == 0) {
          createSideEvilCircles();
          setTimeout(() => {
            for (let c of evilCircles) {
              gameScene.removeChild(c);
              c.IsAlive = false;
            }
          }, 2000);
        }
        break;
      case 2:
        createRow();
        setTimeout(() => {
          createRowBlue();
        }, 1000);
        break;
    }
  }
  if (attackTimer2 >= attackInterval2) {
    attackTimer2 = 0;
    attack = getRandomIntInclusive(1, 3);
    switch (attack) {
      case 1:
        break;
      case 2:
        break;
      case 3:
        dangerGrid();
        break;
    }
  }
}

function phase3() {
  let attack;
  angle = 10;
  attackInterval = 1750;
  attackInterval2 = 750;
  spawnInterval = 40;
  spawnInterval2 = 40;
  if (attackTimer >= attackInterval) {
    attackTimer = 0;
    do {
      attack = getRandomIntInclusive(1, 3);
    } while (attack === lastNumber);
    lastNumber = attack;
    switch (attack) {
      case 1:
        if (evilCircles.length == 0) {
          createSideEvilCircles();
          setTimeout(() => {
            for (let c of evilCircles) {
              gameScene.removeChild(c);
              c.IsAlive = false;
            }
          }, 4000);
        }
        break;
      case 2:
        if (evilMovingCircles.length == 0) {
          createEvilCircle();
          setTimeout(() => {
            for (let c of evilMovingCircles) {
              gameScene.removeChild(c);
              c.IsAlive = false;
            }
          }, 6000);
        }
        break;
      case 3:
        createRow();
        setTimeout(() => {
          createRowBlue();
        }, 1000);
        break;
    }
  }
  if (attackTimer2 >= attackInterval2) {
    attackTimer2 = 0;
    attack = getRandomIntInclusive(1, 3);
    switch (attack) {
      case 1:
        break;
      case 2:
        break;
      case 3:
        dangerGrid();
        break;
    }
  }
}

function gameLoop() {
  if (paused) return; // keep this commented out for now

  warpableLabel.text = warpable ? "Can Warp" : "Cannot Warp";

  app.view.addEventListener("mousedown", startAction);
  app.view.addEventListener("mouseup", stopAction);
  app.view.addEventListener("mouseleave", stopAction);

  // #1 - Calculate "delta time"
  let deltaTime = 1 / app.ticker.FPS;
  if (deltaTime > 1 / 12) deltaTime = 1 / 12;

  const scaledDeltaTime = deltaTime * timeScale;
  const scaledDeltaTimeMS = app.ticker.deltaMS * timeScale;

  // #2 - Move Ship
  let amount = 6 * scaledDeltaTime;
  let moveX = 100;
  let moveY = 60;

  if (keys.Shift) {
    if (warpTimer >= warpInterval) {
      warpable = true;
    } else {
      warpable = false;
    }
  } else {
    warpable = false;
  }

  if (keys.a || keys.A || keys.ArrowLeft) {
    newX -= moveX;
    if (newX <= 90) {
      if (warpable) {
        ship.x = 500;
        newX = ship.x;
        warpable = false;
        warpTimer = 0;
      } else {
        newX = 100;
      }
    }
    keys.a = false;
    keys.A = false;
    keys.ArrowLeft = false;
  }
  if (keys.d || keys.D || keys.ArrowRight) {
    newX += moveX;
    if (newX >= 510) {
      if (warpable) {
        ship.x = 100;
        newX = ship.x;
        warpable = false;
        warpTimer = 0;
      } else {
        newX = 500;
      }
    }
    keys.d = false;
    keys.D = false;
    keys.ArrowRight = false;
  }
  if (keys.w || keys.W || keys.ArrowUp) {
    if (newY > 440) {
      newY -= moveY;
      keys.w = false;
      keys.W = false;
      keys.ArrowUp = false;
    }
  }
  if (keys.s || keys.S || keys.ArrowDown) {
    if (newY < 510) {
      newY += moveY;
      keys.s = false;
      keys.S = false;
      keys.ArrowDown = false;
    }
  }

  let w2 = ship.width / 2;
  let h2 = ship.height / 2;

  let lerpX = lerp(ship.x, newX, amount);
  let lerpY = lerp(ship.y, newY, amount);
  ship.x = clamp(lerpX, 65 + w2, sceneWidth - w2);
  ship.y = clamp(lerpY, 0 + h2, sceneHeight - h2);
  shipbox.x = ship.x;
  shipbox.y = ship.y;

  // #3 - Move Circles

  spawnTimer += scaledDeltaTimeMS;
  spawnTimer2 += scaledDeltaTimeMS;
  attackTimer += scaledDeltaTimeMS;
  attackTimer2 += scaledDeltaTimeMS;
  siphonTimer += scaledDeltaTimeMS;
  warpTimer += scaledDeltaTimeMS;

  if (spawnTimer >= spawnInterval) {
    for (let i = 0; i < 2; i++) {
      if (evilCircles[i] != null) {
        let newC = new Circle(10, evilCircles[i].color);
        newC.red = evilCircles[i].color == 0x3f9ff0 ? false : true;
        newC.x = evilCircles[i].x;
        newC.y = evilCircles[i].y;
        newC.fwd.x = evilCircles[i].fwd.x;
        newC.fwd.y = evilCircles[i].fwd.y;
        circles.push(newC);
        gameScene.addChild(newC);
      }
    }
    spawnTimer = 0;
  }

  if (spawnTimer2 >= spawnInterval2) {
    for (let i = 0; i < 2; i++) {
      if (evilMovingCircles[i] != null) {
        let newC = new Circle(10, evilMovingCircles[i].color);
        newC.red = evilMovingCircles[i].color == 0x3f9ff0 ? false : true;
        newC.x = evilMovingCircles[i].x;
        newC.y = evilMovingCircles[i].y;
        newC.speed = 200;
        newC.fwd.x = evilMovingCircles[i].fwd.x;
        newC.fwd.y = evilMovingCircles[i].fwd.y;
        circles.push(newC);
        gameScene.addChild(newC);
      }
    }
    spawnTimer2 = 0;
  }

  for (let c of evilCircles) {
    c.rotate(scaledDeltaTime, angle);
  }

  for (let c of evilMovingCircles) {
    c.rotate(scaledDeltaTime, angle);
    if (c.moving) c.move(scaledDeltaTime);
  }

  for (let c of circles) {
    c.move(scaledDeltaTime);
    if (c.x <= c.radius || c.x >= sceneWidth + c.radius) {
      gameScene.removeChild(c);
      c.IsAlive = false;
    }
    if (c.x <= c.radius || c.x <= 0 - c.radius) {
      gameScene.removeChild(c);
      c.IsAlive = false;
    }

    if (c.y <= c.height || c.y >= sceneHeight + c.radius) {
      gameScene.removeChild(c);
      c.IsAlive = false;
    }

    if (c.y <= c.height || c.y <= 0 - c.radius) {
      gameScene.removeChild(c);
      c.IsAlive = false;
    }
  }

  // #4 - Move Bullets
  for (let b of bullets) {
    b.move(scaledDeltaTime);
  }

  // #5 - Check for Collisions

  if (shipBlue) {
    if(!iFrames) ship.tint = 0x3f9ff0;
  } else {
    if(!iFrames) ship.tint = 0xff0000;
  }

  for (let c of circles) {
    if (c.IsAlive && rectsIntersect(c, shipbox)) {
      gameScene.removeChild(c);
      c.IsAlive = false;
      if ((!shipBlue && !c.red) || (shipBlue && c.red)) {
        
        decreaseLifeBy(20);
        break;
      } else {
        siphonCount++;
        pickUpSound.play();
        break;
      }
    }
  }

  for (let row of grid) {
    for (let g of row) {
      if (rectsIntersect(g, shipbox)) {
        g.PlayerOn = true;
      } else {
        g.PlayerOn = false;
      }
    }
  }

  for (let b of bullets) {
    if (rectsIntersect(boss, b)) {
      if (boss.hp == 0) gameScene.removeChild(boss);
      boss.IsAlive = false;
      gameScene.removeChild(b);
      b.IsAlive = false;
      if (!phaseChanging) {
        increaseScoreBy(1);
        boss.decreaseHp();
      }
      break;
    }
  }

  // #6 - Now do some clean up

  bullets = bullets.filter((b) => b.IsAlive);

  circles = circles.filter((c) => c.IsAlive);

  evilCircles = evilCircles.filter((c) => c.IsAlive);

  evilMovingCircles = evilMovingCircles.filter((c) => c.IsAlive);

  explosions = explosions.filter((e) => e.IsAlive);
  // #7 - Is game over?
  if (life <= 0) {
    createExplosion(ship.x,ship.y,64,64);
    gameScene.removeChild(ship);
    notDead = false;
    return;
  }
  if (boss.hp <= 0) {
    win();
    return;
  }

  // #8 - Load next level
  if (boss.hp > 1200) {
    phase1();
  }
  if (boss.hp <= 1200 && boss.hp > 600) {
    phaseChangeTimer += scaledDeltaTimeMS;
    if (phaseChangeTimer < phaseChangeInterval) {
      phaseChanging = true;
      clear();
      let curhp = boss.hp;
      let curradius = lerp(boss.radius, 150, 2 * scaledDeltaTime);
      gameScene.removeChild(boss);
      boss = new Boss(
        curradius,
        0x00ff00,
        sceneWidth / 2 - 150,
        sceneHeight / 8 - 50
      );
      boss.hp = curhp;
      gameScene.addChild(boss);
    } else {
      phaseChanging = false;
    }

    if (phaseChangeTimer > phaseChangeInterval) {
      phase2();
    }
  }
  if (boss.hp <= 600 && boss.hp > 0) {
    phaseChangeTimer2 += scaledDeltaTimeMS;
    if (phaseChangeTimer2 < phaseChangeInterval) {
      phaseChanging = true;
      clear();
      let curhp = boss.hp;
      let curradius = lerp(boss.radius, 100, 2 * scaledDeltaTime);
      gameScene.removeChild(boss);
      boss = new Boss(
        curradius,
        0x00ff00,
        sceneWidth / 2 - 150,
        sceneHeight / 8 - 50
      );
      boss.hp = curhp;
      gameScene.addChild(boss);
    } else {
      phaseChanging = false;
    }

    if (boss.x <= -50) {
      flip = true;
    }
    if (boss.x >= 300) {
      flip = false;
    }

    if (flip) {
      boss.x += 100 * scaledDeltaTime;
    }

    if (!flip) {
      boss.x -= 100 * scaledDeltaTime;
    }

    if (phaseChangeTimer2 > phaseChangeInterval) {
      phase3();
    }
  }
}

function triggerHitStop() {
  if (timeScale === 0.1) return;

  timeScale = 0.1;

  setTimeout(() => {
    timeScale = 1;
  }, HITSTOP_DURATION * 1000);
}

function clear() {
  circles.forEach((c) => gameScene.removeChild(c));
  circles = [];

  evilCircles.forEach((c) => gameScene.removeChild(c));
  evilCircles = [];

  evilMovingCircles.forEach((c) => gameScene.removeChild(c));
  evilMovingCircles = [];
}

function end() {
  clear();

  bullets.forEach((b) => gameScene.removeChild(b));
  bullets = [];

  explosions.forEach((e) => gameScene.removeChild(e));
  explosions = [];

  gameScene.removeChild(boss);

  gameOverScene.visible = true;
  gameScene.visible = false;

  gameOverScoreLabel.text = `Your final score: ${score}`;
}

function win() {
  clear();

  bullets.forEach((b) => gameScene.removeChild(b));
  bullets = [];

  explosions.forEach((e) => gameScene.removeChild(e));
  explosions = [];

  gameScene.removeChild(boss);
  
  gameScene.removeChild(scoreLabel);
  gameScene.removeChild(lifeLabel);
  gameScene.removeChild(warpableLabel);

  gameOverScene.visible = true;
  gameScene.visible = false;

  gameOverScoreLabel.x = 275;
  gameOverScoreLabel.text = `You Win!`;
}
//#endregion
