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

$.fn.LiveEdit = function ( method ) {
  var options = {};

  var methods = {

    /*
     * Init
     */
    init: function ( options ) {
      /*
       * Options
       */
      var options = $.extend({
        'defaultType':  'text',
        'url': window.location.href,
        'postFormat': 'form',
        'jsonParseBool': false,
        'jsonParseNumeric': false,
        'customTypes': {},
      }, options);

      /*
       * Event handler
       */
      var eventFn = function () {
        methods.unlock($(this));
        var data;
        if (options.postFormat == 'json')
          data = {json:methods.toJSON($(this).data())};
        else
          data = $(this).data();
        var successFn = options.success || function () {};
        var errorFn = options.error || function () {};
        $.post(options.url, data)
          .success(successFn)
        .error(errorFn);
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
          case 'contentEditable':
            clickFn = function (ev) {
              // prevent multiple clicks from spamming the server
              if (methods.isLocked($(this))) return;
              else methods.lock($(this));
              var e = $(this);
              var i, focusoutFn;
              i = $(this);
              i.prop('contentEditable', true);
              focusoutFn = function () {
                i.prop('contentEditable', false);
                i.data('value', i.html());
                $(this).triggerHandler('LiveEdit');
              };
              i.off('LiveEdit', eventFn).on('LiveEdit', eventFn);
              i.focus();
              i.off('focusout').focusout(focusoutFn);
            };
            break;

          case 'text':
            clickFn = function (ev) {
              var e = $(this);
              var i, focusoutFn;
              e.hide();
              var w = $(e.wrap('<div data-role="LiveEditWrapper"></div>').parent()[0]);
              w.append('<input type="text" value="'+e.html()+'" />');
              i = $(w.find('input')[0]);
              // prevent multiple clicks from spamming the server
              if (methods.isLocked(i)) return;
              else methods.lock(i);
              i.data(e.data());
              focusoutFn = function () {
                e.html(i.val());
                i.data('value', i.val());
                i.hide();
                e.show();
                $(this).triggerHandler('LiveEdit');
              };
              i.off('LiveEdit', eventFn).on('LiveEdit', eventFn);
              i.focus();
              i.off('focusout', focusoutFn).focusout(focusoutFn);
            };
            break;

          case 'bool':
            o.on('LiveEdit', eventFn);
            clickFn = function (ev) {
              // prevent multiple clicks from spamming the server
              if (methods.isLocked($(this))) return;
              else methods.lock($(this));
              if ($(this).data('value') === true) $(this).data('value', false);
              else $(this).data('value', true);
              $(this).triggerHandler('LiveEdit');
            };
            break;

          default:
            if (typeof options.customTypes[type] === 'function') {
              clickFn = options.customTypes[type](this, eventFn);
            }
            break;
        }
        o.off('click', clickFn).click(clickFn);
      });
    },

    /*
     * Assemble the values contained in o as a JSON string
     */
    toJSON: function ( obj ) {
      var nvPairs = []; // name/value pairs
      for (var name in obj) {
        if (typeof obj[name] != 'undefined') {
          var value = obj[name];
          var toPush = '';
          if (options.jsonInterpretBool && value === true) toPush = 'true';
          else if (options.jsonParseBool && value === false) toPush = 'false';
          else if (options.jsonParseBool && (value === 'true' || value === 'false')) toPush = value;
          else if (options.jsonParseNumeric && value.match(/^[-0-9,.\s]+$/) !== null) toPush = parseInt(value);
          else toPush = '"'+value+'"';
          nvPairs.push('"'+name+'":'+toPush);
        }
      }
      return '{'+nvPairs.join(',')+'}';
    },

    /*
     * Lock/unlock element for event
     */
    lock: function (o) { o.data('_locked', true); },
    unlock: function (o) { o.removeData('_locked'); },
    isLocked: function (o) { if (o.data('_locked')) return true; else return false },

  }

  method = 'init' || method;
  if (typeof methods[method] === 'function') return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
};

})(jQuery);
