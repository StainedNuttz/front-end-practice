let a = document.querySelectorAll('.gallery .item .text-container p');

a.forEach(function(item) {
  textFit(item, {minFontSize:20, maxFontSize:25});
});

$("a[class^='btn-']").on('click', function (event) {
  if (this.hash !== '') {
    event.preventDefault();
    const hash = this.hash;

    $('html, body').animate(
      {
        scrollTop: $(hash).offset().top
      },
      450
    );
  }
});

const progressBars = document.querySelectorAll('.progress-bar > div');

var progressBarWidths = new Map();
// Save initial widths
for (let i = 0; i < progressBars.length; i++) {
  var current = progressBars[i];
  progressBars[i].id = 'progressBar-' + i;
  progressBarWidths.set('progressBar-' + i, current.style.width);
  progressBars[i].style.width = 0;
}

const isInViewport = el => {
  console.log("viewport check");
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
    (window.innerHeight ||
      document.documentElement.clientHeight) &&
    rect.right <=
    (window.innerWidth ||
      document.documentElement.clientWidth)
  );
};

const run = () =>
  progressBars.forEach(item => {
    if (isInViewport(item)) {
      item.classList.add('show');
      item.style.width = progressBarWidths.get(item.id);
    }
  }
);

window.addEventListener('load', run);
window.addEventListener('resize', run);
window.addEventListener('scroll', run);