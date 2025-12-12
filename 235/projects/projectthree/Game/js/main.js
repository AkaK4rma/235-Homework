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
  player,
  hitbox,
  playerHpBar,
  bossHpBar,
  boss,
  warpButton,
  gameOverScoreLabel,
  shootSound,
  pickUpSound,
  hitSound,
  hurtSound,
  explosionSound,
  colorChangeSound,
  powerUpSound;
let gameOverScene;

let power1 = true; 
let power2 = true; 
let power3 = true;
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
let playerBlue = false;
let siphonCount = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let angle = 10;
let notDead = true;

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

let font;
//#endregion

//#region Setup

// Setup Controls
document.addEventListener("keydown", (e) => {
  if (e.repeat) return; 
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.repeat) return; 
  if (e.code === "Space") {
    if (siphonTimer >= siphonInterval) {
      colorChangeSound.play();
      playerBlue = playerBlue ? false : true;
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
    tree: "images/tree.png",
    buttonUp: "images/ButtonUp.png",
    buttonDown: "images/ButtonDown.png",
    bossBar: "images/BossBar.png",
    playerBar: "images/PlayerBar.png",
    wizard1: "images/Wizard1.png",
    wizard2: "images/Wizard2.png",
    explosions: "images/explosions.png",
    move: "images/move.png",
    background: "images/Background.png",
    menu: "images/Menu.png",
  });

  font = await PIXI.Assets.load("fonts/Daydream.ttf");

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });

  setup();
}


