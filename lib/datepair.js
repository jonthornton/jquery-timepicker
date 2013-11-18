/*
 * 'Highly configurable' mutable plugin boilerplate
 * Author: @markdalgleish
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */


// Note that with this pattern, as per Alex Sexton's, the plugin logic
// hasn't been nested in a jQuery plugin. Instead, we just use
// jQuery for its instantiation.

;(function( $, window, document, undefined ){

  // our plugin constructor
  var DatepairPlugin = function( elem, options ){
      this.elem = elem;
      this.$elem = $(elem);
      this.$elem.addClass('datepair')

      this.dateInputs = this.$elem.find('input.date, input[type="date"]')
      this.dateInputs.addClass('date')
      this.timeInputs = this.$elem.find('input.time, input[type="time"]')
      this.timeInputs.addClass('time')

      this.options = options;
      // This next line takes advantage of HTML5 data attributes
      // to support customization of the plugin on a per-element
      // basis. For example,
      // <div class=item' data-datepair-options='{"message":"Goodbye World!"}'></div>
      this.metadata = this.$elem.data( 'datepair-options' );
    };

  // the plugin prototype
  DatepairPlugin.prototype = {
    defaults: {
      DATE_FORMAT: 'Y-n-j', // for this format see http://php.net/manual/function.date.php
      datepickerOpts: {
        'format': 'yyyy-m-d',
        'autoclose': true
      },
      timepickerOpts: {
        'showDuration': true,
        'timeFormat': 'g:ia',
        'scrollDefaultNow': true
      }
    },

    init: function() {
      // Introduce defaults that can be extended either 
      // globally or using an object literal. 
      this.config = $.extend({}, this.defaults, this.options, 
      this.metadata);

      // Sample usage:
      // Set the message per instance:
      // $('#elem').datepair({ message: 'Goodbye World!'});
      // or
      // var p = new DatepairPlugin(document.getElementById('elem'), 
      // { message: 'Goodbye World!'}).init()
      // or, set the global default message:
      // DatepairPlugin.defaults.message = 'Goodbye World!'

      var pluginInstance = this;
      this.dateInputs.each(function(){
        var $this = $(this);

        $this.datepicker(pluginInstance.config.datepickerOpts);

        if ($this.hasClass('start') || $this.hasClass('end')) {
          $this.on('changeDate change', pluginInstance.doDatepair);
        }

      });

      this.timeInputs.each(function() {
        var $this = $(this);
        
        $this.timepicker(pluginInstance.config.timepickerOpts);

        if ($this.hasClass('start') || $this.hasClass('end')) {
          $this.on('changeTime change', pluginInstance.doDatepair);
        }
        
        if ($this.hasClass('end')) {
          $this.on('focus', function(){$('.ui-timepicker-with-duration').scrollTop(0);});
        }		

      });

      var startDateInput = this.dateInputs.filter('.start');
      var endDateInput = this.dateInputs.filter('.end');
      var dateDelta = 0;

      if (startDateInput.length && endDateInput.length) {
        var startDate = parseDate(startDateInput.val(), this.config.datepickerOpts['format']);
        var endDate =  parseDate(endDateInput.val(), this.config.datepickerOpts['format']);

        dateDelta = endDate.getTime() - startDate.getTime();
        container.data('dateDelta', dateDelta);
      }

      var startTimeInput = this.timeInputs.filter('.start');
      var endTimeInput = this.timeInputs.filter('.end');

      if (startTimeInput.length && endTimeInput.length) {
        var startInt = startTimeInput.timepicker('getSecondsFromMidnight');
        var endInt = endTimeInput.timepicker('getSecondsFromMidnight');

        container.data('timeDelta', endInt - startInt);

        if (dateDelta < 86400000) {
          endTimeInput.timepicker('option', 'minTime', startInt);
        }
      }

      return this;
    },

    doDatepair: function() {
      var target = $(this);
      if (target.val() == '') {
        return;
      }

      var container = target.closest('.datepair');

      if (target.hasClass('date') || target.attr('type') == 'date') {
        $.fn.datepair.updateDatePair(target, container);

      } else if (target.hasClass('time') || target.attr('type') == 'time') {
        $.fn.datepair.updateTimePair(target, container);
      }
    },

    updateDatePair: function(target, container) {
      var start = container.find('input.start.date');
      var end = container.find('input.end.date');
      if (!start.length || !end.length) {
        return;
      }

      var startDate = $.fn.datepair.parseDate(start.val(), this.config.datepickerOpts['format']);
      var endDate =  $.fn.datepair.parseDate(end.val(), this.config.datepickerOpts['format']);

      var oldDelta = container.data('dateDelta');

      if (!isNaN(oldDelta) && oldDelta !== null && target.hasClass('start')) {
        var newEnd = new Date(startDate.getTime()+oldDelta);
        end.val(newEnd.format(this.config.DATE_FORMAT));
        end.datepicker('update');
        return;

      } else {
        var newDelta = endDate.getTime() - startDate.getTime();

        if (newDelta < 0) {
          newDelta = 0;

          if (target.hasClass('start')) {
            end.val(start.val());
            end.datepicker('update');
          } else if (target.hasClass('end')) {
            start.val(end.val());
            start.datepicker('update');
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
    },

    updateTimePair: function(target, container) {
      var start = container.find('input.start.time');
      var end = container.find('input.end.time');

      if (!start.length) {
        return;
      }

      var startInt = start.timepicker('getSecondsFromMidnight');
      var dateDelta = container.data('dateDelta');

      if (target.hasClass('start') && (!dateDelta || dateDelta < 86400000)) {
        end.timepicker('option', 'minTime', startInt);
      }

      if (!end.length) {
        return;
      }

      var endInt = end.timepicker('getSecondsFromMidnight');
      var oldDelta = container.data('timeDelta');

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
        endDateAdvance = 86400000;

      } else if (newDelta > 0 && oldDelta < 0) {
        // switching from overnight to same-day time span. decrease the end date 1 day
        endDateAdvance = -86400000;
      }

      var startInput = container.find('.start.date');
      var endInput = container.find('.end.date');

      if (startInput.val() && !endInput.val()) {
        endInput.val(startInput.val());
        endInput.datepicker('update');
        dateDelta = 0;
        container.data('dateDelta', 0);
      }

      if (endDateAdvance != 0) {
        if (dateDelta || dateDelta === 0) {
          var endDate =  parseDate(endInput.val(), this.config.datepickerOpts['format']);
          var newEnd = new Date(endDate.getTime() + endDateAdvance);
          endInput.val(newEnd.format(this.config.DATE_FORMAT));
          endInput.datepicker('update');
          container.data('dateDelta', dateDelta + endDateAdvance);
        }
      }
    },


    parseDate: function(input, format) {
      if (input == '')
        return new Date('');

      format = format || 'yyyy-mm-dd'; // default format
      var parts = input.match(/(\d+)/g), i = 0, fmt = {};
      // extract date-part indexes from the format
      format.replace(/(yyyy|dd?|mm?)/g, function(part) { fmt[part] = i++; });

      return new Date(parts[fmt['yyyy']], parts[fmt['mm'] == undefined ? fmt['m'] : fmt['mm']]-1, parts[fmt['dd'] == undefined ? fmt['d'] : fmt['dd']]);
    }
  }

  DatepairPlugin.defaults = DatepairPlugin.prototype.defaults;

  $.fn.datepair = function(options) {
    return this.each(function() {
      new DatepairPlugin(this, options).init();
    });
  };

  //optional: window.DatepairPlugin = DatepairPlugin;

})( jQuery, window , document );

// Simulates PHP's date function
Date.prototype.format=function(format){var returnStr='';var replace=Date.replaceChars;for(var i=0;i<format.length;i++){var curChar=format.charAt(i);if(replace[curChar]){returnStr+=replace[curChar].call(this);}else{returnStr+=curChar;}}return returnStr;};Date.replaceChars={shortMonths:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],longMonths:['January','February','March','April','May','June','July','August','September','October','November','December'],shortDays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],longDays:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],d:function(){return(this.getDate()<10?'0':'')+this.getDate();},D:function(){return Date.replaceChars.shortDays[this.getDay()];},j:function(){return this.getDate();},l:function(){return Date.replaceChars.longDays[this.getDay()];},N:function(){return this.getDay()+1;},S:function(){return(this.getDate()%10==1&&this.getDate()!=11?'st':(this.getDate()%10==2&&this.getDate()!=12?'nd':(this.getDate()%10==3&&this.getDate()!=13?'rd':'th')));},w:function(){return this.getDay();},z:function(){return"Not Yet Supported";},W:function(){return"Not Yet Supported";},F:function(){return Date.replaceChars.longMonths[this.getMonth()];},m:function(){return(this.getMonth()<9?'0':'')+(this.getMonth()+1);},M:function(){return Date.replaceChars.shortMonths[this.getMonth()];},n:function(){return this.getMonth()+1;},t:function(){return"Not Yet Supported";},L:function(){return(((this.getFullYear()%4==0)&&(this.getFullYear()%100!=0))||(this.getFullYear()%400==0))?'1':'0';},o:function(){return"Not Supported";},Y:function(){return this.getFullYear();},y:function(){return(''+this.getFullYear()).substr(2);},a:function(){return this.getHours()<12?'am':'pm';},A:function(){return this.getHours()<12?'AM':'PM';},B:function(){return"Not Yet Supported";},g:function(){return this.getHours()%12||12;},G:function(){return this.getHours();},h:function(){return((this.getHours()%12||12)<10?'0':'')+(this.getHours()%12||12);},H:function(){return(this.getHours()<10?'0':'')+this.getHours();},i:function(){return(this.getMinutes()<10?'0':'')+this.getMinutes();},s:function(){return(this.getSeconds()<10?'0':'')+this.getSeconds();},e:function(){return"Not Yet Supported";},I:function(){return"Not Supported";},O:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+'00';},P:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+':'+(Math.abs(this.getTimezoneOffset()%60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()%60));},T:function(){var m=this.getMonth();this.setMonth(0);var result=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,'$1');this.setMonth(m);return result;},Z:function(){return-this.getTimezoneOffset()*60;},c:function(){return this.format("Y-m-d")+"T"+this.format("H:i:sP");},r:function(){return this.toString();},U:function(){return this.getTime()/1000;}};
