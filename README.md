LiveEdit
========

LiveEdit is a jquery plugin that simplifies inline editing of page elements and posting the changes back to the server.

Synopsis
--------

    $('selector').LiveEdit(options);

    // where options defaults to

    {
      defaultType: 'text', // 'bool', 'contentEditable' or 'text'
      jsonParseBool: false, // false or true
      jsonParseNumeric: false, // false or true
      postFormat: 'form', // 'form' or 'json'
      url: window.location.href // a valid URL
    }
    
Setup
-----

Include the jQuery and LiveEdit scripts in your page and bind LiveEdit to an element.

    <script>$('#editable').LiveEdit();</script>
    ...
    <div id="editable" data-type="text">Content goes here</div>

When `#editable` is clicked on, LiveEdit will make the element editable. When the element loses focus, LiveEdit captures the udpated content and sends the data back to the server using an ajax request.

By default, the URL for the ajax request is set to the current URL. To change this, set the `url` option when loading LiveEdit, or specify the url using a `data-url` attribute on the element'

    $('#editable').LiveEdit({url: '/some/url.php'});

    // or

    <div id="editable" data-type="text" data-url="someurl.html">...</div>

Data Types
----------

The default data type can be set via the `defaultType` option.

### text

Replaces wraps the element in a `div` and appends an `input` element.

    <p data-type="text">Text for this paragraph.</p>

    <!-- becomes... -->

    <div data-role="LiveEdit">
      <p data-type="text">Text for this paragraph.</p>
      <input type="text" style="display:none;" />
    </div>

When the `p` element is clicked, it's value is copied to the `input` element. The `p` element is hidden and the `input` is shown.

    <!-- on click -->
    <div data-role="LiveEdit">
      <p data-type="text" style="display:none;">Text for this paragraph.</p>
      <input type="text" value="Text for this paragraph" />
    </div>

When the `input` element loses focus, it's value is capture and sent to the server. As well the `input` element is hidden and the `p` element is shown again.

### bool

Used for cases where a simple binary state needs to be tracked. The initial state can be set via the `data-value` attribute.

    <a href="#" data-type="bool" data-value="true">Change state</a>

In the example above, when clicked the value will change to `false` and then be sent to the server. Clicking it again will set the value to `true`.

### contentEditable

Available for `div` elements. When clicked, the `div` is set to `contentEditable="true"`. When focus is lost, the contents of the `div` is sent to the server.

### Custom types

Custom types can be defined through the `customTypes` key. The name of the key is the name of the type and the value must be a function. This function is passed two arguments: `obj` which is the jQuery wrapped object matched by the selector pattern (`#foo` in this case); `eventFn` which is the event handler that should be bound to the `LiveEdit` event on `obj` (and is bound by default). The function must return a second function to be used as the click event on `obj`.

    $('#foo').LiveEdit({
      customTypes: {
        bar: function (obj, eventFn) {
          return function (e) {
            // custom handling goes here
          };
        };
      }
    }); 

`bar` can now be used as a value for `data-type`.

    <div id="foo" data-type="bar">...</div>

#### A note on event locking

LiveEdit suppresses multiple events from firing at the same time by using event locking. Essentially, event locking ensures only one event can fire at a time. Custom types should incorporate event locking. Building on the custom type example above, event locking could be incorporated like so.

    $('#foo').LiveEdit({
      customTypes: {
        bar: function (obj, eventFn) {
          return function (e) {

            // if object is locked, ignore the event, otherwise lock it
            if ($().LiveEdit('isLocked', obj) return;
            else $().LiveEdit('lock', obj);

            // custom handling goes here

          };
        };
      }
    }); 

Elements are automatically unlocked once the event has been processed.

Attaching Additional Data
-------------------------

Simply sending the value of an element to the server isn't particularly useful. Attaching additional information to the element can serve as meta data that will help the server appropriately process the information.

    <div id="foo" data-type="text" data-user-id="32" data-role="status">Type your status...</div>

When the above example is sent to the server it will include the `data-*` attributes. More specifically, it will include any data returned by `jQuery.data()`.

    var d = $('#foo').data();

    // which is equivalent to

    var d = {
      type:   'text',
      userId: '32',
      role:   'status',
      value:  'Type your status...'
    };

Format of POST'd data
---------------------

The data is sent to the server as a HTTP POST request using ajax. This behaviour can be modified using the `postFormat` option or the `data-post-format` attribute on the element.

    var options = {postFormat: 'form'};
    // or
    var options = {postFormat: 'json'};

    $('#foo').LiveEdit(options);

    --

    <div data-post-format="form" ...
    <!-- or -->
    <div data-post-format="json" ...


### form

Data sent to the server is available as a typical POST request. In PHP, the `$_POST` array would look like

    // PHP $_POST array after AJAX request
    $_POST = array(
      'type' => 'text',
      'userId' => '32',
      'role' => 'status',
      'value' => 'Type your status...'
    )

### json

Data sent to the server is available as JSON. In PHP, this would be accessible like so

    // Access POST'd JSON data in PHP
    $_POST = array( 
      'json' => '{"type":"text","userId":"32","role":"status","value":"Type your status..."}'
    )

The JSON parser can be told to identify boolean and numeric values by setting `jsonParseBool: true` and `jsonParseNumeric: true` respectively or by specifying the equivalent attributes on the element (`data-json-parse-bool="true"` and `data-json-parse-numeric="true"`).

    <script>
      var options = {
        postFormat: 'json',
        jsonParseBool: true,
        jsonParseNumeric: true
      };
      $('#foo').LiveEdit(options);
    </script>
    <a id="foo" href="#" data-type="bool" data-user-id="32" data-value="true">Click</a>

When clicked, the result JSON will look like

    // submitted JSON with jsonParseBool and jsonParseNumeric set to true
    {
      "type": "bool",
      "userId": 32,
      "value": false
    }