// It does as the function says!
function createLabelsAndButtons() {
  //#region Main menu
  let buttonStyle = {
    fill: "0xffffff",
    fontSize: 20,
    fontFamily: "daydream",
  };

  let menuBg = new PIXI.Sprite(assets.menu)
  menuBg.tint = 0xB8FFF9;
  startScene.addChild(menuBg);

  let startLabel1 = new PIXI.Text("Geomancy", {
    fill: 0xffffff,
    fontSize: 48,
    fontFamily: "daydream",
    stroke: "0x6EB578",
    strokeThickness: 6,
  });
  startLabel1.x = sceneWidth / 2 - startLabel1.width / 2;
  startLabel1.y = 100;
  startScene.addChild(startLabel1);

  let startLabel2 = new PIXI.Text("play my game, boy..?", {
    fill: 0xffffff,
    fontSize: 20,
    fontFamily: "daydream",
    stroke: "0x6EB578",
    strokeThickness: 4,
  });
  startLabel2.x = sceneWidth / 2 - startLabel2.width / 2;
  startLabel2.y = 200;
  startScene.addChild(startLabel2);

  let startButton = new PIXI.Text("this is the play button", buttonStyle);
  startButton.x = sceneWidth / 2 - startButton.width / 2;
  startButton.y = sceneHeight - 150;
  
  let startButtonBg = new PIXI.Graphics();
  startButtonBg.lineStyle(1, "black");
  startButtonBg.beginFill(0xA6D1A5);
  startButtonBg.drawRoundedRect(0, 0, startButton.width + 20, startButton.height + 40, 20);
  startButtonBg.endFill();
  startButtonBg.x = sceneWidth / 2 - startButtonBg.width / 2;
  startButtonBg.y = startButton.y - 17.5;
  startButtonBg.interactive = true;
  startButtonBg.buttonMode = true;
  startButtonBg.on("pointerup", startGame);
  startButtonBg.on("pointerover", (e) => (e.target.alpha = 0.7));
  startButtonBg.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));

  startButton.on("pointerup", startGame);
  startButton.on("pointerover", (e) => (startButtonBg.alpha = 0.7));
  startButton.on("pointerout", (e) => (startButtonBg.alpha = 1.0));

  startScene.addChild(startButtonBg);
  startScene.addChild(startButton);

  //#endregion

  //#region Instructions menu
  let instructionsButton = new PIXI.Text("instructions", buttonStyle);
  instructionsButton.x = sceneWidth / 2 - instructionsButton.width / 2;
  instructionsButton.y = sceneHeight - 225;

  let instructionsButtonBg = new PIXI.Graphics();
  instructionsButtonBg.lineStyle(1, "black");
  instructionsButtonBg.beginFill(0xFFCB87);
  instructionsButtonBg.drawRoundedRect(0, 0, instructionsButton.width + 20, instructionsButton.height + 40, 20);
  instructionsButtonBg.endFill();
  instructionsButtonBg.x = sceneWidth / 2 - instructionsButtonBg.width / 2;
  instructionsButtonBg.y = instructionsButton.y - 17.5;
  instructionsButtonBg.interactive = true;
  instructionsButtonBg.buttonMode = true;
  instructionsButtonBg.on("pointerup", toInstructions);
  instructionsButtonBg.on("pointerover", (e) => (e.target.alpha = 0.7));
  instructionsButtonBg.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));

  instructionsButton.on("pointerup", toInstructions);
  instructionsButton.on("pointerover", (e) => (instructionsButtonBg.alpha = 0.7));
  instructionsButton.on("pointerout", (e) => (instructionsButtonBg.alpha = 1.0));

  startScene.addChild(instructionsButtonBg);
  startScene.addChild(instructionsButton);

  let instMenuBg = new PIXI.Sprite(assets.menu)
  instMenuBg.tint = 0xFFD0A1;
  instructionsScene.addChild(instMenuBg);

  let instructionsLabel = new PIXI.Text("Instructions", {
    fill: 0xffffff,
    fontSize: 48,
    fontFamily: "daydream",
  });
  instructionsLabel.x = sceneWidth / 2 - instructionsLabel.width / 2;
  instructionsLabel.y = 50;
  instructionsScene.addChild(instructionsLabel);

  let textStyle = {
    fill: 0xffffff,
    fontSize: 12,
    fontFamily: "daydream",
    align: "center"
  };

  let instructionsText = new PIXI.Text(
    "Hold LMB/M1 to fire \nWASD to move",
    textStyle
  );
  instructionsText.x = sceneWidth/2 - instructionsText.width/2;
  instructionsText.y = 165;
  instructionsScene.addChild(instructionsText);

  let instructionsText2 = new PIXI.Text(
    "You can hold shift to wrap\n around the the grid\nhorizontally to dodge attacks",
    textStyle
  );
  instructionsText2.x = sceneWidth/2 - instructionsText2.width/2;
  instructionsText2.y = 215;
  instructionsScene.addChild(instructionsText2);

  let instructionsText3 = new PIXI.Text(
    "The evil tree is the\nenemy you'll be facing,\nmake sure to get rid of that guy",
    textStyle
  );
  instructionsText3.x = sceneWidth/2 - instructionsText3.width/2;
  instructionsText3.y = 290;
  instructionsScene.addChild(instructionsText3);

  let instructionsText4 = new PIXI.Text(
    "Press Space to swap the color\n of your orb. You will absorb attacks \nwhile it is the same color as them.\n After aborbing a few attacks,\n you'll get an upgrade!",
    textStyle
  );
  instructionsText4.x = sceneWidth/2 - instructionsText4.width/2;
  instructionsText4.y = 365;
  instructionsScene.addChild(instructionsText4);

  let backToStartButton = new PIXI.Text("main menu", buttonStyle);
  backToStartButton.x = sceneWidth / 2 - backToStartButton.width / 2;
  backToStartButton.y = sceneHeight - 100;

  let backToStartButtonBg = new PIXI.Graphics();
  backToStartButtonBg.lineStyle(1, "black");
  backToStartButtonBg.beginFill(0x52BCCC);
  backToStartButtonBg.drawRoundedRect(0, 0, backToStartButton.width + 20, backToStartButton.height + 40, 20);
  backToStartButtonBg.endFill();
  backToStartButtonBg.x = sceneWidth / 2 - backToStartButtonBg.width / 2;
  backToStartButtonBg.y = backToStartButton.y - 17.5;
  backToStartButtonBg.interactive = true;
  backToStartButtonBg.buttonMode = true;
  backToStartButtonBg.on("pointerup", backToStart);
  backToStartButtonBg.on("pointerover", (e) => (e.target.alpha = 0.7));
  backToStartButtonBg.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));

  backToStartButton.on("pointerup", backToStart);
  backToStartButton.on("pointerover", (e) => (backToStartButtonBg.alpha = 0.7));
  backToStartButton.on("pointerout", (e) => (backToStartButtonBg.alpha = 1.0));

  instructionsScene.addChild(backToStartButtonBg);
  instructionsScene.addChild(backToStartButton);

  //#endregion

  //#region Game Scene
  let gameBg = new PIXI.Sprite(assets.background);
  gameScene.addChild(gameBg);

  warpButton = new PIXI.Sprite(assets.buttonUp);
  warpButton.scale.set(.2);
  warpButton.position.set(0, 0 - warpButton.height/4.5)
  gameScene.addChild(warpButton);
  decreaseLifeBy(0);

  let grdOffsetY = sceneHeight/20;
  let grdOffsetX = sceneWidth/12;

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 5; j++) {
      let color = 0xffffff;
      let gridRect = new Grid(color, 30 + j * grdOffsetX, 180 + i * grdOffsetY);
      grid[i].push(gridRect);
      gameScene.addChild(gridRect);
    }
  }
  //#endregion

  //#region GameOver Menu
  let gameOverBg = new PIXI.Sprite(assets.menu)
  gameOverBg.tint = 0xFF96B2;
  gameOverScene.addChild(gameOverBg);

  let gameOverText = new PIXI.Text("Game Over!\n:-O", {
    fill: 0xffffff,
    align: "center",
    fontSize: 48,
    fontFamily: "daydream",
  });
  gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
  gameOverText.y = sceneHeight / 2 - 160;
  gameOverScene.addChild(gameOverText);

  gameOverScoreLabel = new PIXI.Text(``, {
    fill: "0xffffff",
    fontSize: 24,
    fontFamily: "daydream",
    fontStyle: "italic",
  });
  gameOverScoreLabel.y = 400;
  gameOverScene.addChild(gameOverScoreLabel);

  let playAgainButton = new PIXI.Text("Play Again", buttonStyle);
  playAgainButton.x = sceneWidth / 2 - playAgainButton.width / 2;
  playAgainButton.y = sceneHeight - 140;
  playAgainButton.interactive = true;
  playAgainButton.buttonMode = true;

  let playAgainButtonBg = new PIXI.Graphics();
  playAgainButtonBg.lineStyle(1, "black");
  playAgainButtonBg.beginFill(0xA6D1A5);
  playAgainButtonBg.drawRoundedRect(0, 0, playAgainButton.width + 20, playAgainButton.height + 20, 20);
  playAgainButtonBg.endFill();
  playAgainButtonBg.x = sceneWidth / 2 - playAgainButtonBg.width / 2;
  playAgainButtonBg.y = playAgainButton.y - 7.5;
  playAgainButtonBg.interactive = true;
  playAgainButtonBg.buttonMode = true;
  playAgainButtonBg.on("pointerup", startGame);
  playAgainButtonBg.on("pointerover", (e) => (e.target.alpha = 0.7));
  playAgainButtonBg.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));

  playAgainButton.on("pointerup", startGame);
  playAgainButton.on("pointerover", (e) => (playAgainButtonBg.alpha = 0.7));
  playAgainButton.on("pointerout", (e) => (playAgainButtonBg.alpha = 1.0));

  gameOverScene.addChild(playAgainButtonBg);
  gameOverScene.addChild(playAgainButton);
  

  let mainMenu = new PIXI.Text("Main Menu", buttonStyle);
  mainMenu.x = sceneWidth / 2 - mainMenu.width / 2;
  mainMenu.y = sceneHeight - 90;
  mainMenu.interactive = true;
  mainMenu.buttonMode = true;

  let mainMenuButtonBg = new PIXI.Graphics();
  mainMenuButtonBg.lineStyle(1, "black");
  mainMenuButtonBg.beginFill(0x52BCCC);
  mainMenuButtonBg.drawRoundedRect(0, 0, mainMenu.width + 20, mainMenu.height + 20, 20);
  mainMenuButtonBg.endFill();
  mainMenuButtonBg.x = sceneWidth / 2 - mainMenuButtonBg.width / 2;
  mainMenuButtonBg.y = mainMenu.y - 7.5;
  mainMenuButtonBg.interactive = true;
  mainMenuButtonBg.buttonMode = true;
  mainMenuButtonBg.on("pointerup", backToStart);
  mainMenuButtonBg.on("pointerover", (e) => (e.target.alpha = 0.7));
  mainMenuButtonBg.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));

  
  mainMenu.on("pointerup", backToStart);
  mainMenu.on("pointerover", (e) => (mainMenuButtonBg.alpha = 0.7));
  mainMenu.on("pointerout", (e) => (mainMenuButtonBg.alpha = 1.0));
  
  gameOverScene.addChild(mainMenuButtonBg);
  gameOverScene.addChild(mainMenu);
  //#endregion
}

