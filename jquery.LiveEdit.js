/**
 * jquery.LiveEdit.js
 *
 * Copyright (c) 2012, Matt Ferris
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @author Matt Ferris <matt@bueller.ca>
 */

(function ($) {

$.fn.LiveEdit = function ( options ) {
  /*
   * Options
   */
  var options = $.extend({
    'defaultType':  'text',
    'url': window.location.href,
    'postFormat': 'form'
  }, options);

  /*
   * Assemble the values contained in o as a JSON string
   */
  var toJSON = function (o) {
    var tmp = [];
    for (var k in o) { // k is the index or key
      if (typeof o[k] != 'undefined') {
        var v = o[k]; // v is the value
        var p = ''; // p is the string to push onto tmp
        if (v.match(/^[0-9]+$/) !== null) p = o[k];
        else p = '"'+v+'"';
        tmp.push('"'+k+'":'+p);
      }
    }
    return '{'+tmp.join(',')+'}';
  };

  /*
   * Event handler
   */
  var eventFn = function () {
    var data;
    if (options.postFormat == 'json')
      data = toJSON($(this).data());
    else
      data = $(this).data();
    var successFn = options.success || function () {};
    var errorFn = options.error || function () {};
    $.post(options.url, data);
  };

  /*
   * Setup matched elements
   */
  return this.each(function () {
    var $this = $(this);
    var o = $this;

    var type = o.attr('data-type') || options.defaultType;

    var clickFn;
    switch (type) {
      case 'text':
        clickFn = function (ev) {
          var e = $(this);
          e.hide();
          var w = $(e.wrap('<div data-role="LiveEditWrapper"></div>').parent()[0]);
          w.append('<input type="text" value="'+e.html()+'" />');
          var i = $(w.find('input')[0]);
          i.data(e.data());
          i.on('LiveEdit', eventFn);
          i.focus();
          i.focusout(function () {
            e.html(i.val());
            i.data('value', i.val());
            i.hide();
            e.show();
            $(this).triggerHandler('LiveEdit');
          });
        };
        break;

      case 'bool':
        clickFn = function (ev) {
          if ($(this).data('value') == 'true') $(this).data('value', false);
          else $(this).data('value', true);
          $(this).trigger('LiveEdit');
        };
        break;
    }
    o.click(clickFn);
  });
};

})(jQuery);
