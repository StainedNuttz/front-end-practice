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
  
}
request.send();