// Sets the scene back to the main menu
function backToStart() {
  startScene.visible = true;
  gameOverScene.visible = false;
  instructionsScene.visible = false;
  gameScene.visible = false;
}

// Sets the scene to the instruction scene
function toInstructions() {
  startScene.visible = false;
  instructionsScene.visible = true;
  gameOverScene.visible = false;
  gameScene.visible = false;
}

// Loads the spritesheet for the explosion texture
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

// Creates and runs the animation for the explosion
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

// IDK if there was a function like this in the utils, but I just made my own helper method
// Gets a random number between a max and min specified in the params
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// The setup of the game stage
async function setup() {
  await app.init({ width: 600, height: 600 });

  document.body.appendChild(app.canvas);

  stage = app.stage;
  sceneWidth = app.renderer.width;
  sceneHeight = app.renderer.height;

  // #1 - Create the `start` scene
  startScene = new PIXI.Container();
  stage.addChild(startScene);

  // #2 - Create the `instructions` scene and make it invisible
  instructionsScene = new PIXI.Container();
  instructionsScene.visible = false;
  stage.addChild(instructionsScene);

  // #3 - Create the main `game` scene and make it invisible
  gameScene = new PIXI.Container();
  gameScene.visible = false;
  stage.addChild(gameScene);

  // #4 - Create the `gameOver` scene and make it invisible
  gameOverScene = new PIXI.Container();
  gameOverScene.visible = false;
  stage.addChild(gameOverScene);

  // #5 - Create labels for all 4 scenes
  createLabelsAndButtons();

  // #6 - Create wizard
  player = new Player(assets.wizard1);
  hitbox = new HurtBox(5);

  // #7 - Load Sounds

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

  // #8 - Load sprite sheet
  explosionTextures = loadSpriteSheet();

  // #9 - Start update loop
  app.ticker.add(gameLoop);
}

