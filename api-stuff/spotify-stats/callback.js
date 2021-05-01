document.addEventListener('DOMContentLoaded', () => {
  let token = window.location.hash.split('#access_token=')[1];
  token = token.split('&')[0];
  document.body.innerHTML = 'Connecting to Spotify<br><br>';
  document.body.innerHTML += token;

  const spotify = new Spotify();
  sessionStorage.setItem('access_token', token);
  setTimeout(() => document.location = spotify.redirect_uri, 2000);
});