const btn = document.querySelector('#submit');
const email = document.querySelector('#email');
const username = document.querySelector('#username');
const card = document.querySelector('#card');
const ccv = document.querySelector('#ccv');
const exp = document.querySelector('#exp');
const reason = document.querySelector('#reason');
const count = document.querySelector('#count');

const validations = {
  'email': { 
    'regex': /^([a-zA-Z0-9\-\.\_]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
    'message': 'Please enter in a valid email address'
  },
  'username': {
    'regex': /^[a-zA-Z0-9\.\_\-]{2,16}$/,
    'message': 'Username must be between 2 and 16 characters and not contain any special characters'
  },
  'card': {
    'regex': /^[0-9]{16}$/,
    'message': 'Please enter in a valid card number'
  },
  'ccv': {
    'regex': /^[0-9]{3}$/,
    'message': 'Please enter in a valid CCV number'
  },
  'exp': { 
    'regex': /^([1-9]|(10)|(11)|(12))\/\d{2}$/,
    'message': 'Please enter a valid expiry date'
  },
  'reason': {
    'regex': /^.{1,300}$/,
    'message': 'Please enter in a message'
  }
}



const inputBaseClass = 'resize-none border w-full rounded-sm p-1 focus:outline-none';

function validateInput(e) {
  const ref = validations[e.id];
  const prev = e.parentElement.querySelector('.msg-validate');

  if (!ref.regex.test(e.value)) {
    if (prev) { return; }
    error(e, ref.message);
  } else {
    if (prev) { prev.remove(); }
    success(e);
  }
}

function error(e, msg) {
  const span = document.createElement('span');
  span.className = 'msg-validate text-left text-red-600 text-xs mt-1';
  span.textContent = msg;
  e.parentElement.appendChild(span);

  e.className = inputBaseClass + ' ring-1 border-red-600 ring-red-600';
}

function success(e) {
  e.className = inputBaseClass + ' ring-1 border-green-300 ring-green-300';
}

reason.addEventListener('keyup', () => {
  count.textContent = `${reason.value.length} / 300 characters`;
})

document.querySelector('form').addEventListener('focusout', (e) => {
  if (e.target.tagName !== 'BUTTON') { validateInput(e.target); }
  console.log(e.target + ' unfocused')
});

document.querySelector('form').addEventListener('focusin', (e) => {
  const prev = e.target.parentElement.querySelector('.msg-validate');
  if (e.target.tagName !== 'BUTTON' && prev) { prev.remove(); }
});

btn.addEventListener('click', (e) => {
  e.preventDefault();

  document.querySelectorAll('input').forEach((d) => {
    validateInput(d);
  });
  validateInput(reason);
});