// Setup fire interval and powerups for siphoning bullets
let holdIntervalId = null;
function startAction() {
  if (holdIntervalId !== null) return;

  holdIntervalId = setInterval(function () {
    if (siphonCount < 30) {
      fireBullet();
    }
    else if (siphonCount < 125) {
      if(power1){
        power1= false
        powerUpSound.play();
      }
      fireBullet2();
    }
    else if (siphonCount < 200) {
      if(power2){
        power2 = false
        powerUpSound.play();
      }
      fireBullets();
    }
    else{
      if(power3){
        power3 = false
        powerUpSound.play();
      }
      fireBullets2();
    }
  }, fireInterval);
}

// The function to clear the hold interval and stop firing
function stopAction() {
  if (holdIntervalId !== null) {
    clearInterval(holdIntervalId);
    holdIntervalId = null;
  }
}

//#endregion

//#region Game Logic

// Switches to the game scene and resets EVERY relevant variable
function startGame() {
  startScene.visible = false;
  gameOverScene.visible = false;
  gameScene.visible = true;
  levelNum = 1;
  score = 0;
  warpable = true;
  playerBlue = false;
  notDead = true;
  siphonCount = 0;
  life = 100;
  power1 = true; 
  power2 = true; 
  power3 = true;
  gameScene.addChild(player);
  gameScene.addChild(hitbox);
  boss = new Boss(assets.tree, 1, sceneWidth / 2, sceneHeight / 6);
  attackInterval = 2500;
  attackInterval2 = 1000;
  gameScene.addChild(boss);
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
  player.x = sceneWidth / 2;
  player.y = sceneHeight - (60 + 75 / 2);
  newX = player.x;
  newY = player.y;
  phase1();
  setTimeout(() => {
    paused = false;
  }, 50);
}

