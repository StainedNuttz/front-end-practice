// fixes mobile browser UI shifting elements around
let vh = window.innerHeight;
document.querySelector('#showcase').style.setProperty('--vh', `${vh}px`);

// on mobile phones, the viewport height will be locked on mobiles
// so that the browser UI on mobile (firefox, safari for example) won't affect
// the viewport dimensions upon the browser UI resizing (url bar showing for instance).
// on desktops and laptops, the browser window could be resized and in that case we let the viewport dimensions change like normal.
$(window).resize(function () {
  if (screen.width > 768) {
    vh = window.innerHeight;
    document.querySelector('#showcase').style.setProperty('--vh', `${vh}px`);
  }
});