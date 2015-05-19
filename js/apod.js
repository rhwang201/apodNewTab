/**
 * @author Richard Hwang
 * Astronomy Picture of the Day New Tab
 */

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
   * @param {Date} date
   * @return {String}
   * Date -> String.
   */
  var getDateString = function(date) {
    var year  = date.getFullYear(),
        month = date.getMonth(),
        date  = date.getDate();

    return year + '-' + padString((month + 1).toString(), 2) + '-' + padString(date.toString(), 2);
  };

  /**
   * @return {Date}
   * Returns a random date from apodBeginningOfTime till now.
   */
  var genRandomDate = function() {
    var today         = new Date(),
        randomPeriod  = Math.floor(Math.random() * (today - apodBeginningOfTime)),
        randomDate    = new Date(apodBeginningOfTime.valueOf() + randomPeriod);

    return randomDate;
  };

  /**
   * @param {Date} date
   * @return {Date}
   * Clears time components of @date.
   */
  var clearTime = function(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  }

  /**
   * @param {String} imgUrl
   * @param {function} callback
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
  };

  /**
   * @param {function} funk
   * @return {function}
   */
  var apodMove = function(funk) {
    return function() {
      var newDate = new Date(funk(currentDate.valueOf(), 1000 * 60 * 60 * 24));
      if (clearTime(new Date()) < clearTime(new Date(newDate))) {
        $('#futureModal').modal('toggle');
        return;
      }
      getApod(newDate, handleApod);
    };
  }
  var apodBackward = apodMove(function(x, y) { return x - y; });
  var apodForward = apodMove(function(x, y) { return x + y; });

  /**
   * Set up hotkeys.
   */
  var setupHotkeys = function() {
    $(document).keypress(function(e) {
      var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
      if (!charCode) {
        return;
      }

      var key;
      switch (charCode) {
        case 37:
          key = 'left';
          break;
        case 39:
          key = 'right';
          break;
        default:
          key = String.fromCharCode(charCode);
          break;
      }
      switch (key) {
        case '?':
          $('#helpModal').modal('toggle');
          break;
        case 'd':
          $('#explanationModal').modal('toggle');
          break;
      }
    });


    $(document).keydown(function(e) {
      switch (e.keyCode) {
        case 37:
          apodBackward();
          break;
        case 39:
          apodForward();
          break;
      }
    });
  };

  /**
   * Listeners on carousel events.
   */
  var setupCarousel = function() {
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

    $('#apodBack').click(apodBackward);
    $('#apodForward').click(apodForward);
  };

  /**
   * Jumps to today.
   */
  var setupHome = function() {
    $('#today').click(function(e) {
      var newDate = new Date();
      getApod(newDate, handleApod);
    });
  };

  /**
   * Handles random mode.
   */
  var setupRandom = function() {
    var state = localStorage['isRandom'] === 'true';
    $('#random').css('color', state ? 'orange' : 'white');

    $('#random').click(function(e) {
      var state = localStorage['isRandom'] !== 'true';
      $('#random').css('color', state ? 'yellow' : 'white');
      localStorage['isRandom'] = state;

    });
  };

  /**
   * @param {Date} date
   * @param {function} callback
   * Hits APOD API.
   */
  var getApod = function(date, callback) {
    console.log('getApod' + date);
    var dateString = getDateString(date),
        cachedString = localStorage[dateString],
        cachedApod = cachedString ? JSON.parse(cachedString) : undefined;

    if (cachedApod === undefined) {
      var url = 'https://api.data.gov/nasa/planetary/apod?' +
                'api_key=xA6qXqQnycGiLMWi93CSQ0qCGhXRiZMBqdoeO8vs&' +
                'date=' + dateString;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';

      xhr.onload = function() {
        localStorage['currentDate'] = clearTime(new Date(date)).toString();
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

      render(cachedImage, cachedTitle, false, cachedDate, cachedExplanation);
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

    try {
      localStorage[date] = JSON.stringify({
        title       : title,
        image       : imageUrl,
        date        : date,
        explanation : explanation
      });
    } catch(e) {
      console.log('localStorage set failed.');
    }
  }

  /**
   * @param {String} image
   * @param {String} title
   * @param {Boolean} isBase64Image
   * @param {String} date
   * @param {String} explanation
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

    $('#modal-title').text(date);
    $('#modal-explanation').text(explanation);

    var date = new Date(date),
        year = date.getFullYear().toString().substring(2),
        month = padString((date.getMonth() + 1).toString(), 2),
        date = padString((date.getDate() + 1).toString(), 2);

    $('#apodLink').attr('href', 'http://apod.nasa.gov/apod/ap' + year + month + date + '.html');
  };




  /**
   * MAIN.
   */
  var apodBeginningOfTime = new Date(1995, 5, 16);

  var today = new Date(),
      lastOpenedString = localStorage['lastOpened'],
      lastOpened = new Date(lastOpenedString),
      cachedCurrentDateString = localStorage['currentDate'],
      cachedCurrentDate = new Date(cachedCurrentDateString),
      isRandom = localStorage['isRandom'] === 'true',
      currentDate;

  if (isNaN(cachedCurrentDate.valueOf())) {
    currentDate = clearTime(new Date());
  } else {
    if (isNaN(lastOpened.valueOf()) || (clearTime(new Date(lastOpened)) < clearTime(new Date(today)))) {
      currentDate = clearTime(new Date());
    } else if (isRandom === true) {
      currentDate = clearTime(genRandomDate());
    } else {
      currentDate = cachedCurrentDate;
    }
  }
  localStorage['lastOpened'] = clearTime(new Date(today)).toString();

  setTime();
  setInterval(setTime, 1000);
  setInterval(blinkTime, 1500);
  setupHotkeys();
  setupCarousel();
  setupHome();
  setupRandom();


  getApod(currentDate, handleApod);
});
