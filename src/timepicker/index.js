import { DEFAULT_SETTINGS, DEFAULT_LANG } from "./defaults";
import { ONE_DAY } from "./constants";

const EVENT_DEFAULTS = {
  bubbles: true,
  cancelable: false,
  detail: null
};

class Timepicker {
  constructor(targetEl, options = {}) {
    this._handleFormatValue = this._handleFormatValue.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);

    this.targetEl = targetEl;

    const attrOptions = Timepicker.extractAttrOptions(
      targetEl,
      Object.keys(DEFAULT_SETTINGS)
    );

    this.settings = this.parseSettings({
      ...DEFAULT_SETTINGS,
      ...options,
      ...attrOptions
    });
  }

  static extractAttrOptions(element, keys) {
    const output = {};
    for (const key of keys) {
      if (key in element.dataset) {
        output[key] = element.dataset[key];
      }
    }
    return output;
  }

  static isVisible(elem) {
    var el = elem[0];
    return el.offsetWidth > 0 && el.offsetHeight > 0;
  }

  static hideAll() {
    for (const el of document.getElementsByClassName('ui-timepicker-input')) {
      const tp = el.timepickerObj;
      if (tp) {
        tp.hideMe();
      }
    }
  }

  hideMe() {
    if (this.settings.useSelect) {
      this.targetEl.blur();
      return;
    } 

    if (!this.list || !Timepicker.isVisible(this.list)) {
      return;
    }

    if (this.settings.selectOnBlur) {
      this._selectValue();
    }

    this.list.hide();

    const hideTimepickerEvent = new CustomEvent('hideTimepicker', EVENT_DEFAULTS);
    this.targetEl.dispatchEvent(hideTimepickerEvent);
  }

  _findRow(value) {
    if (!value && value !== 0) {
      return false;
    }

    var out = false;
    var value = this.settings.roundingFunction(value, this.settings);
    if (!this.list) {
      return false;
    }

    this.list.find("li").each(function(i, obj) {
      const parsed = parseInt(obj.dataset.time);

      if (isNaN(parsed)) {
        return;
      }

      if (parsed == value) {
        out = obj;
        return false;
      }
    });

    return out;
  }

  _hideKeyboard() {
    return (
      (window.navigator.msMaxTouchPoints || "ontouchstart" in document) &&
      this.settings.disableTouchKeyboard
    );
  }

  _setTimeValue(value, source) {
    if (this.targetEl.nodeName === "INPUT") {
      if (value !== null || this.targetEl.value != "") {
        this.targetEl.value = value;
      }

      var tp = this;
      var settings = tp.settings;

      if (settings.useSelect && source != "select" && tp.list) {
        tp.list.val(tp._roundAndFormatTime(tp.anytime2int(value)));
      }
    }

    const selectTimeEvent = new CustomEvent('selectTime', EVENT_DEFAULTS);

    if (this.selectedValue != value) {
      this.selectedValue = value;

      const changeTimeEvent = new CustomEvent('changeTime', EVENT_DEFAULTS);
      const changeEvent = new CustomEvent('change', 
                                Object.assign(EVENT_DEFAULTS, { detail: 'timepicker'}));

      if (source == "select") {
        this.targetEl.dispatchEvent(selectTimeEvent);
        this.targetEl.dispatchEvent(changeTimeEvent);
        this.targetEl.dispatchEvent(changeEvent);

      } else if (["error", "initial"].indexOf(source) == -1) {
        this.targetEl.dispatchEvent(changeTimeEvent);
      }

      return true;
    } else {
      if (["error", "initial"].indexOf(source) == -1) {
        this.targetEl.dispatchEvent(selectTimeEvent);
      }
      return false;
    }
  }

  _getTimeValue() {
    if (this.targetEl.nodeName === "INPUT") {
      return this.targetEl.value;
    } else {
      // use the element's data attributes to store values
      return this.selectedValue;
    }
  }

  _selectValue() {
    var tp = this;
    var settings = tp.settings;
    var list = tp.list;

    var cursor = list.find(".ui-timepicker-selected");

    if (cursor.hasClass("ui-timepicker-disabled")) {
      return false;
    }

    if (!cursor.length) {
      return true;
    }
      
    var timeValue = cursor.get(0).dataset.time;

    // selected value found
    if (timeValue) {
      const parsedTimeValue = parseInt(timeValue);
      if (!isNaN(parsedTimeValue)) {
        timeValue = parsedTimeValue;
      }

    }
    
    if (timeValue !== null) {
      if (typeof timeValue != "string") {
        timeValue = tp._int2time(timeValue);
      }

      tp._setTimeValue(timeValue, "select");
    }

    return true;
  }

  anytime2int(input) {
    if (typeof input === 'number') {
      return input;
    } else if (typeof input === 'string') {
      return this.time2int(input);
    } else if (typeof input === 'object' && input instanceof Date) {
      return (
        input.getHours() * 3600 +
        input.getMinutes() * 60 +
        input.getSeconds()
      );
    } else if (typeof input == 'function') {
      return input();
    } else {
      return null;
    }
  }

  time2int(timeString) {
    if (timeString === "" || timeString === null || timeString === undefined) {
      return null;
    }

    if (timeString === 'now') {
      return this.anytime2int(new Date());
    }

    if (typeof timeString != "string") {
      return timeString;
    }

    timeString = timeString.toLowerCase().replace(/[\s\.]/g, "");

    // if the last character is an "a" or "p", add the "m"
    if (timeString.slice(-1) == "a" || timeString.slice(-1) == "p") {
      timeString += "m";
    }

    let pattern = /^(([^0-9]*))?([0-9]?[0-9])(([0-5][0-9]))?(([0-5][0-9]))?(([^0-9]*))$/;

    const hasDelimetersMatch = timeString.match(/\W/);
    if (hasDelimetersMatch) {
      pattern = /^(([^0-9]*))?([0-9]?[0-9])(\W+([0-5][0-9]?))?(\W+([0-5][0-9]))?(([^0-9]*))$/;
    }

    var time = timeString.match(pattern);

    if (!time) {
      return null;
    }

    var hour = parseInt(time[3] * 1, 10);
    var ampm = time[2] || time[9];
    var minutes = this.parseMinuteString(time[5]);
    var seconds = time[7] * 1 || 0;

    if (!ampm && time[3].length == 2 && time[3][0] == "0") {
      // preceding '0' implies AM
      ampm = "am";
    }

    if (hour > 24 && !minutes) {
      // if someone types in something like "83", turn it into "8h 30m"
      hour = time[3][0] * 1;
      minutes = this.parseMinuteString(time[3][1]);
    }

    var hours = hour;

    if (hour <= 12 && ampm) {
      ampm = ampm.trim();
      var isPm = ampm == this.settings.lang.pm || ampm == this.settings.lang.PM;

      if (hour == 12) {
        hours = isPm ? 12 : 0;
      } else {
        hours = hour + (isPm ? 12 : 0);
      }
    } else {
      var t = hour * 3600 + minutes * 60 + seconds;
      if (t >= ONE_DAY + (this.settings.show2400 ? 1 : 0)) {
        if (this.settings.wrapHours === false) {
          return null;
        }

        hours = hour % 24;
      }
    }

    var timeInt = hours * 3600 + minutes * 60 + seconds;

    // if no am/pm provided, intelligently guess based on the scrollDefault
    if (
      hour < 12 &&
      !ampm &&
      this.settings._twelveHourTime &&
      this.settings.scrollDefault()
    ) {
      var delta = timeInt - this.settings.scrollDefault();
      if (delta < 0 && delta >= ONE_DAY / -2) {
        timeInt = (timeInt + ONE_DAY / 2) % ONE_DAY;
      }
    }

    return timeInt;
  }

  parseMinuteString(minutesString) {
    if (!minutesString) {
      minutesString = 0;
    }

    let multiplier = 1;

    if (minutesString.length == 1) {
      multiplier = 10;
    }

    return parseInt(minutesString) * multiplier || 0;
  }

  intStringDateOrFunc2func(input) {
    if (input === null || input === undefined) {
      return () => null;
    } else if (typeof input === 'function') {
      return () => this.anytime2int(input());
    } else {
      return () => this.anytime2int(input);
    }
  }

  parseSettings(settings) {
    settings.lang = { ...DEFAULT_LANG, ...settings.lang };

    // lang is used by other functions the rest of this depends on
    // todo: unwind circular dependency on lang
    this.settings = settings;

    if (settings.listWidth) {
      settings.listWidth = this.anytime2int(settings.listWidth);
    }

    settings.minTime = this.intStringDateOrFunc2func(settings.minTime);
    settings.maxTime = this.intStringDateOrFunc2func(settings.maxTime);
    settings.durationTime = this.intStringDateOrFunc2func(settings.durationTime);

    if (settings.scrollDefault) {
      settings.scrollDefault = this.intStringDateOrFunc2func(settings.scrollDefault);
    } else {
      settings.scrollDefault = settings.minTime;
    }
    
    if (
      typeof settings.timeFormat === "string" &&
      settings.timeFormat.match(/[gh]/)
    ) {
      settings._twelveHourTime = true;
    }

    if (typeof settings.step != 'function') {
      const curryStep = settings.step;
      settings.step = function() {
        return curryStep;
      };
    }

    settings.disableTimeRanges = this._parseDisableTimeRanges(settings.disableTimeRanges);

    if (settings.closeOnWindowScroll && !settings.closeOnScroll) {
      settings.closeOnScroll = settings.closeOnWindowScroll;
    }

    if (settings.closeOnScroll === true) {
      settings.closeOnScroll = window.document;
    }

    return settings;
  }

  _parseDisableTimeRanges(disableTimeRanges) {
    if (!disableTimeRanges || disableTimeRanges.length == 0) {
      return [];
    }

    // convert string times to integers
    for (var i in disableTimeRanges) {
      disableTimeRanges[i] = [
        this.anytime2int(disableTimeRanges[i][0]),
        this.anytime2int(disableTimeRanges[i][1])
      ];
    }

    // sort by starting time
    disableTimeRanges = disableTimeRanges.sort((a, b) => a[0] - b[0]);

    // merge any overlapping ranges
    for (var i = disableTimeRanges.length - 1; i > 0; i--) {
      if (
        disableTimeRanges[i][0] <=
        disableTimeRanges[i - 1][1]
      ) {
        disableTimeRanges[i - 1] = [
          Math.min(
            disableTimeRanges[i][0],
            disableTimeRanges[i - 1][0]
          ),
          Math.max(
            disableTimeRanges[i][1],
            disableTimeRanges[i - 1][1]
          )
        ];
        disableTimeRanges.splice(i, 1);
      }
    }

    return disableTimeRanges;
  }

  /*
   *  Filter freeform input
   */
  _disableTextInputHandler(e) {
    switch (e.keyCode) {
      case 13: // return
      case 9: //tab
        return;

      default:
        e.preventDefault();
    }
  }

  _int2duration(seconds, step) {
    seconds = Math.abs(seconds);
    var minutes = Math.round(seconds / 60),
      duration = [],
      hours,
      mins;

    if (minutes < 60) {
      // Only show (x mins) under 1 hour
      duration = [minutes, this.settings.lang.mins];
    } else {
      hours = Math.floor(minutes / 60);
      mins = minutes % 60;

      // Show decimal notation (eg: 1.5 hrs) for 30 minute steps
      if (step == 30 && mins == 30) {
        hours += this.settings.lang.decimal + 5;
      }

      duration.push(hours);
      duration.push(
        hours == 1 ? this.settings.lang.hr : this.settings.lang.hrs
      );

      // Show remainder minutes notation (eg: 1 hr 15 mins) for non-30 minute steps
      // and only if there are remainder minutes to show
      if (step != 30 && mins) {
        duration.push(mins);
        duration.push(this.settings.lang.mins);
      }
    }

    return duration.join(" ");
  }

  _roundAndFormatTime(seconds) {
    // console.log('_roundAndFormatTime')
    seconds = this.settings.roundingFunction(seconds, this.settings);
    if (seconds !== null) {
      return this._int2time(seconds);
    }
  }

  _int2time(timeInt) {
    if (typeof timeInt != "number") {
      return null;
    }

    var seconds = parseInt(timeInt % 60),
      minutes = parseInt((timeInt / 60) % 60),
      hours = parseInt((timeInt / (60 * 60)) % 24);

    var time = new Date(1970, 0, 2, hours, minutes, seconds, 0);

    if (isNaN(time.getTime())) {
      return null;
    }

    if (typeof this.settings.timeFormat === "function") {
      return this.settings.timeFormat(time);
    }

    var output = "";
    var hour, code;
    for (var i = 0; i < this.settings.timeFormat.length; i++) {
      code = this.settings.timeFormat.charAt(i);
      switch (code) {
        case "a":
          output +=
            time.getHours() > 11
              ? this.settings.lang.pm
              : this.settings.lang.am;
          break;

        case "A":
          output +=
            time.getHours() > 11
              ? this.settings.lang.PM
              : this.settings.lang.AM;
          break;

        case "g":
          hour = time.getHours() % 12;
          output += hour === 0 ? "12" : hour;
          break;

        case "G":
          hour = time.getHours();
          if (timeInt === ONE_DAY) hour = this.settings.show2400 ? 24 : 0;
          output += hour;
          break;

        case "h":
          hour = time.getHours() % 12;

          if (hour !== 0 && hour < 10) {
            hour = "0" + hour;
          }

          output += hour === 0 ? "12" : hour;
          break;

        case "H":
          hour = time.getHours();
          if (timeInt === ONE_DAY) hour = this.settings.show2400 ? 24 : 0;
          output += hour > 9 ? hour : "0" + hour;
          break;

        case "i":
          var minutes = time.getMinutes();
          output += minutes > 9 ? minutes : "0" + minutes;
          break;

        case "s":
          seconds = time.getSeconds();
          output += seconds > 9 ? seconds : "0" + seconds;
          break;

        case "\\":
          // escape character; add the next character and skip ahead
          i++;
          output += this.settings.timeFormat.charAt(i);
          break;

        default:
          output += code;
      }
    }

    return output;
  }

  _setSelected() {
    const list = this.list;

    list.find("li").removeClass("ui-timepicker-selected");

    const timeValue = this.anytime2int(this._getTimeValue());
  
    if (timeValue === null) {
      return;
    }

    const selected = this._findRow(timeValue);
    if (selected) {

      const selectedRect = selected.getBoundingClientRect();
      const listRect = list.get(0).getBoundingClientRect();
      const topDelta = selectedRect.top - listRect.top;

      if (topDelta + selectedRect.height > listRect.height || topDelta < 0) {
        const newScroll = list.scrollTop() 
                          + (selectedRect.top - listRect.top) 
                          - selectedRect.height;

        list.scrollTop(newScroll);
      }
      
      const parsed = parseInt(selected.dataset.time);

      if (this.settings.forceRoundTime || parsed === timeValue) {
        selected.classList.add('ui-timepicker-selected');
      }
    }
  }

  _isFocused(el) {
    return (el === document.activeElement);
  }

  _handleFormatValue(e) {
    if (e && e.detail == "timepicker") {
      return;
    }

    this._formatValue(e);
  }

  _formatValue(e, origin) {
    if (this.targetEl.value === "") {
      this._setTimeValue(null, origin);
      return;
    }

    // IE fires change event before blur
    if (this._isFocused(this.targetEl) && (!e || e.type != "change")) {
      return;
    }

    var settings = this.settings;
    var seconds = this.anytime2int(this.targetEl.value);

    if (seconds === null) {
      const timeFormatErrorEvent = new CustomEvent('timeFormatError', EVENT_DEFAULTS);
      this.targetEl.dispatchEvent(timeFormatErrorEvent);
      return;
    }

    var rangeError = false;
    // check that the time in within bounds
    if (
      settings.minTime !== null &&
      settings.maxTime !== null &&
      (seconds < settings.minTime() || seconds > settings.maxTime())
    ) {
      rangeError = true;
    }

    // check that time isn't within disabled time ranges
    for (const range of settings.disableTimeRanges) {
      if (seconds >= range[0] && seconds < range[1]) {
        rangeError = true;
        break;
      }
    }

    if (settings.forceRoundTime) {
      var roundSeconds = settings.roundingFunction(seconds, settings);
      if (roundSeconds != seconds) {
        seconds = roundSeconds;
        origin = null;
      }
    }

    var prettyTime = this._int2time(seconds);

    if (rangeError) {
      this._setTimeValue(prettyTime);
      const timeRangeErrorEvent = new CustomEvent('timeRangeError', EVENT_DEFAULTS);
      this.targetEl.dispatchEvent(timeRangeErrorEvent);
    } else {
      this._setTimeValue(prettyTime, origin);
    }
  }

  _generateNoneElement(optionValue, useSelect) {
    var label, className, value;

    if (typeof optionValue == "object") {
      label = optionValue.label;
      className = optionValue.className;
      value = optionValue.value;
    } else if (typeof optionValue == "string") {
      label = optionValue;
      value = "";
    } else {
      $.error("Invalid noneOption value");
    }

    let el;
    if (useSelect) {
      el = document.createElement("option");
      el.value = value;
    } else {
      el = document.createElement("li");
      el.dataset.time = String(value);
    }

    el.innerText = label;
    el.classList.add(className);
    return el;
  }


  /*
   *  Time typeahead
   */
  _handleKeyUp(e) {
    if (!this.list || !Timepicker.isVisible(this.list) || this.settings.disableTextInput) {
      return true;
    }

    if (e.type === "paste" || e.type === "cut") {
      const handler = () => {
        if (this.settings.typeaheadHighlight) {
          this._setSelected();
        } else {
          this.list.hide();
        }
      }

      setTimeout(handler, 0);
      return;
    }

    switch (e.keyCode) {
      case 96: // numpad numerals
      case 97:
      case 98:
      case 99:
      case 100:
      case 101:
      case 102:
      case 103:
      case 104:
      case 105:
      case 48: // numerals
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
      case 65: // a
      case 77: // m
      case 80: // p
      case 186: // colon
      case 8: // backspace
      case 46: // delete
        if (this.settings.typeaheadHighlight) {
          this._setSelected();
        } else {
          this.list.hide();
        }
        break;
    }
  }
}

// IE9-11 polyfill for CustomEvent
(function () {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    if (!params) {
      params = {};
    }

    params = Object.assign(EVENT_DEFAULTS, params);
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  window.CustomEvent = CustomEvent;
})();

export default Timepicker;
