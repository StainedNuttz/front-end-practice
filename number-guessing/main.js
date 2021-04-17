const form = document.querySelector('form');
const guess = document.querySelector('#guess');
const button = document.querySelector('#btn-submit');
const gameState = document.querySelector('#game-state');
const inputInfo = document.querySelector('#input-info');

// data of running game
let randomNumber, guessesLeft, gameRunning;

const statCorrectGuesses = document.querySelector('#stat-correct-guesses');
const statAttempts = document.querySelector('#stat-attempts');
const statGamesPlayed = document.querySelector('#stat-games-played');

const borderError = 'border-red-600';
const borderSuccess = 'border-green-600';
const textError = 'text-red-600';
const textSuccess = 'text-green-600';
const stats = {
  'totalGuesses' : 0,
  'totalCorrectGuesses' : 0,
  'totalGamesPlayed' : 0,
}

// init vars
window.addEventListener('DOMContentLoaded', function() {
  for (let stat in stats) {
    const data = parseInt(localStorage.getItem(stat));
    console.log(stat + ' : ' + data);
    localStorage.setItem(stat, isNaN(data) ? 0 : data);
  }
  refreshStats();
  gameRunning = true;
  startGame();
});

function startGame() {
  // initialize / reset for new game
  randomNumber = Math.floor(Math.random() * 10 + 1);
  guessesLeft = 3;
  
  guess.setAttribute('enabled', 'enabled');
  guess.removeAttribute('disabled');
  gameState.className = 'text-xl mb-2 mt-2';
  gameState.textContent = `You have ${guessesLeft} guesses 
  left`;

  guess.classList.remove(borderError, borderSuccess);
  inputInfo.className = '';
  inputInfo.textContent = '';

  button.textContent = 'Guess';
}

function refreshStats() {
  statAttempts.children[0].textContent = localStorage.getItem('totalGuesses');
  statCorrectGuesses.children[0].textContent = localStorage.getItem('totalCorrectGuesses');
  statGamesPlayed.children[0].textContent = localStorage.getItem('totalGamesPlayed');
}

button.addEventListener('click', function(e) {
  e.preventDefault();
  if (!gameRunning) { 
    startGame();
    gameRunning = true;
    return;
  }

  const input = parseInt(guess.value);
  guess.value = '';

  inputInfo.className = textError;
  guess.classList.add(borderError);

  if (isNaN(input)) {
    inputInfo.textContent = 'Enter in a value';
  } else if (input <= 0) {
    inputInfo.textContent = 'Enter a value greater than 0';
  } else if (input > 10) {
    inputInfo.textContent = 'Enter a value less than 10';
  } else {
    // validated guess
    let storageItem = parseInt(localStorage.getItem('totalGuesses'));
    localStorage.setItem('totalGuesses', ++storageItem);

    if (input === randomNumber) {
      let storageItem = parseInt(localStorage.getItem('totalCorrectGuesses'));
      localStorage.setItem('totalCorrectGuesses', ++storageItem);

      storageItem = parseInt(localStorage.getItem('totalGamesPlayed'));
      localStorage.setItem('totalGamesPlayed', ++storageItem);

      gameState.innerHTML = `You correctly guessed:<br>${randomNumber}<br>with ${guessesLeft} remaining guesses!`;
      inputInfo.textContent = 'Correct';
      inputInfo.className = textSuccess;
      gameState.classList.add(textSuccess);
      guess.classList.add(borderSuccess);
      
      button.textContent = 'Next Game?';
      gameRunning = false;
      guess.setAttribute('disabled', 'true');
    } else if (--guessesLeft === 0) {
      let storageItem = parseInt(localStorage.getItem('totalGamesPlayed'));
      localStorage.setItem('totalGamesPlayed', ++storageItem);

      gameState.innerHTML = `Game over<br>The number was ${randomNumber}!`;
      gameState.classList.add(textError);

      button.textContent = 'Next Game?';
      gameRunning = false;
      guess.setAttribute('disabled', 'true');
    } else {
      inputInfo.textContent = 'Incorrect'
      gameState.textContent = (guessesLeft == 1) ? 'You have 1 guess left'  : `You have ${guessesLeft} guesses left`;
    }
      guess.classList.add(borderError);
  }
  // do for all
  refreshStats();
});