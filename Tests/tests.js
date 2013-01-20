/*
 * Unit tests for LiveEdit
 */

var fx = $('#qunit-fixture');

var setupFn = function (type, attrs) { 
  type = type || 'text';
  attrs = attrs || {};
  fx.append('<div id="a" data-type="'+type+'"></div>');
  for (i in attrs) {
    $('#a').attr('data-'+i, attrs[i]);
  }
};
var teardownFn = function () {
  $('#qunit-fixture *').off('click');
  $('#qunit-fixture *').off('focusout');
  $('#qunit-fixture *').off('LiveEdit');
  fx.empty();
};


/***** general *****/

module('general', {
  setup: function(){setupFn('send');},
  teardown: teardownFn
});

  asyncTest('click event', 1, function () {
    $('#a')
      .click(function(){ ok(true, 'caught click'); start(); })
      .LiveEdit().click();
  });

  asyncTest('success callback', 1, function () {
    $('#a')
      .LiveEdit({
        success: function(){ ok(true, 'success callback'); start(); },
        error: function(){ ok(false, 'error callback'); start(); }
      })
      .click();
  });

  asyncTest('error callback', 1, function () {
    $('#a')
      .LiveEdit({
        url: 'badurl.html',
        success: function(){ ok(false, 'success callback'); start(); },
        error: function(){ ok(true, 'error callback'); start(); }
      })
      .click();
  });


/***** send *****/

module('send type', {
  setup: function(){setupFn('send');},
  teardown: teardownFn
});

  asyncTest('integrated', 1, function () {
    $('#a')
      .LiveEdit({
        url: 'echo.php',
        postFormat: 'json',
        success: function (response) {
          response = $.parseJSON(response);
          equal(response.foo, 'bar', 'successful');
          start();
        }
      })
      .attr('data-foo', 'bar').click();
  });


/***** text *****/

module('text type', {
  setup: setupFn,
  teardown: teardownFn
});

  test('wrapper div', 1, function () {
    $('#a').LiveEdit().click();
    deepEqual($('div[data-role="LiveEditWrapper"]').length, 1, 'found wrapper');
  });

  asyncTest('blur event', 1, function () {
    $('#a').LiveEdit().click();
    $('input')
      .focusout(function(){ $('input').off('focusout'); ok(true, 'caught focusout'); start(); })
      .blur();
  });

  asyncTest('integrated', 1, function () {
    $('#a')
      .LiveEdit({
        url: 'echo.php',
        postFormat: 'json',
        success: function (response) {
          response = $.parseJSON(response);
          equal(response.value, 'test', 'success');
          start();
        },
        error: function(){ ok(false, 'failed'); start(); }
      })
      .text('test').click();
    $('input').blur();
  });


/***** contentEditable *****/

module('contentEditable type', {
  setup: function(){setupFn('contentEditable');},
  teardown: teardownFn
});

  asyncTest('click sets contentEditable', 1, function () {
    $('#a').LiveEdit().click();
    deepEqual($('#a').prop('contentEditable'), 'true', 'contentEditable is on'); start();
  });

  asyncTest('blur event', 1, function () {
    $('#a')
      .LiveEdit().click()
      .focusout(function(){ $('input').off('focusout'); ok(true, 'caught focusout'); start(); })
      .blur();
  });

  asyncTest('integrated', 1, function () {
    $('#a')
      .LiveEdit({
        url: 'echo.php',
        postFormat: 'json',
        success: function (response) {
          response = $.parseJSON(response);
          equal(response.value, '<i>test</i>', 'success');
          start();
        }
      })
      .html('<i>test</i>').click().blur();
  });


/***** bool *****/

module('bool', {
  setup: function(){setupFn('bool', {value: 'true'});},
  teardown: teardownFn
});

  asyncTest('click toggles value', 2, function () {
    equal($('#a').data('value'), true, 'value currently true');
    $('#a')
      .LiveEdit({
        success: function(){ equal($('#a').data('value'), false, 'value now false'); start(); }
      })
      .click();
  });


/**** custom type *****/

module('custom type', {
  setup: function(){ setupFn('custom'); },
  teardown: teardownFn
});

  asyncTest('integrated', 1, function () {
    $('#a')
      .LiveEdit({
        success: function(){ ok(true, 'success'); start(); },
        customTypes: {
          custom: function (o,e) {
            return function (e) {
              o.triggerHandler('LiveEdit');
            }
          }
        }
      })
      .click();
  });


/***** options override *****/

module('options override', {
  setup: function(){setupFn('send');},
  teardown: teardownFn
});

  asyncTest('url', 1, function () {
    $('#a')
      .LiveEdit({
        success: function(){ ok(false, 'failed to override url'); start(); },
        error: function(){ ok(true, 'success using override url'); start(); }
      })
      .attr('data-url', 'badurl.html').click();
  });

  asyncTest('postFormat', 1, function () {
    $('#a')
      .LiveEdit({
        url: 'echo.php',
        success: function (response) {
          response = $.parseJSON(response);
          equal(response.postFormat, 'json', 'success using override postFormat');
          start();
        }
      })
      .attr('data-post-format', 'json').click();
  });

  asyncTest('jsonParseBool/jsonParseNumeric', 2, function () {
    $('#a')
      .LiveEdit({
        url: 'echo.php',
        postFormat: 'json',
        success: function (response) {
          response = $.parseJSON(response);
          equal(typeof response.bool, 'boolean', 'jsonParseBool');
          equal(typeof response.number, 'number', 'jsonParseNumeric');
          start();
        }
      })
      .attr('data-json-parse-bool', 'true')
      .attr('data-json-parse-numeric', 'true')
      .attr('data-bool', 'true')
      .attr('data-number', '1')
      .click();
  });

