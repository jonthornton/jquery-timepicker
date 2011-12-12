(function($)
{
	var _tzOffset = new Date().getTimezoneOffset();
	var _defaults =	{
		className: null,
		minTime: null,
		step: 30,
		showDuration: false,
		timeFormat: 'g:ia',
		onSelect: function() { }
	};

	var methods =
	{
		init: function(options)
		{
			return this.each(function()
			{
				var self = $(this);

				// convert dropdowns to text input
				if (self[0].tagName == 'SELECT') {
					var input = $('<input />');
					var attrs = { 'type': 'text', 'value': self.val() };
					var raw_attrs = self[0].attributes;

					for (var i=0; i < raw_attrs.length; i++) {
						attrs[raw_attrs[i].nodeName] = raw_attrs[i].nodeValue;
					}

					input.attr(attrs);
					self.replaceWith(input);
					self = input;
				}

				var settings = $.extend({}, _defaults);

				if (options) {
					settings = $.extend(settings, options);
				}

				if (settings.minTime) {
					settings.minTime = _time2int(settings.minTime);
				}

				self.data("settings", settings);
				self.attr('autocomplete', 'off');
				self.click(methods.show).focus(methods.show).keydown(_keyhandler);
				self.addClass('ui-timepicker-input');

				if (self.val()) {
					var prettyTime = _int2time(_time2int(self.val()), settings.timeFormat);
					self.val(prettyTime);
				}

				var container = $('<span class="ui-timepicker-container" />');
				self.wrap(container);

				// close the dropdown when container loses focus
				$("body").attr("tabindex", -1).focusin(function(e) {
					if ($(e.target).closest('.ui-timepicker-container').length == 0) {
						methods.hide();
						e.stopPropagation();
					}
				});

			});
		},

		show: function(e)
		{
			if (e) {
				e.stopPropagation();
			}

			var self = $(this);
			var list = self.siblings('.ui-timepicker-list');

			// check if a flag was set to close this picker
			if (self.hasClass('ui-timepicker-hideme')) {
				self.removeClass('ui-timepicker-hideme');
				list.hide();
				return;
			}

			if (list.is(':visible')) {
				return;
			}

			// make sure other pickers are hidden
			methods.hide();

			// check if list needs to be rendered
			if (list.length == 0) {
				_render(self);
				list = self.siblings('.ui-timepicker-list');
			}

			if ((self.offset().top + self.outerHeight(true) + list.outerHeight()) > $(window).height() + $(window).scrollTop()) {
				// position the dropdown on top
				list.css({"top":self.position().top - list.outerHeight()});
			} else {
				// put it under the input
				list.css({"top":self.position().top+self.outerHeight(true)});
			}

			list.show();

			// position scrolling
			var selected = list.find('.ui-timepicker-selected');
			if (selected.length) {
				var topOffset = list.scrollTop() + selected.position().top - selected.outerHeight();
				list.scrollTop(topOffset);
			}
		},

		hide: function(e)
		{
			$('.ui-timepicker-list:visible').each(function() {
				var list = $(this);
				var self = list.siblings('.ui-timepicker-input');
				_selectValue(self);

				list.hide();
			});
		},

		option: function(key, value)
		{
			var self = $(this);
			var settings = self.data("settings");
			var list = self.siblings('.ui-timepicker-list');

			if (typeof key == 'object') {
				settings = $.extend(settings, key);

			} else if (typeof key == 'string' && value) {
				settings[key] = value;

			} else if (typeof key == 'string') {
				return settings[key];
			}

			if (settings.minTime) {
				settings.minTime = _time2int(settings.minTime);
			}

			self.data("settings", settings);
			list.remove();
		},

		getSecondsFromMidnight: function()
		{
			return _time2int($(this).val());
		},

		setTime: function(value)
		{
			var self = $(this);
			var prettyTime = _int2time(_time2int(value), self.data('settings').timeFormat);
			self.val(prettyTime);
		}

	};

	// private methods

	function _render(self)
	{
		var settings = self.data("settings");
		var list = self.siblings('.ui-timepicker-list');

		if (list && list.length) {
			list.remove();
		}

		list = $('<ul />');
		list.attr('tabindex', -1);
		list.addClass('ui-timepicker-list');
		if (settings.className) {
			list.addClass(settings.className);
		}

		var zIndex = self.css('zIndex');
		zIndex = (zIndex+0 == zIndex) ? zIndex+1 : 2;
		list.css({'display':'none', 'position': 'absolute', "left":(self.position().left), 'zIndex': zIndex });

		if (settings.minTime !== null && settings.showDuration) {
			list.addClass('ui-timepicker-with-duration');
		}

		var start = (settings.minTime !== null) ? settings.minTime : 0;

		for (var i=start; i < start+86400; i += settings.step*60) {
			var timeInt = i%86400;
			var row = $('<li />');
			row.data('time', timeInt)
			row.text(_int2time(timeInt, settings.timeFormat));

			if (settings.minTime !== null && settings.showDuration) {
				var duration = $('<span />');
				duration.addClass('ui-timepicker-duration');
				duration.text(' ('+_int2duration(i - settings.minTime)+')');
				row.append(duration)
			}

			list.append(row);
		}

		self.after(list);
		_setSelected(self, list);

		list.delegate('li', 'click', { 'timepicker': self }, function(e) {
			self.addClass('ui-timepicker-hideme');
			self[0].focus();

			// make sure only the clicked row is selected
			list.find('li').removeClass('ui-timepicker-selected');
			$(this).addClass('ui-timepicker-selected');

			_selectValue(self);
		});
	};

	function _setSelected(self, list)
	{
		var timeValue = _time2int(self.val());

		// loop through the menu items and apply selected class if we find a match
		list.find('li').each(function(i, obj) {
			var jObj = $(obj);

			if (jObj.data('time') === timeValue) {
				jObj.addClass('ui-timepicker-selected');
				return false;
			}
		});
	}

	function _keyhandler(e)
	{
		var self = $(this);
		var list = self.siblings('.ui-timepicker-list');

		switch (e.keyCode) {

			case 13: // return
				_selectValue(self);
				methods.hide.apply(this);
				e.preventDefault();
				return false;
				break;

			case 38: // up
				var selected = list.find('.ui-timepicker-selected');

				if (selected.length && !selected.is(':first-child')) {
					selected.removeClass('ui-timepicker-selected');
					selected.prev().addClass('ui-timepicker-selected');

					if (selected.prev().position().top < selected.outerHeight()) {
						list.scrollTop(list.scrollTop() - selected.outerHeight());
					}
				}

				break;

			case 40: // down

				if (!list.is(':visible')) {
					self.focus();
				}

				var selected = list.find('.ui-timepicker-selected');

				if (selected.length == 0) {
					list.children().first().addClass('ui-timepicker-selected');
				} else if (!selected.is(':last-child')) {
					selected.removeClass('ui-timepicker-selected');
					selected.next().addClass('ui-timepicker-selected');

					if (selected.next().position().top + 2*selected.outerHeight() > list.outerHeight()) {
						list.scrollTop(list.scrollTop() + selected.outerHeight());
					} else {
					}
				}

				break;

			case 27:
				list.find('li').removeClass('ui-timepicker-selected');
				list.hide();
				break;

			case 9:
			case 16:
			case 17:
			case 18:
			case 19:
			case 20:
			case 33:
			case 34:
			case 35:
			case 36:
			case 37:
			case 39:
			case 45:
				return;

			default:
				list.find('li').removeClass('ui-timepicker-selected');
				return;
		}
	};

	function _selectValue(self)
	{
		var settings = self.data('settings')
		var list = self.siblings('.ui-timepicker-list');
		var timeValue = null;

		var cursor = list.find('.ui-timepicker-selected');

		if (cursor.length) {
			// selected value found
			var timeValue = cursor.data('time');

		} else if (self.val()) {

			// no selected value; fall back on input value
			var timeValue = _time2int(self.val());

			_setSelected(self, list);
		}

		if (timeValue !== null) {
			var timeString = _int2time(timeValue, settings.timeFormat);
			self.attr('value', timeString);
		}

		settings.onSelect.call(self);
	};

	function _int2duration(seconds)
	{
		var minutes = Math.round(seconds/60);

		if (minutes < 60) {
			return minutes+' mins'
		} else if (minutes == 60) {
			return '1 hr';
		} else {
			var hours = minutes/60
			return hours.toFixed(1)+' hrs';
		}
	};

	function _int2time(seconds, format)
	{
		var time = new Date((seconds + _tzOffset*60)*1000);
		var output = '';

		for (var i=0; i<format.length; i++) {

			var code = format.charAt(i);
			switch (code) {

				case 'a':
					output += (time.getHours() > 11) ? 'pm' : 'am';
					break;

				case 'A':
					output += (time.getHours() > 11) ? 'PM' : 'AM';
					break;

				case 'g':
					var hour = time.getHours() % 12;
					output += (hour == 0) ? '12' : hour;
					break;

				case 'G':
					output += time.getHours();
					break;

				case 'h':
					var hour = time.getHours() % 12;

					if (hour != 0 && hour < 10) {
						hour = '0'+hour;
					}

					output += (hour == 0) ? '12' : hour;
					break;

				case 'H':
					var hour = time.getHours();
					output += (hour > 9) ? hour : '0'+hour;
					break;

				case 'i':
					var minutes = time.getMinutes();
					output += (minutes > 9) ? minutes : '0'+minutes;
					break;

				case 's':
					var seconds = time.getSeconds();
					output += (seconds > 9) ? seconds : '0'+seconds;
					break;

				default:
					output += code;
			}
		}

		return output;
	};

	function _time2int(timeString)
	{
		if (timeString == '') return null;
		if (timeString+0 == timeString) return timeString;

		var d = new Date(0);
		var time = timeString.toLowerCase().match(/(\d+)(?::(\d\d))?\s*([pa]?)/);

		if (!time) {
			return null;
		}

		var hour = parseInt(time[1]*1);

		if (time[3]) {
			if (hour == 12) {
				var hours = (time[3] == 'p') ? 12 : 0;
			} else {
				var hours = (hour + (time[3] == 'p' ? 12 : 0));
			}

		} else {
			var hours = hour;
		}

		var minutes = ( time[2]*1 || 0 );
		return hours*3600 + minutes*60;
	};

	// Plugin entry
	$.fn.timepicker = function(method)
	{
		if(methods[method]) { return methods[method].apply(this, Array.prototype.slice.call(arguments, 1)); }
		else if(typeof method === "object" || !method) { return methods.init.apply(this, arguments); }
		else { $.error("Method "+ method + " does not exist on jQuery.timepicker"); }
	};
})(jQuery);
