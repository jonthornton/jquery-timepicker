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

Options
-------

- **className**
A class name to apply to the HTML element that contains the timepicker dropdown.
*default: null*

- **minTime**
The time that should appear first in the dropdown list.
*default: 12:00am*

- **maxTime**
The time that should appear last in the dropdown list. Can be used to limit the range of time options.
*default: 24 hours after minTime*

- **showDuration**
Shows the relative time for each item in the dropdown. ```minTime``` or ```durationTime``` must be set.
*default: false*

- **durationTime**
The time against which ```showDuration``` will compute relative times.
*default: minTime*

- **step**
The amount of time, in minutes, between each item in the dropdown.
*default: 30*

- **timeFormat**
How times should be displayed in the list and input element. Uses [PHP's date() formatting syntax](http://php.net/manual/en/function.date.php).
*default: 'g:ia'*

- **scrollDefaultNow**
If no time value is selected, set the dropdown scroll position to show the current time.
*default: false*

- **selectOnBlur**
Update the input with the currently highlighted time value when the timepicker loses focus.
*default: false*

- **appendTo**
Override where the dropdown is appended.
Takes either a `string` to use as a selector, a `function` that gets passed the clicked input element as argument or a jquery `object` to use directly
*default: "body"*

- **lang**
Language constants used in the timepicker. Can override the defaults by passing an object with one or more of the following properties: decimal, mins, hr, hrs.
*default:* ```{
	decimal: '.',
	mins: 'mins',
	hr: 'hr',
	hrs: 'hrs'
}```



Methods
-------

- **getTime**
Get the time using a Javascript Date object, relative to today's date.

	```javascript
	$('#getTimeExample').timepicker('getTime');
	```

	You can get the time as a string using jQuery's built-in ```val()``` function:

	```javascript
	$('#getTimeExample').val();
	```

- **getSecondsFromMidnight**
Get the time as an integer, expressed as seconds from 12am.

	```javascript
	$('#getTimeExample').timepicker('getSecondsFromMidnight');
	```

- **setTime**
Set the time using a Javascript Date object.

	```javascript
	$('#setTimeExample').timepicker('setTime', new Date());
	```

- **option**
Change the settings of an existing timepicker.

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

Events
------

- **showTimepicker**
Called when the timepicker is shown.

- **hideTimepicker**
Called when the timepicker is closed.

- **changeTime**
Called when a time value is selected.

- **timeFormatError**
Called if an unparseable time string is manually entered into the timepicker input.

Theming
-------

Sample markup with class names:

```html
<span class="ui-timepicker-container">
	<input value="5:00pm" class="ui-timepicker-input" type="text">
	<ul class="ui-timepicker-list optional-custom-classname" tabindex="-1">
		<li>12:00am</li>
		<li>12:30am</li>
		...
		<li>4:30pm</li>
		<li class="ui-timepicker-selected">5:00pm</li>
		<li>5:30pm</li>
		...
		<li>11:30pm</li>
	</ul>
</span>
```

Development guidelines
----------------------

1. Install dependencies (jquery + grunt) `npm install`
2. For sanity checks and minification run `grunt`, or just `grunt lint` to have the code linted

- - -

This software is made available under the open source MIT License. &copy; 2012 [Jon Thornton](http://www.jonthornton.com), contributions from [Anthony Fojas](https://github.com/fojas), [Vince Mi](https://github.com/vinc3m1), [Nikita Korotaev](https://github.com/websirnik), [Spoon88](https://github.com/Spoon88), [elarkin](https://github.com/elarkin), [lodewijk](https://github.com/lodewijk), [jayzawrotny](https://github.com/jayzawrotny), [David Mazza](https://github.com/dmzza), [Matt Jurik](https://github.com/exabytes18), [Phil Freo](https://github.com/philfreo), [orloffv](https://github.com/orloffv), [patdenice](https://github.com/patdenice), [Raymond Julin](https://github.com/nervetattoo)