// Increases the score of the player
function increaseScoreBy(value) {
  score += value;
  if(gameScene.visible) hitSound.play();
}

// The default fire of the player
function fireBullet() {
  if (paused) return;
  if(!notDead) return;
  let color = (playerBlue) ? 0x3f9ff0 : 0xff0000;
  let b = new Bullet(color, player.x, player.y);
  bullets.push(b);
  gameScene.addChild(b);
  shootSound.play();
}

// The 2nd upgrade for of the player, fire 2 bullets in a line simultaneously
function fireBullet2() {
  if (paused) return;
  if(!notDead) return;
  let color = (playerBlue) ? 0x3f9ff0 : 0xff0000;
  let b = new Bullet(color, player.x, player.y);
  let b2 = new Bullet(color, player.x, player.y + 18);
  bullets.push(b);
  bullets.push(b2);
  gameScene.addChild(b);
  gameScene.addChild(b2);
  shootSound.play();
}

// The 3rd upgrade for of the player, fire 3 bullets cone shape
function fireBullets() {
  if (paused) return;
  if(!notDead) return;
let color = (playerBlue) ? 0x3f9ff0 : 0xff0000;
  let b;
  for (let i = 0; i < 3; i++) {
    b = new Bullet(color, player.x + (-10 + i * 10), player.y);
    if (i == 0) b.fwd.x = Math.cos((95 * Math.PI) / 180);
    if (i == 2) b.fwd.x = Math.cos((85 * Math.PI) / 180);
    bullets.push(b);
    gameScene.addChild(b);
  }
  shootSound.play();
}

// The 4th upgrade for of the player, fire 5 bullets cone shape
function fireBullets2() {
  if (paused) return;
  if(!notDead) return;
  let b;
  let color = (playerBlue) ? 0x3f9ff0 : 0xff0000;
  for (let i = 0; i < 5; i++) {
    b = new Bullet(color, player.x + (-10 + i * 5), player.y);
    if (i == 0) b.fwd.x = Math.cos((100 * Math.PI) / 180);
    if (i == 1) b.fwd.x = Math.cos((95 * Math.PI) / 180);
    if (i == 3) b.fwd.x = Math.cos((85 * Math.PI) / 180);
    if (i == 4) b.fwd.x = Math.cos((80 * Math.PI) / 180);
    bullets.push(b);
    gameScene.addChild(b);
  }
  shootSound.play();
}

// Gives the player invincibility frames
function invincible() {
  iFrames = true;
  player.tint = 0xFF8080;
  setTimeout(() => {
    iFrames = false;
    player.tint = 0xffffff;
  }, 1000);
}

// Lowers the health of the player and triggers hitstop
function decreaseLifeBy(value) {
  if (!iFrames) {
    triggerHitStop();
    life -= value;
    if(gameScene.visible) hurtSound.play();
    life = parseInt(life);
    if (player) invincible();
  }
}

// A boss attack that creates circles on the sides of the screen to attack the player
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

// A boss attack that creates a moving circle in the center of the screen to attack the player
function createEvilCircle() {
  let type = getRandomIntInclusive(1, 2);
  let color = type == 1 ? 0x3f9ff0 : 0xff0000;
  let c = new EvilCircle(20, color);
  c.moving = true;
  c.x = sceneWidth / 2;
  c.y = 50;
  c.speed = 75;
  evilMovingCircles.push(c);
  gameScene.addChild(c);
}

