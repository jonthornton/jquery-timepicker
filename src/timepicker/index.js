import { DEFAULT_SETTINGS, DEFAULT_LANG } from "./defaults";
import { ONE_DAY } from "./constants";

class Timepicker {
  constructor(targetEl, options = {}) {
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
      const parsed = Number.parseInt(obj.dataset.time);

      if (Number.isNaN(parsed)) {
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
        tp.list.val(tp._roundAndFormatTime(tp.time2int(value)));
      }
    }

    const selectTimeEvent = new Event('selectTime');

    if (this.selectedValue != value) {
      this.selectedValue = value;

      const changeTimeEvent = new Event('changeTime');
      const changeEvent = new CustomEvent('change', { detail: 'timepicker'});

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
      const parsedTimeValue = Number.parseInt(timeValue);
      if (parsedTimeValue) {
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

  time2int(timeString) {
    if (timeString === "" || timeString === null || timeString === undefined)
      return null;
    if (timeString instanceof Date) {
      return (
        timeString.getHours() * 3600 +
        timeString.getMinutes() * 60 +
        timeString.getSeconds()
      );
    }
    if (typeof timeString != "string") {
      return timeString;
    }

    timeString = timeString.toLowerCase().replace(/[\s\.]/g, "");

    // if the last character is an "a" or "p", add the "m"
    if (timeString.slice(-1) == "a" || timeString.slice(-1) == "p") {
      timeString += "m";
    }

    var pattern = /^(([^0-9]*))?([0-9]?[0-9])(\W?([0-5][0-9]))?(\W+([0-5][0-9]))?(([^0-9]*))$/;
    var time = timeString.match(pattern);
    if (!time) {
      return null;
    }

    var hour = parseInt(time[3] * 1, 10);
    var ampm = time[2] || time[9];
    var hours = hour;
    var minutes = time[5] * 1 || 0;
    var seconds = time[7] * 1 || 0;

    if (!ampm && time[3].length == 2 && time[3][0] == "0") {
      // preceding '0' implies AM
      ampm = "am";
    }

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
      this.settings.scrollDefault
    ) {
      var delta = timeInt - this.settings.scrollDefault();
      if (delta < 0 && delta >= ONE_DAY / -2) {
        timeInt = (timeInt + ONE_DAY / 2) % ONE_DAY;
      }
    }

    return timeInt;
  }

  parseSettings(settings) {
    settings.lang = { ...DEFAULT_LANG, ...settings.lang };

    // lang is used by other functions the rest of this depends on
    // todo: unwind circular dependency on lang
    this.settings = settings;
    if (settings.minTime) {
      settings.minTime = this.time2int(settings.minTime);
    }

    if (settings.maxTime) {
      settings.maxTime = this.time2int(settings.maxTime);
    }

    if (settings.listWidth) {
      settings.listWidth = this.time2int(settings.listWidth);
    }

    if (settings.durationTime && typeof settings.durationTime !== "function") {
      settings.durationTime = this.time2int(settings.durationTime);
    }

    if (settings.scrollDefault == "now") {
      settings.scrollDefault = () => {
        return settings.roundingFunction(this.time2int(new Date()), settings);
      };
    } else if (
      settings.scrollDefault &&
      typeof settings.scrollDefault != "function"
    ) {
      var val = settings.scrollDefault;
      settings.scrollDefault = () => {
        return settings.roundingFunction(this.time2int(val), settings);
      };
    } else if (settings.minTime) {
      settings.scrollDefault = function() {
        return settings.roundingFunction(settings.minTime, settings);
      };
    }

    if (
      typeof settings.timeFormat === "string" &&
      settings.timeFormat.match(/[gh]/)
    ) {
      settings._twelveHourTime = true;
    }

    if (
      settings.showOnFocus === false &&
      settings.showOn.indexOf("focus") != -1
    ) {
      settings.showOn.splice(settings.showOn.indexOf("focus"), 1);
    }

    if (!settings.disableTimeRanges) {
      settings.disableTimeRanges = [];
    }

    if (settings.disableTimeRanges.length > 0) {
      // convert string times to integers
      for (var i in settings.disableTimeRanges) {
        settings.disableTimeRanges[i] = [
          this.time2int(settings.disableTimeRanges[i][0]),
          this.time2int(settings.disableTimeRanges[i][1])
        ];
      }

      // sort by starting time
      settings.disableTimeRanges = settings.disableTimeRanges.sort(function(
        a,
        b
      ) {
        return a[0] - b[0];
      });

      // merge any overlapping ranges
      for (var i = settings.disableTimeRanges.length - 1; i > 0; i--) {
        if (
          settings.disableTimeRanges[i][0] <=
          settings.disableTimeRanges[i - 1][1]
        ) {
          settings.disableTimeRanges[i - 1] = [
            Math.min(
              settings.disableTimeRanges[i][0],
              settings.disableTimeRanges[i - 1][0]
            ),
            Math.max(
              settings.disableTimeRanges[i][1],
              settings.disableTimeRanges[i - 1][1]
            )
          ];
          settings.disableTimeRanges.splice(i, 1);
        }
      }
    }

    return settings;
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

    const timeValue = this.time2int(this._getTimeValue());
  
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
      
      const parsed = Number.parseInt(selected.dataset.time);

      if (this.settings.forceRoundTime || parsed === timeValue) {
        selected.classList.add('ui-timepicker-selected');
      }
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
}

export default Timepicker;
