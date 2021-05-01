class UI {
  constructor() {
    this.container = document.querySelector('.container');
    this.content = document.querySelector('#content');
    this.user = document.querySelector('#user');
    this.playlists = document.querySelector('#playlists');
    this.about = document.querySelector('#about');
    this.topArtists = document.querySelector('#top-artists');
    this.recentlyPlayed = document.querySelector('#recently-played');
    this.currentTrack = document.querySelector('#current-track');
  }
  displayUser(data) { 
    const flag = data.flag;
    data = data.userData;
    if (data.error) {
      this.displayError(data.error.message);
    }

    const country = new Intl.DisplayNames(['en'], { type: 'region' }).of(data.country);
    const product = (data.product === 'open') ? 'free' : data.product;

    const user = `
    <button id="logout" class="block mx-auto bg-green-500 hover:bg-green-400 text-sm tracking-widest rounded-full
      text-white font-bold mb-12 py-3 px-7">LOG OUT</button>

    <div class="inline-grid">
      <h1 class="text-7xl pb-5 whitespace-nowrap">Hi, ${data.display_name}</h1>

      <div class="flex flex-row gap-x-8 justify-center">
        <div class="rounded-full w-32 h-32" style="
          background: url(${data.images[0].url}) no-repeat center;
          background-size: cover;">
        </div>
        <div class="flex flex-col items-start self-center">
          <div class="flex justify-center">
            <img class="w-8" src="${flag}">
            <span class="text-sm font-semibold ml-2">${country}</span>
          </div>
          <span class="text-xl mt-5 capitalize font-bold">${product} user</span>
          <span class="text-lg">Followed by ${data.followers.total} users</span>
        </div>
      </div>
    </div>`;

    // this.about.innerHTML += `<p>Followed by ${data.followers.total} users`;
    this.user.innerHTML = user;
    const logout = document.querySelector('#logout');
    logout.addEventListener('click', () => {
      spotify.logout();
    });
  }
  displayCurrentTrack(data) {
    if (!data) {
      data = {
        name: 'No song is currently being played',
        artist: '',
        image: 'logo.png',
      }
    }
    const currentTrack = `
    <div class="relative track flex border-b border-gray-300 pr-3 items-start text-lg text-gray-700 font-semibold gap-x-3">
      <div id="pause-overlay" class="hidden justify-center items-center absolute bg-black opacity-80 left-0 top-0 z-40 w-full h-full">
        <div class="tracking-widest relative text-white z-50">PAUSED</div>
      </div>
      
      <img class="w-28 h-28" src="${data.image}">
      <div class="mb-3 flex flex-col">
        <span class="text-3xl text-left">${data.name}</span>
        <span class="text-lg text-left">${data.artist}</span>
      </div>
    </div>
    `
    this.currentTrack.querySelector('div').innerHTML += currentTrack;
  }
  displayTrack(data) {
    const track = `
      <div class="flex track items-start text-lg text-gray-700 font-semibold gap-x-3">
        <img src="${data.track.album.images[2].url}">
        <div class="text-left leading-5 col-span-2 flex flex-col">
          <span class="">${data.track.name}</span>
          <span class="text-sm">${data.track.artists[0].name}</span>
        </div>
      </div>
    `
    this.recentlyPlayed.innerHTML += track;
  }
  displayArtist(data) {
    // console.log(data);

    const div = `
    <div class="artist flex items-end">
      <img class="w-20 h-20" src="${data.images[2].url}"></img>
      <p class="ml-2 text-xl mb-1 text-left">${data.name}</p>
    </div>
    `

    this.topArtists.innerHTML += div;
  }
  displayPlaylist(data) {
    const playlist = `
      <div class="playlist text-left px-2 bg-b">
        <h3 class="my-1 mx-0.5 text-lg">by ${data.owner.display_name}</h3>
        <div style="
          background: url(${data.images[0].url}) no-repeat center;
          background-size: cover;"
        class="playlist-img w-64 h-64 relative flex flex-col justify-end">
        <h2 class="text-2xl font-bold w-64 text-gray-200 p-2 relative z-10">${data.name}</h2>
        <div class="playlist-img-overlay w-64 h-64 absolute top-0 left-0"></div>
      </div>
      <style>
        .playlist-img-overlay {
          background: linear-gradient(0deg, #00000088 30%, #ffffff44 100%);
        }
      </style>
      <ul class="my-2 mx-0.5 text-2xl text-gray-800">
        <li class="">${data.tracks.total} tracks</li>
      </ul>
    </div>`;

    this.playlists.innerHTML += playlist;
  }
  displayAlert(alert) {
    const p = document.createElement('p');
    p.className = 'text-xl my-3 col-span-3';
    
    this.currentTrack.insertBefore(p, this.currentTrack.previousElementSibling);

    setTimeout(() => {
      p.remove();
    }, 8000);
    return p;
  }
  displayError(error, errorInfo) {
    // special cases to avoid spam
    if (document.querySelector('#alert-error-premium')) { return; }

    const p = this.displayAlert(error);
    p.classList.add('alert-error', 'text-red-600');
    if (errorInfo === 'PREMIUM_REQUIRED') { p.id = 'alert-error-premium'; }
    p.textContent = `ERROR: ${error}`;
  }
  displayInfo(info) {
    const p = this.displayAlert(info);
    p.classList.add('alert-info', 'text-yellow-600');
    p.textContent = `INFO: ${info}`;
  }
}