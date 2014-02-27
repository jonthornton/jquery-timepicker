Timepicker Plugin for jQuery
========================

[<img src="http://jonthornton.github.com/jquery-timepicker/lib/screenshot.png" alt="timepicker screenshot" />](http://jonthornton.github.com/jquery-timepicker)

[See a demo and examples here](http://jonthornton.github.com/jquery-timepicker)

jquery.timepicker is a lightweight timepicker plugin for jQuery inspired by Google Calendar. It supports both mouse and keyboard navigation, and weighs in at 2.5kb minified and gzipped.

Requirements
------------
* [jQuery](http://jquery.com/) (>= 1.7)

Usage
-----

```javascript
$('.some-time-inputs').timepicker(options);
```

```options``` is an optional javascript object with parameters explained below.

You can also set options as [data attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes) on the intput elements, like ```<input type="text" data-time-format="H:i:s" />```. Timepicker still needs to be initialized by calling ```$('#someElement').timepicker();```.

Options
-------

- **appendTo**  
Override where the dropdown is appended.  
Takes either a `string` to use as a selector, a `function` that gets passed the clicked input element as argument or a jquery `object` to use directly.  
*default: "body"*

- **className**  
A class name to apply to the HTML element that contains the timepicker dropdown.  
*default: null*

- **closeOnWindowScroll**  
Close the timepicker when the window is scrolled. (Replicates ```<select>``` behavior.)  
*default: false*

- **disableTimeRanges**  
Disable selection of certain time ranges. Input is an array of time pairs, like ```[['3:00am', '4:30am'], ['5:00pm', '8:00pm']]``  
*default: []*

- **disableTouchKeyboard**  
Disable the onscreen keyboard for touch devices.  
*default: false*

- **durationTime**  
The time against which ```showDuration``` will compute relative times. If this is a function, its result will be used.  
*default: minTime*

- **forceRoundTime**  
Force update the time to ```step``` settings as soon as it loses focus.  
*default: false*

- **lang**  
Language constants used in the timepicker. Can override the defaults by passing an object with one or more of the following properties: decimal, mins, hr, hrs.  
*default:* ```{
	decimal: '.',
	mins: 'mins',
	hr: 'hr',
	hrs: 'hrs'
}```

- **maxTime**  
The time that should appear last in the dropdown list. Can be used to limit the range of time options.  
*default: 24 hours after minTime*

- **minTime**  
The time that should appear first in the dropdown list.  
*default: 12:00am*

- **noneOption**  
Adds one or more custom options to the top of the dropdown. Can accept several different value types:  
Boolean (```true```): Adds a "None" option that results in an empty input value  
String: Adds an option with a custom label that results in an empty input value  
Object: Similar to string, but allows customizing the element's class name and the resulting input value. Can contain ```label```, ```value```, and ```className``` properties. ```value``` must be a string type.  
Array: An array of strings or objects to add multiple non-time options  
*default: false*

- **scrollDefaultNow**  
If no time value is selected, set the dropdown scroll position to show the current time.  
*default: false*

- **scrollDefaultTime**  
If no time value is selected, set the dropdown scroll position to show the time provided, e.g. "09:00". A string, Date object, or integer (seconds past midnight) is acceptible.   
*default: null*

- **selectOnBlur**  
Update the input with the currently highlighted time value when the timepicker loses focus.  
*default: false*

- **showDuration**  
Shows the relative time for each item in the dropdown. ```minTime``` or ```durationTime``` must be set.  
*default: false*

- **step**  
The amount of time, in minutes, between each item in the dropdown.  
*default: 30*

- **timeFormat**  
How times should be displayed in the list and input element. Uses [PHP's date() formatting syntax](http://php.net/manual/en/function.date.php).  
*default: 'g:ia'*

- **typeaheadHighlight**  
Highlight the nearest corresponding time option as a value is typed into the form input.  
*default: true*

- **useSelect**  
Convert the input to an HTML <SELECT> control. This is ideal for small screen devices. This option is not compatible with the following options: ```appendTo```, ```closeOnWindowScroll```, ```disableTouchKeyboard```, ```forceRoundTime```, ```scrollDefaultNow```, ```selectOnBlur```, ```typeAheadHighlight```.  
*default: true*

Methods
-------

- **getSecondsFromMidnight**  
Get the time as an integer, expressed as seconds from 12am.

	```javascript
	$('#getTimeExample').timepicker('getSecondsFromMidnight');
	```

- **getTime**  
Get the time using a Javascript Date object, relative to a Date object (default: today).

	```javascript
	$('#getTimeExample').timepicker('getTime'[, new Date()]);
	```

	You can get the time as a string using jQuery's built-in ```val()``` function:

	```javascript
	$('#getTimeExample').val();
	```

- **hide**  
Close the timepicker dropdown.

	```javascript
	$('#hideExample').timepicker('hide');
	```

- **option**  
Change the settings of an existing timepicker. Calling ```option``` on a visible timepicker will cause the picker to be hidden.

	```javascript
	$('#optionExample').timepicker({ 'timeFormat': 'g:ia' });
	$('#optionExample').timepicker('option', 'minTime', '2:00am');
	$('#optionExample').timepicker('option', { 'minTime': '4:00am', 'timeFormat': 'H:i' });
	```

- **remove**  
Unbind an existing timepicker element.

	```javascript
	$('#removeExample').timepicker('remove');
	```

- **setTime**  
Set the time using a Javascript Date object.

	```javascript
	$('#setTimeExample').timepicker('setTime', new Date());
	```

- **show**  
Display the timepicker dropdown.

	```javascript
	$('#showExample').timepicker('show');
	```

Events
------

- **change**  
The native ```onChange``` event will fire any time the input value is updated, whether by selection from the timepicker list or manual entry into the text input. Your code should bind to ```change``` after initializing timepicker, or use [event delegation](http://api.jquery.com/on/).

- **changeTime**  
Called after a valid time value is entered or selected. See ```timeFormatError``` and ```timeRangeError``` for error events. Fires before ```change``` event.

- **hideTimepicker**  
Called after the timepicker is closed.

- **selectTime**  
Called after a time value is selected from the timepicker list. Fires before ```change``` event.

- **showTimepicker**  
Called after the timepicker is shown.

- **timeFormatError**  
Called if an unparseable time string is manually entered into the timepicker input. Fires before ```change``` event.

- **timeRangeError**  
Called if a maxTime, minTime, or disableTimeRanges is set and an invalid time is manually entered into the timepicker input. Fires before ```change``` event.

Theming
-------

Sample markup with class names:

```html
<input value="5:00pm" class="ui-timepicker-input" type="text">
...
<div class="ui-timepicker-wrapper optional-custom-classname" tabindex="-1">
	<ul class="ui-timepicker-list">
		<li>12:00am</li>
		<li>12:30am</li>
		...
		<li>4:30pm</li>
		<li class="ui-timepicker-selected">5:00pm</li>
		<li class="ui-timepicker-disabled">5:30pm</li>
		<li>6:00pm <span class="ui-timepicker-duration">(1 hour)</span></li>
		<li>6:30pm</li>
		...
		<li>11:30pm</li>
	</ul>
</div>
```

## Packaging

Install from [Bower](http://bower.io/) as ```jquery-timepicker-jt```.

An AngularJS directive is available at https://github.com/Recras/angular-jquery-timepicker

Help
----

Submit a [GitHub Issues request](https://github.com/jonthornton/jquery-timepicker/issues/new).

Development guidelines
----------------------

1. Install dependencies (jquery + grunt) `npm install`
2. For sanity checks and minification run `grunt`, or just `grunt lint` to have the code linted

- - -

This software is made available under the open source MIT License. &copy; 2014 [Jon Thornton](http://www.jonthornton.com) and [contributors](https://github.com/jonthornton/jquery-timepicker/graphs/contributors)
