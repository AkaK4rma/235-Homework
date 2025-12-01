// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

let sceneWidth, sceneHeight;

// aliases
let stage;
let assets;

// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, gameOverScoreLabel, shootSound, hitSound, fireballSound;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

let newX;
let newY;

let grid = [
      [],
      [],
      [],
      [],
    ];

let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false
};

document.addEventListener("keydown", (e) => {
    if (e.repeat) return; // Prevent stuttering from OS key repeat
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
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

function createLabelsAndButtons(){
    let buttonStyle = {
        fill: "0xff0000",
        fontSize: 48,
        fontFamily: "Futura",
    }

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
    startButton.x = sceneWidth / 2 - startButton.width /2;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", (e) => (e.target.alpha = .7));
    startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    startScene.addChild(startButton);

    
    let textStyle = { 
        fill: 0xffffff, 
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xff0000, 
        strokeThickness: 4,
    };
    scoreLabel = new PIXI.Text("", textStyle);
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    lifeLabel = new PIXI.Text("", textStyle);
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    let grdOffsetY = 30;
    let grdOffsetX = 50;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 5; j++) {
        let color = 0xffffff
        let gridRect = new Grid(color, 30 + (j * grdOffsetX), 180 + (i * grdOffsetY));
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

function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseLifeBy(value) {
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life: ${life}%`;
}

function fireBullet() {
    if(paused) return;

    let b = new Bullet(0xffffff, ship.x, ship.y);
    bullets.push(b);
    gameScene.addChild(b);
    shootSound.play();
}

function fireBullets() {
    if(paused) return;

    let b;
    for(let i = 0; i < 3; i++){
        b = new Bullet(0xffffff, ship.x + (-10 + i * 10), ship.y);
        bullets.push(b);
        gameScene.addChild(b);
    }
    shootSound.play();
}

function startGame(){
  startScene.visible = false;
  gameOverScene.visible = false;
  gameScene.visible = true;
  levelNum = 1;
  score = 0;
  life = 100;
  increaseScoreBy(0);
  decreaseLifeBy(0);
  ship.x = sceneWidth/2;
  ship.y = sceneHeight - (60 + 75/2);
  newX = ship.x;
  newY = ship.y;
  loadLevel();
  setTimeout(() => { paused = false}, 50);
}

function loadLevel(){
  createCircles(levelNum * 5);
}

function loadSpriteSheet(){
    let spriteSheet = PIXI.Texture.from("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++){
        let frame = new PIXI.Texture({
            source: spriteSheet,
            frame: new PIXI.Rectangle(i * width, 64, width, height),
        });
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight){
    let w2 = frameWidth/2;
    let h2 = frameHeight/2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 1/7;
    expl.loop = false;
    expl.onComplete = () => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}


function createCircles(numCircles = 10){ 
    for (let i = 0; i < numCircles; i++) { 
        let c = new Circle (10, 0xffff00);
        c.x = Math.random() * (sceneWidth - 50) + 25;      
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
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
  gameScene.addChild(ship);

  // #6 - Load Sounds
  shootSound = new Howl({
    src: ["sounds/shoot.wav"],
  });

  hitSound = new Howl({
    src: ["sounds/hit.mp3"],
  });

  fireballSound = new Howl({
    src: ["sounds/fireball.mp3"],
  });

  // #7 - Load sprite sheet
  explosionTextures = loadSpriteSheet();

  // #8 - Start update loop
  app.ticker.add(gameLoop);
  // #9 - Start listening for click events on the canvas

  // Now our `startScene` is visible
  // Clicking the button calls startGame()
}

function gameLoop(){
  if (paused) return; // keep this commented out for now

  app.view.onclick = (score < 5) ? fireBullet : fireBullets;

  // #1 - Calculate "delta time"
  let deltaTime = 1 / app.ticker.FPS;
  if (deltaTime > 1 / 12) deltaTime = 1 / 12;

  // #2 - Move Ship
  let amount = 6 * deltaTime;
  if (keys.a) {
    newX -= 100;
    if(newX <= 90){
      ship.x = 500;
      newX = ship.x;
    }
    keys.a = false;
  } else if (keys.d) {
    newX += 100;
    if(newX >= 510){
      ship.x = 100;
      newX = ship.x;
    }
    keys.d = false;
  } else if (keys.w) {
    if(newY > 440){
      newY -= 60;
      keys.w = false;
    }
  } else if (keys.s) {
    if(newY < 510){
      newY += 60;
      keys.s = false;
    }
  }

  let w2 = ship.width / 2;
  let h2 = ship.height / 2;

  let lerpX = lerp(ship.x, newX, amount);
  let lerpY = lerp(ship.y, newY, amount);
  ship.x = clamp(lerpX, 65 + w2, sceneWidth - w2);
  ship.y = clamp(lerpY, 0 + h2, sceneHeight - h2);

  // #3 - Move Circles
  for(let c of circles){
    c.move(deltaTime);
    if(c.x <= c.radius || c.x >= sceneWidth - c.radius){
        c.reflectX();
        c.move(deltaTime);
    }

    if(c.y <= c.height || c.y >= sceneHeight - c.radius){
        c.reflectY();
        c.move(deltaTime);
    }
  }

  // #4 - Move Bullets
  for (let b of bullets) {
    b.move(deltaTime);
  }

  // #5 - Check for Collisions

  for(let c of circles){
    for(let b of bullets){
        if(rectsIntersect(c, b)){
            fireballSound.play();
            createExplosion(c.x,c.y,64,64);
            gameScene.removeChild(c);
            c.IsAlive = false;
            gameScene.removeChild(b);
            b.IsAlive = false;
            increaseScoreBy(1);
            break;
        }
    }
    if(c.IsAlive && rectsIntersect(c, ship)){
        hitSound.play()
        gameScene.removeChild(c);
        c.IsAlive = false;
        decreaseLifeBy(20);
    }
  }
  // #6 - Now do some clean up

  bullets = bullets.filter((b) => b.IsAlive);

  circles = circles.filter((c) => c.IsAlive);
  
  explosions = explosions.filter((e) => e.IsAlive);
  // #7 - Is game over?
  if (life <= 0){
    end();
    return;
  }

  // #8 - Load next level
  if (circles.length == 0) {
    levelNum++;
    loadLevel();
  }
}

function end(){
    circles.forEach((c) => gameScene.removeChild(c));
    circles = [];

    bullets.forEach((b) => gameScene.removeChild(b));
    bullets = [];

    explosions.forEach((e) => gameScene.removeChild(e));
    explosions = [];

    gameOverScene.visible = true; 
    gameScene.visible = false;

    gameOverScoreLabel.text = `Your final score: ${score}`;
}