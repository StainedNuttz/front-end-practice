class UI {
  displayUser(data) { 
    if (data.error) {
      this.displayError(data.error.message);
    }

    const btn = document.querySelector('#connect');
    const h1 = document.querySelector('h1');
    const container = document.querySelector('.container');

    h1.textContent = 'Hi, ' + data.display_name;

    // container.insertBefore(btn, container.firstElementChild);

    const img = document.createElement('div');
    img.className = 'rounded-full w-32 h-32 mx-auto mt-5';
    img.style.backgroundImage = `url(${data.images[0].url})`;
    img.style.backgroundRepeat = 'no-repeat';
    img.style.backgroundPosition = 'center';
    img.style.backgroundSize = 'cover';

    container.insertBefore(img, container.firstElementChild);
  }
  displayError(error) {
    document.querySelector('#content').innerHTML += `<div class="text-xl text-red-600>ERROR: ${error}</div>`;
  }
}