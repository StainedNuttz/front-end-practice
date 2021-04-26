document.querySelector('#get-text').addEventListener('click', getText);
document.querySelector('#get-json').addEventListener('click', getJson);
document.querySelector('#get-api-data').addEventListener('click', getExternal);

function getText() {
  fetch('text.txt')
    .then(function(response) {
      return response.text();
    })
    .then(function(data) {
      document.querySelector('#output').innerHTML = data;
    });
}

function getJson() {
  fetch('json.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let output = '';
      data.forEach(function(ingredient) {
        output += `<li>${ingredient.name} : ${ingredient.quantity}</li>`;
      })
      document.querySelector('#output').innerHTML = output;
    })
    .catch(function (error) {
      document.querySelector('#output').innerHTML = error;
    });
}

function getExternal() {
  fetch('https://api.github.com/users')
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    let output = '';
    data.forEach(function(d) {
      output += `<li>${d.login}</li>`
    });
    document.querySelector('#output').innerHTML = output;
  });
}