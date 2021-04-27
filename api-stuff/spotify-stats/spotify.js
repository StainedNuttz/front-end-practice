class Spotify {
  constructor() {
    this.client_id = '5e965c98d55a4567b6710fb3fb72ab70';
    this.redirect_uri = 'http://localhost:5500/api-stuff/spotify-stats/';
    this.apiURL = 'https://api.spotify.com/v1/';
    this.accessToken = sessionStorage.getItem('access_token');
  }
  login() {
   window.location = `https://accounts.spotify.com/authorize?client_id=${this.client_id}&redirect_uri=${this.redirect_uri}callback.html&response_type=token&state=123`;
  }
  connect() {
    this.request('me');
  }
  async request(endpoint) {
    const res = await fetch(this.apiURL + endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.json();
  }
  async getPlaylists() {

  }
}