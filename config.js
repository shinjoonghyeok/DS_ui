app.config(function($stateProvider, $urlRouterProvider) {

  var path = {
    path: '^/datalog-dsui/datalog-dsui'
  };
  var absPath = {
    absPath: '/apps/datalog-dsui/datalog-dsui',
    idxPage: 'index.html'
  };


  function replace(str, keys) {
    return str.replace(/{[^{}]+}/g, function(key) {
      return keys[key.replace(/[{}]+/g, '')] || '';
    });
  }


  $stateProvider
    .state('SCH', {
      url: replace('{path}/datalog/', path),

      views: {
        '': {
          templateUrl: replace('{absPath}/datalog/logSearch.html', absPath)
        }
      },
      onExit: function() {

        console.log('onExit')
      }
    })
});


app.filter('prettyJSON', function() {
  function prettyPrintJson(json) {
    return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
  }
  return prettyPrintJson;
});


app.filter('cutString', function() {
  return function(item) {

    if (item != null) {
      var rtnVal = "";
      var aryStr = item.split(',');
      //log("aryStr", aryStr);

      if (aryStr.length > 3) {
        var etc = aryStr.length - 3;
        rtnVal = aryStr[0] + "," + aryStr[1] + "," + aryStr[2] + "... 외 " + etc + "건";
      } else
        rtnVal = item;

    }
    return rtnVal;
  };
});

app.filter('dateFormatter', function() {
  return function(item) {
    var rtnVal = "";

    if (item == null || item == "" || typeof item == "undefined") {
      rtnVal = "";
    } else {
      rtnVal = item.substr(0, 19);
    }

    return rtnVal;
  };
});

app.filter('duration', function() {
  //Returns duration from milliseconds in hh:mm:ss format.
  return function(millseconds) {
    var timeString = '';
    if (typeof(millseconds) == "undefined") {
      timeString = "백업완료";
    } else {
      var seconds = Math.floor(millseconds / 1000);
      var h = 3600;
      var m = 60;
      var hours = Math.floor(seconds / h);
      var minutes = Math.floor((seconds % h) / m);
      var scnds = Math.floor((seconds % m));

      if (scnds < 10) scnds = "0" + scnds;
      if (hours < 10) hours = "0" + hours;
      if (minutes < 10) minutes = "0" + minutes;
      timeString = hours + ":" + minutes + ":" + scnds;
    }
    return timeString;
  }
});

app.filter('chkuseyn', function() {
  return function(item) {

    if (item != null) {
      var rtnVal = "";

      if (item == "Y")
        rtnVal = "true";
    }
    return rtnVal;
  };
});

app.filter('chkNumber', function($filter) {
  return function(value, fractionSize) {
    if (!angular.isNumber(value)) {
      return value;
    }

    return $filter('number')(value, fractionSize);
  }
});


app.filter('Filesize', function() {
  return function(size) {
    if (isNaN(size))
      size = 0;
    if(size == null)
      size = 0;
    if(size == "null")
      size = 0;

    if (size < 1024)
      return size + ' Bytes';

    size /= 1024;

    if (size < 1024)
      return size.toFixed(2) + ' Kb';

    size /= 1024;

    if (size < 1024)
      return size.toFixed(2) + ' Mb';

    size /= 1024;

    if (size < 1024)
      return size.toFixed(2) + ' Gb';

    size /= 1024;

    return size.toFixed(2) + ' Tb';
  };
});


app.run(function($translatePartialLoader) {
  $translatePartialLoader.addPart('/apps/datalog-dsui/datalog-dsui/locales');
});

//# sourceURL=apps/datalog-dsui/datalog-dsui/config.js