// A boss attack that creates a moving row of stepped circles depenedant on input color to attack the player
function createRow(red) {
  let attack = getRandomIntInclusive(1, 2);
  switch (attack) {
    case 1:
      for (let i = 0; i < 20; i++) {
        let c = (red) ? new Circle(10) : new Circle(10, 0x3f9ff0);
        c.x = 75 + 25 * i;
        c.y = 25 + 12.5 * i;
        c.red = red;
        circles.push(c);
        gameScene.addChild(c);
      }
      break;
    case 2:
      for (let i = 20; i > 0; i--) {
        let c = (red) ? new Circle(10) : new Circle(10, 0x3f9ff0);
        c.x = sceneWidth - 25 - 25 * i;
        c.y = 25 + 12.5 * i;
        c.red = red;
        circles.push(c);
        gameScene.addChild(c);
      }
      break;
  }
}

// A boss attack that attacks a row or column of the grid, unabsorbable by the player
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
              if (rectsIntersect(grid[i][attack], hitbox)) {
                decreaseLifeBy(20);
              }
              grid[i][attack].setColor("0xff0000");
            }
          }, 1000)
        );
        timers.push(
          setTimeout(() => {
              if(grid[i][attack].tint == 0xff0000) grid[i][attack].setColor("0xffffff");
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
            if (rectsIntersect(grid[attack][i], hitbox)) {
              decreaseLifeBy(20);
            }
            grid[attack][i].setColor("0xff0000");
          }, 1000)
        );
        timers.push(
          setTimeout(() => {
            if(grid[attack][i].tint == 0xff0000) grid[attack][i].setColor("0xffffff");
          }, 1500)
        );
      }
      break;
  }
}

// The function that determines the random patterns and intervals of phase 1
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
        attack = getRandomIntInclusive(1, 2);
        if(attack == 1){createRow(true);}
        else{createRow(false);}
        break;
    }
  }
}

// The function that determines the random patterns and intervals of phase 2
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
        createRow(true);
        setTimeout(() => {
          createRow(false);
        }, 1700);
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

// The function that determines the random patterns and intervals of phase 3
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
        createRow(true);
        setTimeout(() => {
          createRow(false);
        }, 1700);
        break;
    }
  }
  if (attackTimer2 >= attackInterval2) {
    attackTimer2 = 0;
    attack = getRandomIntInclusive(1, 2);
    switch (attack) {
      case 1:
        break;
      case 2:
        dangerGrid();
        break;
    }
  }
}

// Updates the display of the boss health bar
function updateBossHealthBar(healthbar) {
    const healthPercentage = boss.hp / boss.maxHP;
    healthbar.width = 248 * healthPercentage;
}

// Updates the display of the player health bar
function updatePlayerHealthBar(playerbar) {
    const healthPercentage = life / 100;
    playerbar.width = 86 * healthPercentage;
}

// Shakes the sprite a bit based on intensity
function shakeSprite(sprite, intensity,) {
    const originalX = sprite.x;
    const originalY = sprite.y;
    sprite.x = originalX + (Math.random() * 2 - 1) * intensity;
    sprite.y = originalY + (Math.random() * 2 - 1) * intensity;
}

