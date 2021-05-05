const spotify = new Spotify();
const ui = new UI();
const connect = document.querySelector('#connect');
const togglePlayer = document.querySelector('#toggle-player');

let logout;

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('access_token')) {
    ui.content.classList.remove('hidden');
    spotify.getUserData()
      .then(d => ui.displayUser(d));

    spotify.apiCall('me/player/devices')
      .then(data => {
        data.devices.forEach((d) => {
          console.log(d); 
          if (d.name === 'cutie-linux') {
            spotify.deviceID = d.id;
          }
        });
      });

    spotify.apiCall('me/player/recently-played', { limit: '5' })
      .then(data => data.items.forEach(d => ui.displayTrack(d)));

    spotify.apiCall('me/player/currently-playing')
      .then(d => {
        if (d.status !== 204) {
          ui.displayCurrentTrack({
            name: d.item.name,
            artist: d.item.artists[0].name,
            image: d.item.album.images[1].url
          });
          if (!d.is_playing) {
            const pauseOverlay = document.querySelector('#pause-overlay');
            pauseOverlay.classList.remove('hidden');
            pauseOverlay.classList.add('flex');
           }
        } else {
          togglePlayer.textContent = 'START';
          ui.displayCurrentTrack(false);
        }
      })
      
    spotify.apiCall('me/top/artists', { time_range: 'long_term' })
      .then(data => data.items.forEach(d => ui.displayArtist(d)));

    spotify.apiCall('me/playlists')
      .then(data => data.items.forEach(d => ui.displayPlaylist(d)));
  }
});

togglePlayer.addEventListener('click', () => {
  const currentToggle = togglePlayer.textContent;
  let newToggle;
  newToggle = (currentToggle === 'RESUME' || 'START') ? 'PAUSE' : 'RESUME';

  spotify.apiCall(`me/player/${(currentToggle === ('RESUME' || 'START') ? 'play' : 'pause')}`, {}, {}, 'PUT')
    .then(d => {
      console.log(currentToggle);
      if (d.hasOwnProperty('error') && d.error.reason === 'PREMIUM_REQUIRED') {
        ui.displayError('You must be a premium user to use this player.', d.error.reason);
      } else {
        togglePlayer.textContent = newToggle;
        spotify.apiCall('me/player/currently-playing')
          .then(d => {
            const pauseOverlay = document.querySelector('#pause-overlay');
            if (!d.is_playing) {
              pauseOverlay.classList.remove('hidden');
              pauseOverlay.classList.add('flex');
            }
          });
      }
    })
});

connect.addEventListener('click', () => {
  spotify.login()
});

function loadPlaylists(data) {
  data.forEach(d => {
    ui.displayPlaylist(d);
  });
}