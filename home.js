$(document).ready(function() {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var json = JSON.parse(http.responseText);
      // alert(json.projects[1].name);
      $('#projects .container').html(function() { 
        var returnHtml = "";
        var parsedLanguages = "";
        var languages;
        for (let i = 0; i < json.projects.length; i++) {
          parsedLanguages = "";
          languages = json.projects[i].languages;
          for (let j = 0; j < json.projects[i].languages.length; j++) {
            parsedLanguages += `<img class="language" src="icons/${languages[j]}.svg">`;
          }

          returnHtml += `<a href="${json.projects[i].link}" class="card"><h2>${json.projects[i].name}</h2><img src="https://via.placeholder.com/200x100" alt=""><p>${json.projects[i].text}</p><div class="languages">${parsedLanguages}</div></a>`;        
        }

        return returnHtml;

      });
    }
  }

  http.open('GET', 'projects.json', true);
  http.send();
});
