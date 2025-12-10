import { Application } from "https://esm.sh/@pixi/app";
import { Graphics } from "https://esm.sh/@pixi/graphics";

const cells = document.querySelectorAll(".cell");
const scoreDisplay = document.querySelector("#score");
const restartBtn = document.querySelector("#restart");

let score = 0;
let currentAngle = 0;
let targetAngle = 0;
// TODO: create an empty array called 'categories' (let)
let categories = Array();

let gameOver = false;

// Fetch category data using XMLHttpRequest
const loadCategories = () => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://people.rit.edu/anwigm/235/practical/oddwords.php");

  xhr.onload = () => {
    if (xhr.status === 200) {
      // TODO: read the text-based data returned from the xhr object and store it in a variable
      //  then take that variable and convert it to an actual javascript array that is assigned to
      //  the "categories" variable
      let obj = JSON.parse(xhr.responseText);
      categories = obj;
      


      startGame();
    } else {
      console.error("Failed to load categories");
    }
  };

  xhr.onerror = () => console.error("Network error");
  xhr.send();
};

// PixiJS setup
const app = new Application({
  width: 100,
  height: 100,
  backgroundAlpha: 0,
  antialias: true,
});

document.querySelector("#pixi-container").appendChild(app.view);

const arrow = new Graphics();
arrow.beginFill(0xFF0000);
arrow.moveTo(50, 20);
arrow.lineTo(30, 50);
arrow.lineTo(70, 50);
arrow.drawRect(42.5, 50, 15, 40)   
arrow.endFill();


arrow.pivot.set(50, 50);
arrow.position.set(50, 50);
app.stage.addChild(arrow);

app.ticker.add(() => {
  const diff = targetAngle - currentAngle;
  if (Math.abs(diff) > 0.01) {
    currentAngle += diff * 0.1;
    arrow.rotation = currentAngle;
  } else {
    currentAngle = targetAngle;
    arrow.rotation = currentAngle;
  }
});

// Rotate the arrow (direction is +1 or -1)
// TODO: This function should be an arrow function like the others... convert it from the traditional
//  function syntax to be an arrow function like the others.
const rotateArrow = (direction) => {
  const ninety = Math.PI / 2;
  targetAngle += direction * ninety;
}

// Returns direction index (0–3) based on angle
const getCurrentDir = () => {
  const normalized =
    ((targetAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return Math.round(normalized / (Math.PI / 2)) % 4;
};

// Shuffle array -- this is not the best method to shuffle an array, but it works pretty
// well, especially with small fairly inconsequential arrays.  It's not truly random, however.
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

// Set up one round of the game
const newRound = () => {
  const [catA, catB] = shuffle(categories).slice(0, 2); // this is called array destructuring
  const correctItems = shuffle(catA.correct).slice(0, 3);
  const oddOne = shuffle(catB.incorrect)[0];
  const allItems = shuffle([...correctItems, oddOne]); // this is a use of the spread operator
  const correctIndex = allItems.indexOf(oddOne);

  cells.forEach((cell, i) => {
    cell.textContent = allItems[i];
    cell.dataset.correct = i === correctIndex;
    cell.classList.remove("correct", "wrong");
  });
};

// Handle the spacebar selection
const handleSelection = () => {
  if(gameOver) return;

  const dir = getCurrentDir();
  const selected = Array.from(cells).find((c) => Number(c.dataset.dir) === dir);
  const isCorrect = selected.dataset.correct === "true";

  if (isCorrect) {
    selected.classList.add("correct");
    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;
    // TODO: update the text in the scoreDisplay to say "Score:" followed by the current score.
    // the line below that displays the Final Score ought to be helpful.

    setTimeout(newRound, 500);
  } else {
    selected.classList.add("wrong");

    const correctCell = Array.from(cells).find(
      (c) => c.dataset.correct === "true"
    );
    correctCell.classList.add("correct");

    scoreDisplay.textContent = `Final Score: ${score}`;
    restartBtn.classList.remove("hidden");
    // TODO: set the state of the game to be over. (change value of the gameOver boolean)
  }
};

const setupInput = () => {
  // TODO: set up the arrow function below to only be called when a key is pressed on the keyboard.
  //  You can either create an EventListener or EventHandler for the "keydown" event on the
  //  document itself.

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "d") rotateArrow(1);
    if (e.key === "ArrowLeft" || e.key === "a") rotateArrow(-1);
    if (e.code === "Space" || e.key === "Enter") handleSelection();
  });
};

restartBtn.addEventListener("click", () => {
  // TODO: set the score back to zero
  score = 0
  scoreDisplay.textContent = `Score: ${score}`;
  restartBtn.classList.add("hidden");
  // TODO: set the game state to 'not' be over again
  gameOver = false;

  // TODO: start a new round.
  newRound();
});

const startGame = () => {
  setupInput();
  newRound();
};

loadCategories();
