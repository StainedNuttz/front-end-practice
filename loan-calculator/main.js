const form = document.querySelector('#inputs form');
const formSubmit = document.querySelector('#inputs form button[type="submit"]');

const loading = document.querySelector('#loading');
const results = document.querySelector('#results');

const totalPay = document.querySelector('#total-pay');
const totalInterest = document.querySelector('#total-interest');
const lastPayDate = document.querySelector('#last-pay-date');
const perTime = document.querySelector('#per-time');
const mainPay = document.querySelector('#main-pay');

const loanAmount = document.querySelector('#loan-amount');
const interest = document.querySelector('#interest');
const loanTerm = document.querySelector('#loan-term');
const schedule = document.querySelector('#schedule');
const startDate = document.querySelector('#start-date');

const inputsToCheck = [loanAmount, interest, loanTerm, schedule, startDate];

new AutoNumeric(loanAmount, { minimumValue: 0});
new AutoNumeric(interest, { minimumValue: 0, maximumValue: 99 });
new AutoNumeric(loanTerm, { digitGroupSeparator: '', decimalPlaces: 0 });

const currency = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const today = new Date().toISOString().split('T')[0];
startDate.setAttribute('min', today);
startDate.setAttribute('value', today);

formSubmit.addEventListener('click', validateInputs);

function showLoading() {
  loading.classList.replace('hidden', 'flex');

  formSubmit.setAttribute('disabled', 'disabled');
  formSubmit.classList.add('cursor-not-allowed');

  results.classList.replace('grid', 'hidden')

  inputsToCheck.forEach(function(input) {
    input.setAttribute('disabled', 'disabled');
    input.classList.add('cursor-not-allowed');
  });
}

function hideLoading() {
  loading.classList.replace('flex', 'hidden');

  formSubmit.removeAttribute('disabled')
  formSubmit.classList.remove('cursor-not-allowed');

  results.classList.replace('hidden', 'grid')

  inputsToCheck.forEach(function (input) {
    input.removeAttribute('disabled', 'disabled');
    input.classList.remove('cursor-not-allowed');
  });
}

function calculateResults() {
  hideLoading();
  
  // NUMBER OF PAYMENTS PER YEAR
  let scheduleToPay;
  let perTimeName;

  // get the schedule before the calculation as we need the
  // correct one for the main calculation
  switch (schedule.value) {
    case 'daily':
      scheduleToPay = 365;
      perTimeName = 'day';
      break;
    case 'weekly':
      scheduleToPay = 52;
      perTimeName = 'week';
      break;
    case 'biweekly':
      scheduleToPay = 26;
      perTimeName = 'two weeks';
      break;
    case 'monthly':
      scheduleToPay = 12;
      perTimeName = 'month';
      break;
    case 'quarterly':
      scheduleToPay = 4;
      perTimeName = 'quarter (1/4 year)'
      break;
    case 'annually':
      scheduleToPay = 1;
      perTimeName = 'year';
      break;
  }

  // pv = loan amount
  // i = interest rate per month in decimal form
  // n = term of loan in months

  const pv = AutoNumeric.getNumber(loanAmount);
  const i = (AutoNumeric.getNumber(interest) / scheduleToPay) / 100;
  const n = (loanTerm.value * scheduleToPay);

  const formula = (pv * i) * ((Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));


  const mainPayValue = currency.format(formula.toFixed(2)).toString().split('$')[1];
  mainPay.innerHTML = `<span class="text-lg absolute" style="left: -10px">$</span>${mainPayValue}`;
  perTime.innerHTML = `per ${perTimeName}`;

  totalInterest.innerHTML = currency.format(formula * loanTerm.value * scheduleToPay - pv);
  totalPay.innerHTML = currency.format(formula * loanTerm.value * scheduleToPay);

  const inputtedDate = new Date(startDate.value);
  inputtedDate.setFullYear(inputtedDate.getFullYear() + parseInt(loanTerm.value));

  const arrayDate = inputtedDate.toDateString().split(' ');
  arrayDate.shift();
  lastPayDate.innerHTML = arrayDate.join(' ');
}

function validateInputs(e) {
  const errors = [];

  e.preventDefault();

  // Loop through input fields and push any invalid inputs into errors array
  inputsToCheck.forEach(function(input) {
    const parent = getParent(input);
    const errorSpan = parent.querySelector('span.error');

    if (input.value === '' || (input === schedule && input.value == "Select payment schedule")) {
      errors.push(input);
      // If the input field already has error elements, hide/remove them!
    } else if (errorSpan !== null) {
        errorSpan.classList.add('hidden');
        input.classList.remove('border-red-600');
    }
  });

  // If any errors
  if (errors.length > 0) {
    errors.forEach(function(error) {
      const parent = getParent(error);
      const errorSpan = parent.querySelector('span.error');

      if (errorSpan === null) {
        const newSpan = createError();
         
        switch (error) {
          case schedule:
            newSpan.innerText = "Please select a payment schedule";
            break;
          case startDate: 
            newSpan.innerText = "Please select a starting date for the loan";
            break;
          case loanAmount:
            newSpan.innerText = "Please enter in the loan amount";
            break;
          case loanTerm:
            newSpan.innerText = "Please enter in the loan term in years";
            break;
          case interest:
            newSpan.innerText = "Please enter in the APR interest rate";
            break;
          default: 
            newSpan.innerText = "Please enter a value";
        } 

        parent.appendChild(newSpan);

      } else if (errorSpan.classList.contains('hidden')) {
        errorSpan.classList.remove('hidden');
      }

      error.classList.add('border-red-600');
    });
  } else {
    showLoading();
    setTimeout(calculateResults, 2000);
  }
}

function createError() {
  const span = document.createElement('span');
  span.classList.add('text-xs', 'text-red-600', 'error');

  return span;
}

function getParent(input) {
  let parent;

  if (input === interest || input === loanAmount) {
    parent = input.parentElement.parentElement;
  } else {
    parent = input.parentElement;
  }

  return parent;
}