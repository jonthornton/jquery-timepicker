import { DEFAULT_SETTINGS, DEFAULT_LANG } from "./defaults";
import { ONE_DAY } from "./constants";

class Timepicker {
  constructor(targetEl, options = {}) {
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
      // console.log(key, element)
      if (key in element.dataset) {
        output[key] = element.dataset[key];
      }
    }
    return output;
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
}

export default Timepicker;
