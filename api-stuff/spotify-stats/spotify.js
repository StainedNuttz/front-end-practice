class Spotify {
  constructor() {
    this.client_id = '5e965c98d55a4567b6710fb3fb72ab70';
    this.redirect_uri = "http://localhost:5500/api-stuff/spotify-stats/stats";
  }
  getToken() {
   window.location = `https://accounts.spotify.com/authorize?client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&response_type=token&state=123`;
  }
}