const connect = document.querySelector('#connect');
const spotify = new Spotify();
const ui = new UI();

let accessToken;

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('access_token')) {
    connect.textContent = 'LOG OUT';
    spotify.connect()
      .then(d => ui.displayUser(d))
      .catch(err => ui.displayError(err));
  }
});

connect.addEventListener('click', () => {
  if (connect.textContent === 'LOG OUT') {
    sessionStorage.removeItem('access_token');
    location.reload();
  } else { spotify.login() }
});