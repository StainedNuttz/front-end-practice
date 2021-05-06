const btn = document.querySelector('#submit');
const email = document.querySelector('#email');
const username = document.querySelector('#username');
const card = document.querySelector('#card');
const ccv = document.querySelector('#ccv');
const exp = document.querySelector('#exp');
const reason = document.querySelector('#reason');
const count = document.querySelector('#count');

email.addEventListener('blur', () => {
  const regex = /^([a-zA-Z0-9\-\.\_]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
  if (!regex.test(email.value)) {
    error(email, 'Invalid email');
  } else {
    success(email);
  }
});

username.addEventListener('blur', () => {
  const regex = /^[a-zA-Z0-9\.\_\-]{2,16}$/;
  if (!regex.test(username.value)) { 
    error(username, 'Username must be between 2 and 16 characters');
  } else {
    success(username);
  }
});

card.addEventListener('blur', () => {
  const regex = /^[0-9]{16}$/;
  if (!regex.test(card.value)) { 
    error(card, 'Invalid card number');
  } else {
    success(card);
  }
})

ccv.addEventListener('blur', () => {
  const regex = /^[0-9]{3}$/;
  if (!regex.test(ccv.value)) { 
    error(ccv, 'Invalid CCV');
  } else {
    success(ccv);
  }
});

exp.addEventListener('blur', () => {
  const regex = /^([1-9]|(10)|(11)|(12))\/\d{2}$/;
  if (!regex.test(exp.value)) { 
    error(exp, 'Invalid date');
  } else {
    success(exp);
  }
});

reason.addEventListener('blur', () => {
  const regex = /^.{1,300}$/;
  if (!regex.test(reason.value)) { 
    error(reason, 'Enter a message between 1 and 300 characters');
  } else {
    success(reason);
  }
});

reason.addEventListener('keyup', () => {
  count.textContent = `${reason.value.length} / 300 characters`;
})

const baseInput = 'resize-none border w-full rounded-sm p-1 focus:outline-none';

function error(e, msg) {
  const oldMsg = e.parentElement.querySelector('.msg-validate');
  if (oldMsg) { oldMsg.remove(); }

  const span = document.createElement('span');
  span.className = 'msg-validate text-left text-red-600 text-xs mt-1';
  span.textContent = msg;

  e.parentElement.appendChild(span);
  e.className = baseInput + ' ring-1 border-red-600 ring-red-600';
}

function success(e) {
  const msg = e.parentElement.querySelector('.msg-validate');
  if (msg) { msg.remove(); }
  e.className = baseInput + ' ring-1 border-green-300 ring-green-300';

}
