const content = document.querySelector('#main-content');
const bankDetails = document.querySelector('#bank-details');

document.addEventListener('DOMContentLoaded', function(e) {
  getUserData(e);
  getBankData(e);
});

function getUserData(e) {
  const http = new XMLHttpRequest();

  http.open('GET', 'https://randomuser.me/api/?inc=picture,name,email', true);

  http.onload = function() {
    if (this.status === 200) {
      const response = JSON.parse(this.responseText).results[0];
      console.log(response);

      const data = {
        'name' : response.name.first + ' ' + response.name.last,
        'email' : response.email,
        'picture' : response.picture.large,
      }
      
      document.querySelector('#avatar').setAttribute('src', data.picture);
      content.querySelector('#name p').innerHTML = data.name;
      delete data.name;
      delete data.picture;

      // easy to add more data from API if needed
      for (let d in data) {
        const div = document.createElement('div');
        div.className = 'text-center';
        div.innerHTML = `<p class="text-base my-1">${data[d]}</p>`;
        content.insertBefore(div, bankDetails);
      }
    }
  }

  http.send();

  e.preventDefault();
}

function getBankData(e) {
  const http = new XMLHttpRequest();

  http.open('GET', 'https://random-data-api.com/api/bank/random_bank', true);

  http.onload = function() {
    if (this.status === 200) {
      const response = JSON.parse(this.responseText);

      const r = response.routing_number.substring(0, 6);
      let sortCode = `${r.substring(0, 2)}-${r.substring(2, 4)}-${r.substring(4, 6)}`;

      const balance = (Math.random() * 99999).toFixed(2);

      const data = {
        'accountNumber' : response.account_number,
        'sortCode' : sortCode,
        'balance' : balance
      }

      bankDetails.querySelector('#account-number').nextElementSibling.textContent = data.accountNumber;

      bankDetails.querySelector('#sort-code').nextElementSibling.textContent = data.sortCode;

      bankDetails.querySelector('#balance').nextElementSibling.textContent = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(data.balance);
    }
  }

  http.send();

  e.preventDefault();
}