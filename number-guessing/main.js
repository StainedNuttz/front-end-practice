const form = document.querySelector('form');
const guess = document.querySelector('#guess');
const button = document.querySelector('#btn-submit');
const result1 = document.querySelector('#result1');
const result2 = document.querySelector('#result2');

// data of running game
let randomNumber, guessesLeft;

const stats = {
  'guesses' : 0,
  'correctGuesses' : 0,
  'gamesPlayed' : 0,
}

// init vars
window.addEventListener('DOMContentLoaded', function() {
  for (let stat in stats) {
    const data = parseInt(localStorage.getItem(stats[stat]));
    stats[stat] = (data === NaN) ? data : 0;
  }
  console.log(stats);
  // startGame();
});

function startGame() {
  randomNumber = Math.floor(Math.random() * 10 + 1);
  console.log(`random number: ${randomNumber}`);
}

button.addEventListener('click', function(e) {
  e.preventDefault();

  const input = parseInt(guess.value);
  let span = document.createElement('span');

  if (input === NaN) {
    span.textContent = 'Enter in a value';
  } else if (input <= 0) {
    span.textContent = 'Enter a value greater than 0';
  } else if (input >= 10) {
    span.textContent = 'Enter a value less than 10';
  } else {
    span = null;
  }

  // IF NO ERRORS
  if (span === null) {
    localStorage.setItem('attempts', localStorage.getItem('attempts') + 1);
    processGuess();
    // guess.classList.add('border-green-600', 'border-2');
    return;
  }

  span.id = "#error";
  span.className = 'text-sm text-red-600';
  guess.classList.add('border-red-600', 'border-2');
  form.insertBefore(span, button);
});

function processGuess() {
  const input = guess.value;

}