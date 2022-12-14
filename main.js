// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

//refresh best score Dom
function bestScoreToDOM() {
  bestScores.forEach((bestScore, index) => {
    
    bestScore.textContent = `${bestScoreArray[index].bestScore}s`;
    
  });
}


//LocalStorage for best score, bestscorearray
function getSavedBestScore() {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }

  bestScoreToDOM();
}



// update best score array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    //best score to update
    if (questionAmount == score.questions) {
      //return best score number with 1 decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      //update if the new final score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  //update Splash page
  bestScoreToDOM();
  //save to localstorage
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  
}
//play again btn
function playAgain() {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

//score page
function showScorePage() {
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
}

//Formating & Displaying
function scoreToDOM() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty Time: + ${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;

  updateBestScore();
  //scroll to top, go to score page
  itemContainer.scrollTo({ top: 0, behavior: "instant" });

  showScorePage();
}

//check time when it stop, process result, go to score page
function checkTime() {
  console.log(timePlayed);
  if (playerGuessArray.length == questionAmount) {
    console.log("player Guess Array:", playerGuessArray);
    clearInterval(timer);
    //check if wrong guess, add penalty
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {
      } else {
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
  
    scoreToDOM();
  }
}

// Add a  tenth of second in timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

//Set timer when game is clicked
function startTimer() {
  //reset time
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

//scroll, store user selection in playerGuessArray
function select(guessTrue) {
  //scroll 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);
  //Add player Guess to array
  return guessTrue
    ? playerGuessArray.push("true")
    : playerGuessArray.push("false");
}

//Display game page
function showGamePage() {
  gamePage.hidden = false;

  countdownPage.hidden = true;
}

//Get random number up to max number
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);

  //Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;

  //Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  //Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Dom equation
function equationsToDOM() {
  equationsArray.forEach((equation) => {
    // item
    const item = document.createElement("div");
    item.classList.add("item");
    //equation text
    const equationText = document.createElement("h1");

    equationText.textContent = equation.value;

    //append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}
// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOm
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

// display 3 , 2 , 1 , Go!
function countdownStart() {
    let count = 3;
    const timeCount = setInterval(()=>{
        count--;
        if(count === 0){
            
            countdown.textContent = 'Go!';
        }else if(count === -1){
            showGamePage();
            clearInterval(timeCount);
        }else {
            countdown.textContent = count;

        }
    }, 1000);

}
// show countdown splash to countdown pages
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  populateGamePage();
  countdownStart();
  
  
}
//values from selected radio btn
function getRadioValues() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });

  return radioValue;
}

//Selected Question fnc
function selectedQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValues();
  if (questionAmount) {
    showCountdown();
  }
}

//Event Listener
startForm.addEventListener("click", () => {
  radioContainers.forEach((radioEl) => {
    //Removing selected styling
    radioEl.classList.remove("selected-label");
    //Adding it back
    if (radioEl.children[1].checked) {
      radioEl.classList.add("selected-label");
    }
  });
});

startForm.addEventListener("submit", selectedQuestionAmount);
gamePage.addEventListener("click", startTimer);

//on load
getSavedBestScore();
