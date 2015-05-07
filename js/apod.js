$(document).ready(function() {
  var padString = function(val, len) {
    if (val.length === len) {
      return val;
    } else {
      for (var i = 0; i < len - val.length; i++) {
        val = '0' + val;
      }
      return val;
    }
  }

  var getDateString = function() {
    var today = new Date(),
        year = today.getFullYear(),
        month = today.getMonth(),
        date = today.getDate();

    return year + '-' + padString((month + 1).toString(), 2) + '-' + padString(date.toString(), 2);
  };

  var cacheBase64Image = function(imgUrl) {
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = imgUrl;
    img.onload = function() {
      var canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);

      var dataURL = canvas.toDataURL("image/png");

      var encodedImage = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
      localStorage['apodNewTab_image_' + getDateString()] = encodedImage;
    };
  }

  var setTime = function() {
    var now     = new Date(),
        hour    = padString(now.getHours().toString(), 2),
        minute  = padString(now.getMinutes().toString(), 2);
    $('#apodTime').text(hour + ':' + minute);
  }

  var blinkTime = function() {
    var now     = new Date(),
        hour    = padString(now.getHours().toString(), 2),
        minute  = padString(now.getMinutes().toString(), 2);

    var time = $('#apodTime').text();
    time = (time.indexOf(':') > -1) ? (hour + ' ' + minute) : (hour + ':' + minute);

    $('#apodTime').text(time);
  }

  var handleApod = function() {
    var response    = xhr.response,
        imageUrl    = response.url,
        title       = response.title,
        explanation = response.explanation;

    render(imageUrl, title);

    cacheBase64Image(imageUrl);
    localStorage['apodNewTab_title_' + getDateString()] = title;
    localStorage['apodNewTab_explanation_' + getDateString()] = explanation;
  }

  var render = function(image, title, isBase64Image) {
    image = (isBase64Image) ? 'data:image/png;base64,' + image: image;

    $(document.body).css({
      'background-image': 'url("' + image + '")',
      'background-repeat': 'no-repeat',
      'background-position': 'center center',
      'background-attachment': 'fixed',
      '-webkit-background-size': 'cover',
      '-moz-background-size': 'cover',
      '-o-background-size': 'cover',
      'background-size': 'cover'
    });

    $('#apodTitle').text(title);
  };


  /**
   * Main.
   */
  setTime();
  setInterval(setTime, 60000);
  setInterval(blinkTime, 1500);

  var dateString        = getDateString(),
      cachedImage       = localStorage['apodNewTab_image_' + dateString],
      cachedTitle       = localStorage['apodNewTab_title_' + dateString],
      cachedDescription = localStorage['apodNewTab_description_' + dateString];

  if (cachedImage === undefined || cachedTitle === undefined || cachedDescription === undefined) {
    // Clear cache
    for (var key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.substring(0, 10) === 'apodNewTab') {
        delete localStorage[key];
      }
    }

    var url = 'https://api.data.gov/nasa/planetary/apod' +
              '?api_key=xA6qXqQnycGiLMWi93CSQ0qCGhXRiZMBqdoeO8vs&' +
              'date=' + dateString;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = handleApod;
    xhr.onerror = function() {
      console.log('xhr error: ', xhr);
    };

    xhr.send();
  } else {
    render(cachedImage, cachedTitle, true);
  }
});
