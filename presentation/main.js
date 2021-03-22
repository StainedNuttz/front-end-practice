$(document).ready(function(){
  // create slides from JSON data
  var slides = [
    {
      "h1" : "Potatoes",
      "p" : "Delicious vegetables!"
    },
    {
      "h1": "London",
      "p": "Capital city of England"
    },
    {
      "h1": "Munich",
      "p": "Home of the Oktoberfest"
    },
    {
      "h1": "Wow",
      "p": "Used to be known as 'Shamwow'"
    },
    {
      "h1": "Plutonium",
      "p": "Dangerous Rock"
    }
  ];

  // loop through JSON data to create slides
  for (let i = 0; i < slides.length; i++) {
    var slideData = slides[i];
    generateSlide(slideData.h1, slideData.p, i+1);
  }
  // remove buttons for first and last slide
  $('.slide').children().first().find('.buttons .previous').remove();
  $('.slide').children().last().find('.buttons .next').remove();

  // assign colors to created slides
  var backgrounds = ["#FFB2E6", "#D972FF", "#B28CFF", "#8CFFDA", "#39A0ED"];
  var newIndex;
  var lastIndex = null;
  var lastColor = null;

  // for each slide, assign a random background color from the backgrounds array
  for (let i = 1; i <= $('.slide').length; i++) {
    // to avoid having slides next to each other be the same color:

    // 1. store the last color used
    // 2. delete that color from the array
    // 3. choose a color from the array which now excludes the last color
    // 4. put the old color back into the array
    // 5. store the new color into a lastColor var for the next iteration

    // first iteration check
    if (lastIndex != null) {
      // store last color in a var
      lastColor = backgrounds[lastIndex];
      // remove that color from array
      backgrounds.splice(lastIndex, 1);
    }

    // randomly select a color from the new array and assign it
    // and store the chosen color for the next iteration
    lastIndex = newIndex = Math.floor(Math.random() * backgrounds.length);
    $('#slide' + i).css('background-color', backgrounds[newIndex]);

    // first iteration check
    // push that temporarily deleted color back into the array
    if (lastColor != null) { backgrounds.push(lastColor); }
  }

  // smooth scroll for each slide transition
  $('.slide a').on('click', function(event) {
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
});

function generateSlide(h1, p, i) {
  var div = document.createElement("div");
  div.id = "slide" + i;
  div.className = "slide";
  div.insertAdjacentHTML('afterbegin', '<div class="container flex"><h1>' + h1 + '</h1><p>' + p + '</p><div class="buttons"><div class="container flex"><a class="previous flex" href="#slide' + (i-1).toString() + '">Previous<i class="fas fa-arrow-circle-up"></i></a><a class="next flex" href="#slide' + (i+1).toString() + '">Next<i class="fas fa-arrow-circle-down"></i></a></div></div></div>');

  $('body').append(div);
}