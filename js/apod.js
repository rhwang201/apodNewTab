$(document).ready(function() {
  /**
   * Pads a string with 0's.
   */
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

  /**
   * Date -> String.
   */
  var getDateString = function(date) {
    var year  = date.getFullYear(),
        month = date.getMonth(),
        date  = date.getDate();

    return year + '-' + padString((month + 1).toString(), 2) + '-' + padString(date.toString(), 2);
  };

  /**
   * Returns a random date from apodBeginningOfTime till now.
   */
  var genRandomDate = function() {
    var today         = new Date(),
        randomPeriod  = Math.floor(Math.random() * (today - apodBeginningOfTime)),
        randomDate    = new Date(apodBeginningOfTime.valueOf() + randomPeriod);

    return randomDate;
  };

  /**
   * Encodes @imgUrl in base64, then calls @callback.
   */
  var encodeBase64Image = function(imgUrl, callback) {
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

      callback(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    };
  }

  /**
   * Sets the time.
   */
  var setTime = function() {
    var now     = new Date(),
        hour    = padString(now.getHours().toString(), 2),
        minute  = padString(now.getMinutes().toString(), 2);
    $('#apodTime').text(hour + ':' + minute);
  }

  /**
   * Blinks the ':' in the time.
   */
  var blinkTime = function() {
    var now     = new Date(),
        hour    = padString(now.getHours().toString(), 2),
        minute  = padString(now.getMinutes().toString(), 2);

    var time = $('#apodTime').text();
    time = (time.indexOf(':') > -1) ? (hour + ' ' + minute) : (hour + ':' + minute);

    $('#apodTime').text(time);
  }

  /**
   * Hits APOD API.
   */
  var getApod = function(date, callback) {
    var dateString = getDateString(date),
        cachedString = localStorage['apodNewTab_' + dateString],
        cachedApod = cachedString ? JSON.parse(cachedString) : undefined;

    // TODO rhwang: do not inspect DOM when using encoded image. It is too large and will
    // crash developer tools.
    if (true) {
    //if (cachedApod === undefined) {
      var url = 'https://api.data.gov/nasa/planetary/apod?' +
                'api_key=xA6qXqQnycGiLMWi93CSQ0qCGhXRiZMBqdoeO8vs&' +
                'date=' + dateString;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';

      xhr.onload = function() {
        localStorage['apodNewTab_currentDate'] = date.toString();
        currentDate = date;
        callback.apply(this);
      };
      xhr.onerror = function() {
        console.log('xhr error: ', xhr);
      };

      xhr.send();
    } else {
      currentDate = date;

      var cachedImage       = cachedApod.image,
          cachedDate        = cachedApod.date,
          cachedExplanation = cachedApod.explanation,
          cachedTitle       = cachedApod.title,
          isRandom          = cachedApod.isRandom;

      // TODO check if random...
      //if (isRandom) {
      //  var date = genRandomDate();
      //}

      render(cachedImage, cachedTitle, true, cachedDate, cachedExplanation);
    }
  };

  /**
   * Renders and caches.
   */
  var handleApod = function() {
    var response    = this.response,
        imageUrl    = response.url,
        title       = response.title,
        date        = response.date,
        explanation = response.explanation;

    render(imageUrl, title, false, date, explanation);

    encodeBase64Image(imageUrl, function(image) {
      localStorage['apodNewTab_' + getDateString(new Date())] = JSON.stringify({
        title       : title,
        image       : image,
        date        : date,
        explanation : explanation
      });
    });
  }

  /**
   * Renders info onto page.
   */
  var render = function(image, title, isBase64Image, date, explanation) {
    image = (isBase64Image) ? 'data:image/png;base64,' + image : image;

    $(document.body).css({
      'background-image': 'url(' + image + ')',
      'background-repeat': 'no-repeat',
      'background-size': 'cover',
      'background-position': 'center center',
      'background-attachment': 'fixed',
      '-webkit-background-size': 'cover',
      '-moz-background-size': 'cover',
      '-o-background-size': 'cover'
    });

    $('#apodTitle').text(title);

    $('#modalExplanation').text(explanation);

    var today = new Date(),
        year = today.getFullYear().toString().substring(2),
        month = padString((today.getMonth() + 1).toString(), 2),
        date = padString((today.getDate()).toString(), 2);

    $('#apodLink').attr('href', 'http://apod.nasa.gov/apod/ap' + year + month + date + '.html');
  };


  /**
   * Main.
   */
  var today = new Date(),
      currentDate;
  if (localStorage['apodNewTab_currentDate'] && !isNaN(new Date(localStorage['apodNewTab_currentDate']).valueOf())) {
    currentDate = new Date((localStorage['apodNewTab_currentDate']));
  } else {
    currentDate = new Date();
  }
  var apodBeginningOfTime = new Date(1995, 5, 16);

  setTime();
  setInterval(setTime, 1000);
  setInterval(blinkTime, 1500);

  $('#left').mouseover(function() {
    $(this).find('#apodBack').fadeIn();
  });
  $('#left').mouseout(function() {
    $(this).find('#apodBack').fadeOut();
  });
  $('#right').mouseover(function() {
    $(this).find('#apodForward').fadeIn();
  });
  $('#right').mouseout(function() {
    $(this).find('#apodForward').fadeOut();
  });

  $('#apodBack').click(function() {
    // TODO Mask
    var newDate = new Date(currentDate.valueOf() - 1000 * 60 * 60 * 24);
    console.log('back: ' + newDate);
    getApod(newDate, handleApod);
  });
  $('#apodForward').click(function() {
    // TODO Mask
    var newDate = new Date(currentDate.valueOf() + 1000 * 60 * 60 * 24);
    console.log('forward: ' + newDate);
    getApod(newDate, handleApod);
  });


  getApod(currentDate, handleApod);
});
