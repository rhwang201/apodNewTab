$(document).ready(function() {
  /**
   * @private
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
   * @private
   */
  var getDateString = function() {
    var today = new Date(),
        year = today.getFullYear(),
        month = today.getMonth(),
        date = today.getDate();

    return year + '-' + padString((month + 1).toString(), 2) + '-' + padString(date.toString(), 2);
  };

  var setTime = function() {
    var now     = new Date(),
        hour    = now.getHours(),
        minute  = now.getMinutes();
    $('#apodTime').text(hour + ':' + minute);
  }

  /**
   * Main function.
   */
  var handleApod = function() {
    var response = xhr.response,
        imageUrl = response.url,
        title   = response.title;

    $(document.body).css({
      'background-image': 'url("' + imageUrl + '")',
      'background-repeat': 'no-repeat',
      'background-position': 'center center',
      'background-attachment': 'fixed',
      '-webkit-background-size': 'cover',
      '-moz-background-size': 'cover',
      '-o-background-size': 'cover',
      'background-size': 'cover'
    });

    $('#apodTitle').text(title);

    // TODO rhwang: cache the image
  }

  setTime();
  setTimeout(setTime, 60000);

  var dateString = getDateString(),
      cachedImage = localStorage['apodNewTab_' + dateString];

  if (cachedImage === undefined) {
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
  }
});
