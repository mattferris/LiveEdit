/*
 * Unit tests for LiveEdit
 */


var fx = $('#qunit-fixture');


module('"send" tests', {
  setup: function(){ fx.append('<div id="a" data-type="send"></div>'); },
  teardown: function(){ $('#a').off('LiveEdit'); fx.empty(); }
});

asyncTest('error callback test', 1, function () {
  $('#a').LiveEdit({
    url: 'badurl.html',
    error: function(){ ok(true, 'error callback'); start(); }
  });
  $('#a').trigger('click');
});

asyncTest('success callback test', 1, function () {
  $('#a').LiveEdit({
    success: function(){ ok(true, 'success callback'); start(); }
  });
  $('#a').trigger('click');
});


//module('"text" tests');


//module('"contentEditable" tests');


//module('"bool" tests');


//module('custom tests');


module('options override', {
  setup: function(){ fx.append('<div id="a" data-type="send"></div>'); },
  teardown: function(){ $('#a').off('LiveEdit'); fx.empty(); }
});

asyncTest('override url', 1, function () {
  $('#a').LiveEdit({
    success: function(){ ok(false, 'failed to override url'); start(); },
    error: function(){ ok(true, 'success using override url'); start(); }
  });
  $('#a').attr('data-url', 'badurl.html');
  $('#a').trigger('click');
});

asyncTest('override postFormat', 1, function () {
  $('#a').LiveEdit({
    url: 'echo.php',
    success: function (response) {
      response = $.parseJSON(response);
      equal(response.postFormat, 'json', 'success using override postFormat');
      start();
    }
  });
  $('#a').attr('data-post-format', 'json');
  $('#a').trigger('click');
});

asyncTest('override jsonParseBool/jsonParseNumeric', 2, function () {
  $('#a').LiveEdit({
    url: 'echo.php',
    postFormat: 'json',
    success: function (response) {
      response = $.parseJSON(response);
      equal(typeof response.bool, 'boolean', 'jsonParseBool');
      equal(typeof response.number, 'number', 'jsonParseNumeric');
      start();
    }
  });
  $('#a').attr('data-json-parse-bool', 'true')
         .attr('data-json-parse-numeric', 'true')
         .attr('data-bool', 'true')
         .attr('data-number', '1');
  $('#a').trigger('click');
});

