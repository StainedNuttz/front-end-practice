class Spotify {
  constructor() {
    this.client_id = '5e965c98d55a4567b6710fb3fb72ab70';
    this.redirect_uri = 'https://www.stianhazel.xyz/api-stuff/spotify-stats/';
    this.apiURL = 'https://api.spotify.com/v1/';
    this.accessToken = sessionStorage.getItem('access_token');
    this.scope = 'playlist-read-private user-read-private user-top-read user-read-recently-played user-modify-playback-state user-read-currently-playing user-read-playback-state';
    this.deviceID = 0;
  }
  login() {
    window.location = `https://accounts.spotify.com/authorize?client_id=${this.client_id}&redirect_uri=${this.redirect_uri}callback.html&response_type=token&state=123&scope=${this.scope}`;
  }
  logout() {
    sessionStorage.removeItem('access_token');
    location.reload();
  }
  async apiCall(endpoint, params, headers = {}, method) {
    headers['Authorization'] = `Bearer ${this.accessToken}`;

    let query = '';
    for (let p in params) {
      query += `&${p}=${params[p]}`;
    }
    query = query.replace('&', '?');

    const res = await fetch(this.apiURL + endpoint + query, {
      method: method,
      headers: headers
    });

    if (res.status === 204) { return res; }
    return res.json();
  }
  async getUserData() {
    const userData = await spotify.apiCall('me')
      .then(d => {
        if (d.hasOwnProperty('error') && d.error.message === 'The access token expired') {
          this.login();
        } else { return d }
      });
      
    const country = await fetch(`https://restcountries.eu/rest/v2/alpha/${userData.country}`)
      .then(d => d.json());

    return {
      userData,
      flag: country.flag
    }
  }
}