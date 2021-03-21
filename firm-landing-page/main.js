var request = new XMLHttpRequest();

request.open('GET', 'https://currencyapi.net/api/v1/rates?key=6kEALEERZcuFaNTzGRFH9jRPttlm3x0Yn91L', true);
request.onload = function() {
  var data = JSON.parse(this.response).rates;
  var currencies = {
    "GBP" : data.GBP,
    "EUR" : data.EUR,
    "BTC" : data.BTC,
    "XAU" : data.XAU
  }
  
  for (var key in currencies) {
    var value = currencies[key];
    var row = generateRow(key, value);
    document.getElementById("tbody").appendChild(row);
  }

}
request.send();

function generateRow(key, value) {
  var tr = document.createElement("tr");
  var td1 = document.createElement("td");
  var td2 = document.createElement("td");
  var td3 = document.createElement("td");

  td1.innerHTML = key;
  td2.innerHTML = value.toFixed(5);
  td3.innerHTML = (Math.random() * 10 + 5).toPrecision(3) + "%";

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  return tr;
}

// smooth scrolling + fixed navbar offset
$('#navbar a, .btn').on('click', function(event) {
  if (this.hash !== '') {
    event.preventDefault();

    var navStyles = getComputedStyle(document.querySelector('#navbar'));

    // add offset of 2px because it has a dumb offset problem
    var navHeight = parseInt(navStyles.getPropertyValue('height')) - 2;

    const hash = this.hash;

    $('html, body').animate(
      {
        scrollTop: $(hash).offset().top - navHeight
      },
      600
    );
  }
});

// fixes mobile browser UI shifting elements around
let vh = window.innerHeight;
document.querySelector('#showcase').style.setProperty('--vh', `${vh}px`);

// only attempt to resize IF user is not on mobile styling
$(window).resize(function() {
  if (screen.width > 768) {
    let vh = window.innerHeight;
    document.querySelector('#showcase').style.setProperty('--vh', `${vh}px`);
  }
});