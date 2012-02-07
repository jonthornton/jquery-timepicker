$(function() {

	$('.datepair input.date').each(function(){
		var $this = $(this);
		var opts = { 'dateFormat': 'm/d/yy' };

		if ($this.hasClass('future')) {
			opts.minDate = new Date();
		}

		if ($this.hasClass('start') || $this.hasClass('end')) {
			opts.onSelect = doDatepair;
		}

		$this.datepicker(opts);
	});

	$('.datepair input.time').each(function() {
		var $this = $(this);
		var opts = { 'showDuration': true, 'timeFormat': 'g:ia', 'scrollDefaultNow': true };

		if ($this.hasClass('start') || $this.hasClass('end')) {
			opts.onSelect = doDatepair;

		}

		$this.timepicker(opts);
	});

	$('.datepair').each(initDatepair);

	function initDatepair()
	{
		var container = $(this);

		var startDateInput = container.find('input.start.date');
		var endDateInput = container.find('input.end.date');
		var dateDelta = 0;

		if (startDateInput.length && endDateInput.length) {
			var startDate = new Date(startDateInput.datepicker( "getDate" ));
			var endDate =  new Date(endDateInput.datepicker( "getDate" ));

			dateDelta = endDate.getTime() - startDate.getTime();

			container.data('dateDelta', dateDelta);
		}

		var startTimeInput = container.find('input.start.time');
		var endTimeInput = container.find('input.end.time');

		if (startTimeInput.length && endTimeInput.length) {
			var startInt = startTimeInput.timepicker('getSecondsFromMidnight');
			var endInt = endTimeInput.timepicker('getSecondsFromMidnight');

			container.data('timeDelta', endInt - startInt);

			if (dateDelta < 86400000) {
				endTimeInput.timepicker('option', 'minTime', startInt);
			}
		}
	}

	function doDatepair()
	{
		var target = $(this);
		var container = target.closest('.datepair');

		if (target.hasClass('date')) {
			updateDatePair(target, container);

		} else if (target.hasClass('time')) {
			updateTimePair(target, container);
		}
	}

	function updateDatePair(target, container)
	{
		var start = container.find('input.start.date');
		var end = container.find('input.end.date');

		if (!start.length || !end.length) {
			return;
		}

		var startDate = new Date(start.datepicker( "getDate" ));
		var endDate =  new Date(end.datepicker( "getDate" ));

		var oldDelta = container.data('dateDelta');

		if (oldDelta && target.hasClass('start')) {
			var newEnd = new Date(startDate.getTime()+oldDelta);
			end.datepicker('setDate', newEnd);
			return;

		} else {
			var newDelta = endDate.getTime() - startDate.getTime();

			if (newDelta < 0) {
				newDelta = 0;

				if (target.hasClass('start')) {
					end.datepicker('setDate', startDate);
				} else if (target.hasClass('end')) {
					start.datepicker('setDate', endDate);
				}
			}

			if (newDelta < 86400000) {
				var startTimeVal = container.find('input.start.time').val();

				if (startTimeVal) {
					container.find('input.end.time').timepicker('option', {'minTime': startTimeVal});
				}
			} else {
				container.find('input.end.time').timepicker('option', {'minTime': null});
			}

			container.data('dateDelta', newDelta);
		}
	}

	function updateTimePair(target, container)
	{
		var start = container.find('input.start.time');
		var end = container.find('input.end.time');

		if (!start.length || !end.length) {
			return;
		}

		var startInt = start.timepicker('getSecondsFromMidnight');
		var endInt = end.timepicker('getSecondsFromMidnight');

		var oldDelta = container.data('timeDelta');
		var dateDelta = container.data('dateDelta');

		if (target.hasClass('start') && (!dateDelta || dateDelta < 86400000)) {
			end.timepicker('option', 'minTime', startInt);
		}

		var endDateAdvance = 0;
		var newDelta;

		if (oldDelta && target.hasClass('start')) {
			// lock the duration and advance the end time

			var newEnd = (startInt+oldDelta)%86400;

			if (newEnd < 0) {
				newEnd += 86400;
			}

			end.timepicker('setTime', newEnd);
			newDelta = newEnd - startInt;
		} else if (startInt !== null && endInt !== null) {
			newDelta = endInt - startInt;
		} else {
			return;
		}

		container.data('timeDelta', newDelta);

		if (newDelta < 0 && (!oldDelta || oldDelta > 0)) {
			// overnight time span. advance the end date 1 day
			var endDateAdvance = 86400000;

		} else if (newDelta > 0 && oldDelta < 0) {
			// switching from overnight to same-day time span. decrease the end date 1 day
			var endDateAdvance = -86400000;
		}

		var startInput = container.find('.start.date');
		var endInput = container.find('.end.date');

		if (startInput.val() && !endInput.val()) {
			endInput.datepicker('setDate', startInput.val());
			dateDelta = 0;
			container.data('dateDelta', 0);
		}

		if (endDateAdvance != 0) {
			if (dateDelta || dateDelta === 0) {
				var endDate =  new Date(endInput.datepicker( "getDate" ));
				var newEnd = new Date(endDate.getTime() + endDateAdvance);

				endInput.datepicker('setDate', newEnd);
				container.data('dateDelta', dateDelta + endDateAdvance);
			}
		}
	}
});
