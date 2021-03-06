/**
 * jquery.LiveEdit.js
 *
 * Copyright (c) 2013, Matt Ferris
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
      options = $.extend({
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

        var data = $(this).data();
        var url = data.url || options.url;
        var postFormat = data.postFormat || options.postFormat;
        var jsonOptions = {
          parseBool: options.jsonParseBool,
          parseNumeric: options.jsonParseNumeric
        }

        if (typeof data.jsonParseBool != 'undefined' && data.jsonParseBool) jsonOptions.parseBool = true;
        if (typeof data.jsonParseBool != 'undefined' && !data.jsonParseBool) jsonOptions.parseBool = false;
        if (typeof data.jsonParseNumeric != 'undefined' && data.jsonParseNumeric) jsonOptions.parseNumeric = true;
        if (typeof data.jsonParseNumeric != 'undefined' && !data.jsonParseNumeric) jsonOptions.parseNumeric = false;

        if (postFormat == 'json')
          data = {json:methods.toJSON(data, jsonOptions)};

        var successFn = options.success || function () {};
        var errorFn = options.error || function () {};

        $.post(url, data)
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
              var i, focusoutFn, w;
              e.hide();
              var p = e.parent()[0];
              if (p.nodeName.toLowerCase() === 'div' && $(p).attr('data-role') === 'LiveEditWrapper') {
                w = $(p);
                i = $(w.find('input')[0]);
                i.show();
                // prevent multiple clicks from spamming the server
                if (methods.isLocked(i)) return;
                else methods.lock(i);
              } else {
                w = $(e.wrap('<div data-role="LiveEditWrapper"></div>').parent()[0]);
                w.append('<input type="text" value="'+e.html()+'" />');
                i = $(w.find('input')[0]);
                i.data(e.data());
              }
              focusoutFn = function () {
                e.html(i.val());
                i.data('value', i.val());
                i.hide();
                e.show();
                $(this).triggerHandler('LiveEdit');
              };
              i.off('LiveEdit').on('LiveEdit', eventFn);
              i.focus();
              i.off('focusout.LiveEdit').on('focusout.LiveEdit', focusoutFn);
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

          case 'send':
            o.on('LiveEdit', eventFn);
            clickFn = function (ev) {
              // prevent multiple clicks from spamming the server
              if (methods.isLocked($(this))) return;
              else methods.lock($(this));
              $(this).triggerHandler('LiveEdit');
            };
            break;

          default:
            o.on('LiveEdit', eventFn);
            if (typeof options.customTypes[type] === 'function') {
              clickFn = options.customTypes[type](o, eventFn);
            }
            break;
        }
        o.off('click', clickFn).click(clickFn);
      });
    },

    /*
     * Assemble the values contained in o as a JSON string
     */
    toJSON: function ( obj, options ) {
      var nvPairs = []; // name/value pairs
      for (var name in obj) {
        if (typeof obj[name] != 'undefined') {
          var value = obj[name];
          var toPush = value;
          if (typeof value == 'string') {
            if (options.parseBool && (value === 'true' || value === 'false')) toPush = value;
            else if (options.parseNumeric && typeof value == 'string' && value.match(/^[-0-9,.\s]+$/) !== null) toPush = parseInt(value);
            else toPush = '"'+value+'"';
          }
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

  if (typeof methods[method] === 'function')
    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
  else if (typeof method === 'object' || !method)
    return methods.init.apply(this, arguments);
  else
    $.error('Method "'+method+'" does not exist on jQuery.LiveEdit');
};

})(jQuery);
