$(document).ready(function() {

  document.ontouchmove = function(e){
    e.preventDefault();
  }

  document.getElementsByTagName("input").onfocus = function() {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
  }

});