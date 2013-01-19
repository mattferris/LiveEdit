/*
 * Unit tests for LiveEdit
 */


var fx = $('#qunit-fixture');


module('"send" data-type tests', {
  setup: function(){ fx.append('<div id="a" data-type="send"></div>'); },
  teardown: function(){ $('#a').off('LiveEdit'); fx.empty(); }
});

asyncTest('"send" data-type error callback test', 1, function () {
  $('#a').LiveEdit({
    url: 'badurl.html',
    error: function(){ ok(true, 'Called error callback'); start(); }
  });
  $('#a').trigger('click');
});

asyncTest('"send" data-type success callback test', 1, function () {
  $('#a').LiveEdit({
    success: function(){ ok(true, 'Called success callback'); start(); }
  });
  $('#a').trigger('click');
});


//module('"text" data-type tests');


//module('"contentEditable" data-type tests');


//module('"bool" data-type tests');


//module('custom data-type tests');


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