// The function that determines the game loop
function gameLoop() {
  if (paused) return;
  if (!notDead) return;

  // Updates the texture of the top left button to show if the player can warp
  warpButton.texture = warpable ? assets.buttonDown : assets.buttonUp;

  // Sets up the controls for attacking 
  app.view.addEventListener("mousedown", startAction);
  app.view.addEventListener("mouseup", stopAction);  
  app.view.addEventListener("mouseleave", stopAction);

  // #1a - Calculate "delta time"
  let deltaTime = 1 / app.ticker.FPS;
  if (deltaTime > 1 / 12) deltaTime = 1 / 12;

  const scaledDeltaTime = deltaTime * timeScale;
  const scaledDeltaTimeMS = app.ticker.deltaMS * timeScale;

  // #1b Update timers based on scaled delta time (hitstop)
  spawnTimer += scaledDeltaTimeMS;
  spawnTimer2 += scaledDeltaTimeMS;
  attackTimer += scaledDeltaTimeMS;
  attackTimer2 += scaledDeltaTimeMS;
  siphonTimer += scaledDeltaTimeMS;
  warpTimer += scaledDeltaTimeMS;

  
  //#region  #2 - Move Player
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
        player.x = 500;
        newX = player.x;
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
        player.x = 100;
        newX = player.x;
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

  let w2 = player.width / 2;
  let h2 = player.height / 2;

  let lerpX = lerp(player.x, newX, amount);
  let lerpY = lerp(player.y, newY, amount);
  player.x = clamp(lerpX, 65 + w2, sceneWidth - w2);
  player.y = clamp(lerpY, 0 + h2, sceneHeight - h2);
  hitbox.x = player.x;
  hitbox.y = player.y;

  //#endregion

  //#region #3 - Move and Spawn Circles
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
  //#endregion

  // #4 - Move Bullets
  for (let b of bullets) {
    b.move(scaledDeltaTime);
  }

  //#region #5 - Check for Collisions

  // Changes the texture for the wizard for clarity on what "polarity" the player is
  if (playerBlue) {
    player.texture = assets.wizard2;
  } else {
    player.texture =assets.wizard1;
  }

  for (let c of circles) {
    if (c.IsAlive && rectsIntersect(c, hitbox)) {
      gameScene.removeChild(c);
      c.IsAlive = false;
      if ((!playerBlue && !c.red) || (playerBlue && c.red)) {
        
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
      if (rectsIntersect(g, hitbox)) {
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
        shakeSprite(boss, 1);
        boss.decreaseHp();
      }
      break;
    }
  }

  //#endregion

  //#region #6 - Now do some clean up

  bullets = bullets.filter((b) => b.IsAlive);

  circles = circles.filter((c) => c.IsAlive);

  evilCircles = evilCircles.filter((c) => c.IsAlive);

  evilMovingCircles = evilMovingCircles.filter((c) => c.IsAlive);

  explosions = explosions.filter((e) => e.IsAlive);
  //#endregion

  //#region #7 Create and update the players health bar
  if(playerHpBar != null) gameScene.removeChild(playerHpBar);
  playerHpBar = new PIXI.Sprite(assets.playerBar);
  playerHpBar.scale.set(.2)
  playerHpBar.x = sceneWidth - playerHpBar.width;
  playerHpBar.y = 5;
  gameScene.addChild(playerHpBar);

  if(life <= 20){
    shakeSprite(playerHpBar, 1.75);
  }
  else if(life <= 40){
    shakeSprite(playerHpBar, 1.25);
  }
  if(life <= 60){
    shakeSprite(playerHpBar, .75);
  }
  
  let playerBar = new PIXI.Graphics();
  playerBar.beginFill(0xff0000); 
  playerBar.drawRect(0, 0, 86, 4);
  playerBar.endFill();
  playerBar.position.set(playerHpBar.x + 34, playerHpBar.y + playerHpBar.height/2 - 4);
  gameScene.addChild(playerBar);
  
  updatePlayerHealthBar(playerBar);
  //#endregion

  // #8 - Check for gameover
  if (life <= 0) {
    if(notDead){
      createExplosion(player.x,player.y,64,64);
      gameScene.removeChild(player);
      notDead = false;
    }
    return;
  }
  if (boss.hp <= 0) {
    end();
    return;
  }

  //#region #9 - Check for phase changes
  if (boss.hp > 1200) {
    phase1();
  }
  if (boss.hp <= 1200 && boss.hp > 600) {
    // A quick pause until the next phase, also shrinks the hitbox of the boss
    phaseChangeTimer += scaledDeltaTimeMS;
    if (phaseChangeTimer < phaseChangeInterval) {
      phaseChanging = true;
      clear();
      let curhp = boss.hp;
      let size = lerp(boss.size, .75, 2 * scaledDeltaTime);
      gameScene.removeChild(boss);
      boss = new Boss(
        assets.tree, 
        size,
        sceneWidth / 2, 
        sceneHeight / 6
      );
      boss.hp = curhp;
      boss.size = size;
      gameScene.addChild(boss);
    } else {
      phaseChanging = false;
    }
    if (phaseChangeTimer > phaseChangeInterval) {
      phase2();
    }
  }
  if (boss.hp <= 600 && boss.hp > 0) {
    // A quick pause until the next phase, also shrinks the hitbox of the boss
    phaseChangeTimer2 += scaledDeltaTimeMS;
    if (phaseChangeTimer2 < phaseChangeInterval) {
      phaseChanging = true;
      clear();
      let curhp = boss.hp;
      let size = lerp(boss.size, .5, 2 * scaledDeltaTime);
      gameScene.removeChild(boss);
      boss = new Boss(
        assets.tree,
        size,
        sceneWidth / 2,
        sceneHeight / 6
      );
      boss.size = size;
      boss.hp = curhp;
      gameScene.addChild(boss);
    } else {
      phaseChanging = false;
    }

    // When the boss is in its final phase it will move back and forth on a track, flipping when it gets too far
    if (boss.x <= -50) {
      flip = true;
    }
    if (boss.x >= 300) {
      flip = false;
    }

    boss.x = (flip) ? boss.x + (100 * scaledDeltaTime) : boss.x - (100 * scaledDeltaTime);
    if (phaseChangeTimer2 > phaseChangeInterval) phase3();

  }

  //#endregion

  // #10 Update boss health bar AFTER phase change checks (so the healthbar wont clip under the boss while it is changing phases)
  if(bossHpBar != null) gameScene.removeChild(bossHpBar);
  bossHpBar = new PIXI.Sprite(assets.bossBar);
  bossHpBar.scale.set(.33)
  bossHpBar.x = sceneWidth/2 - bossHpBar.width/2;
  bossHpBar.y = -15;
  gameScene.addChild(bossHpBar);

  let bossBar = new PIXI.Graphics();
  bossBar.beginFill(0xff0000); 
  bossBar.drawRect(0, 0, 248, 6.5);
  bossBar.endFill();
  bossBar.position.set(bossHpBar.x + 56, bossHpBar.y + bossHpBar.height/2 - 6.5); // Same position
  gameScene.addChild(bossBar);
  
  updateBossHealthBar(bossBar);

}

// Triggers hitstop and slows down game knowledge for a second
function triggerHitStop() {
  if (timeScale === 0.1) return;

  timeScale = 0.05;

  setTimeout(() => {
    timeScale = 1;
  }, HITSTOP_DURATION * 1000);
}

// Clears all active projectiles on screen for phase changes (i could give this to the player in the form of bombs but i dont wanna :P)
function clear() {
  circles.forEach((c) => gameScene.removeChild(c));
  circles = [];

  evilCircles.forEach((c) => gameScene.removeChild(c));
  evilCircles = [];

  evilMovingCircles.forEach((c) => gameScene.removeChild(c));
  evilMovingCircles = [];

  for(let i = 0; i < grid.length; i++){
    for(let j = 0; j < grid[i].length; j++){
      grid[i][j].setColor(0xffffff); 
      grid[i][j].isAttacking = false;
    }
  }
  
}

// ends the game and clears everything else
function end() {
  clear();

  bullets.forEach((b) => gameScene.removeChild(b));
  bullets = [];

  explosions.forEach((e) => gameScene.removeChild(e));
  explosions = [];

  gameScene.removeChild(boss);
  
  gameOverScoreLabel.text = `Your final score: ${score}`;
  gameOverScoreLabel.x = sceneWidth / 2 - gameOverScoreLabel.width / 2;
  gameOverScene.addChild(gameOverScoreLabel);

  gameOverScene.visible = true;
  gameScene.visible = false;

  if(boss.hp <= 0) gameOverText.text = `You Win!`;
  
}

//#endregion
