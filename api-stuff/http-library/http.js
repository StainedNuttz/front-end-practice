function HTTP() {
  this.http = new XMLHttpRequest();
}

// GET request
HTTP.prototype.get = function(url, cb) {
  this.http.open('GET', url, true);

  let self = this;
  this.http.onload = function() {
    if (self.http.status === 200) {
      cb(null, self.http.responseText);
    } else {
      cb('ERROR: ' + self.http.status);
    }
  }
  this.http.send();
}

HTTP.prototype.post = function(url, data, cb) {
  this.http.open('POST', url, true);
  this.http.setRequestHeader('Content-type', 'application/json');

  let self = this;
  this.http.onload = function() {
    cb(null, self.http.responseText);
  }

  this.http.send(JSON.stringify(data));
}

HTTP.prototype.put = function(url, data, cb) {
  this.http.open('PUT', url, true);
  this.http.setRequestHeader('Content-type', 'application/json');

  let self = this;
  this.http.onload = function () {
    cb(null, self.http.responseText);
  }

  this.http.send(JSON.stringify(data));
}

HTTP.prototype.delete = function(url, cb) {
  this.http.open('DELETE', url, true);

  let self = this;
  this.http.onload = function () {
    if (self.http.status === 200) {
      cb(null, 'Comment successfully deleted');
    } else {
      cb('ERROR: ' + self.http.status);
    }
  }
  this.http.send();
}