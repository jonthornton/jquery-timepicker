import Timepicker from "./timepicker/index.js";
import moduloSeconds from "./timepicker/rounding.js";
import { ONE_DAY } from "./timepicker/constants.js";
import { DEFAULT_SETTINGS } from "./timepicker/defaults.js";

(function(factory) {
  if (
    typeof exports === "object" &&
    exports &&
    typeof module === "object" &&
    module &&
    module.exports === exports
  ) {
    // Browserify. Attach to jQuery module.
    factory(require("jquery"));
  } else if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function($) {
  var _lang = {};

  var methods = {
    init: function(options) {
      return this.each(function() {
        var self = $(this);

        const tp = new Timepicker(this, options);
        const settings = tp.settings;
        _lang = settings.lang;

        self.data("timepicker-obj", tp);
        self.addClass("ui-timepicker-input");

        if (settings.useSelect) {
          _render(self);
        } else {
          self.prop("autocomplete", "off");
          if (settings.showOn) {
            for (var i in settings.showOn) {
              self.on(settings.showOn[i] + ".timepicker", methods.show);
            }
          }
          self.on("change.timepicker", _formatValue);
          self.on("keydown.timepicker", _keydownhandler);
          self.on("keyup.timepicker", _keyuphandler);
          if (settings.disableTextInput) {
            self.on("keydown.timepicker", tp._disableTextInputHandler);
          }
          self.on("cut.timepicker", _keyuphandler);
          self.on("paste.timepicker", _keyuphandler);

          _formatValue.call(self.get(0), null, "initial");
        }
      });
    },

    show: function(e) {
      var self = $(this);
      var tp = self.data("timepicker-obj");
      var settings = tp.settings;

      if (e) {
        e.preventDefault();
      }

      if (settings.useSelect) {
        tp.list.focus();
        return;
      }

      if (tp._hideKeyboard()) {
        // block the keyboard on mobile devices
        self.blur();
      }

      var list = tp.list;

      // check if input is readonly
      if (self.prop("readonly")) {
        return;
      }

      // check if list needs to be rendered
      if (
        !list ||
        list.length === 0 ||
        typeof settings.durationTime === "function"
      ) {
        _render(self);
        list = tp.list;
      }

      if (Timepicker.isVisible(list)) {
        return;
      }

      if (self.is('input')) {
        tp.selectedValue = self.val();
      }

      tp._setSelected();

      // make sure other pickers are hidden
      methods.hide();

      if (typeof settings.listWidth == "number") {
        list.width(self.outerWidth() * settings.listWidth);
      }

      // position the dropdown relative to the input
      list.show();
      var listOffset = {};

      if (settings.orientation.match(/r/)) {
        // right-align the dropdown
        listOffset.left =
          self.offset().left +
          self.outerWidth() -
          list.outerWidth() +
          parseInt(list.css("marginLeft").replace("px", ""), 10);
      } else if (settings.orientation.match(/l/)) {
        // left-align the dropdown
        listOffset.left =
          self.offset().left +
          parseInt(list.css("marginLeft").replace("px", ""), 10);
      } else if (settings.orientation.match(/c/)) {
        // center-align the dropdown
        listOffset.left =
          self.offset().left +
          (self.outerWidth() - list.outerWidth()) / 2 +
          parseInt(list.css("marginLeft").replace("px", ""), 10);
      }

      var verticalOrientation;
      if (settings.orientation.match(/t/)) {
        verticalOrientation = "t";
      } else if (settings.orientation.match(/b/)) {
        verticalOrientation = "b";
      } else if (
        self.offset().top + self.outerHeight(true) + list.outerHeight() >
        $(window).height() + $(window).scrollTop()
      ) {
        verticalOrientation = "t";
      } else {
        verticalOrientation = "b";
      }

      if (verticalOrientation == "t") {
        // position the dropdown on top
        list.addClass("ui-timepicker-positioned-top");
        listOffset.top =
          self.offset().top -
          list.outerHeight() +
          parseInt(list.css("marginTop").replace("px", ""), 10);
      } else {
        // put it under the input
        list.removeClass("ui-timepicker-positioned-top");
        listOffset.top =
          self.offset().top +
          self.outerHeight() +
          parseInt(list.css("marginTop").replace("px", ""), 10);
      }

      list.offset(listOffset);

      // position scrolling
      var selected = list.find(".ui-timepicker-selected");

      if (!selected.length) {
        var timeInt = tp.time2int(tp._getTimeValue());
        if (timeInt !== null) {
          selected = $(tp._findRow(timeInt));
        } else if (settings.scrollDefault) {
          selected = $(tp._findRow(settings.scrollDefault()));
        }
      }

      // if not found or disabled, intelligently find first selectable element
      if (!selected.length || selected.hasClass("ui-timepicker-disabled")) {
        selected = list.find("li:not(.ui-timepicker-disabled):first");
      }

      if (selected && selected.length) {
        var topOffset =
          list.scrollTop() + selected.position().top - selected.outerHeight();
        list.scrollTop(topOffset);
      } else {
        list.scrollTop(0);
      }

      // prevent scroll propagation
      if (settings.stopScrollPropagation) {
        $(document).on(
          "wheel.ui-timepicker",
          ".ui-timepicker-wrapper",
          function(e) {
            e.preventDefault();
            var currentScroll = $(this).scrollTop();
            $(this).scrollTop(currentScroll + e.originalEvent.deltaY);
          }
        );
      }

      // attach close handlers
      $(document).on("mousedown.ui-timepicker", _closeHandler);
      $(window).on("resize.ui-timepicker", _closeHandler);
      if (settings.closeOnWindowScroll) {
        $(document).on("scroll.ui-timepicker", _closeHandler);
      }

      self.trigger("showTimepicker");

      return this;
    },

    hide: function(e) {
      var self = $(this);
      var tp = self.data("timepicker-obj");

      if (tp && tp.settings && tp.settings.useSelect) {
        self.blur();
      }

      $(".ui-timepicker-wrapper").each(function() {
        var list = $(this);
        if (!Timepicker.isVisible(list)) {
          return;
        }

        var self = list.data("timepicker-input");
        var tp = self.data("timepicker-obj");

        if (tp && tp.settings && tp.settings.selectOnBlur) {
          tp._selectValue();
        }

        list.hide();
        self.trigger("hideTimepicker");
      });

      return this;
    },

    option: function(key, value) {
      if (typeof key == "string" && typeof value == "undefined") {
        var tp = $(this).data("timepicker-obj");
        return tp.settings[key];
      }

      return this.each(function() {
        var self = $(this);
        var tp = self.data("timepicker-obj");
        var settings = tp.settings;
        var list = tp.list;

        if (typeof key == "object") {
          settings = $.extend(settings, key);
        } else if (typeof key == "string") {
          settings[key] = value;
        }

        settings = tp.parseSettings(settings);
        tp.settings = settings;

        _formatValue.call(self.get(0), { type: "change" }, "initial");

        if (list) {
          list.remove();
          tp.list = null;
        }

        if (settings.useSelect) {
          _render(self);
        }
      });
    },

    getSecondsFromMidnight: function() {
      var self = $(this);
      var tp = self.data("timepicker-obj");
      return tp.time2int(tp._getTimeValue());
    },

    getTime: function(relative_date) {
      var self = $(this);
      var tp = self.data("timepicker-obj");

      var time_string = tp._getTimeValue();
      if (!time_string) {
        return null;
      }

      var offset = tp.time2int(time_string);
      if (offset === null) {
        return null;
      }

      if (!relative_date) {
        relative_date = new Date();
      }

      // construct a Date from relative date, and offset's time
      var time = new Date(relative_date);
      time.setHours(offset / 3600);
      time.setMinutes((offset % 3600) / 60);
      time.setSeconds(offset % 60);
      time.setMilliseconds(0);

      return time;
    },

    isVisible: function() {
      var self = this;
      var tp = self.data("timepicker-obj");
      return !!(tp && tp.list && Timepicker.isVisible(tp.list));
    },

    setTime: function(value) {
      var self = this;
      var tp = self.data("timepicker-obj");
      var settings = tp.settings;

      if (settings.forceRoundTime) {
        var prettyTime = tp._roundAndFormatTime(tp.time2int(value));
      } else {
        var prettyTime = tp._int2time(tp.time2int(value));
      }

      if (value && prettyTime === null && settings.noneOption) {
        prettyTime = value;
      }

      tp._setTimeValue(prettyTime, "initial");
      _formatValue.call(self.get(0), { type: "change" }, "initial");

      if (tp && tp.list) {
        tp._setSelected();
      }

      return this;
    },

    remove: function() {
      var self = this;

      // check if this element is a timepicker
      if (!self.hasClass("ui-timepicker-input")) {
        return;
      }

      var tp = self.data("timepicker-obj");
      var settings = tp.settings;

      self.removeAttr("autocomplete", "off");
      self.removeClass("ui-timepicker-input");
      self.removeData("timepicker-obj");
      self.off(".timepicker");

      // timepicker-list won't be present unless the user has interacted with this timepicker
      if (tp.list) {
        tp.list.remove();
      }

      if (settings.useSelect) {
        self.show();
      }

      tp.list = null;

      return this;
    }
  };

  // private methods

  function _render(self) {
    var tp = self.data("timepicker-obj");
    var list = tp.list;
    var settings = tp.settings;

    if (list && list.length) {
      list.remove();
      tp.list = null;
    }

    if (settings.useSelect) {
      list = $("<select />", { class: "ui-timepicker-select" });
      if (self.attr("name")) {
        list.attr("name", "ui-timepicker-" + self.attr("name"));
      }
      var wrapped_list = list;
    } else {
      list = $("<ul />", { class: "ui-timepicker-list" });

      var wrapped_list = $("<div />", {
        class: "ui-timepicker-wrapper",
        tabindex: -1
      });
      wrapped_list.css({ display: "none", position: "absolute" }).append(list);
    }

    if (settings.noneOption) {
      if (settings.noneOption === true) {
        settings.noneOption = settings.useSelect ? "Time..." : "None";
      }

      if ($.isArray(settings.noneOption)) {
        for (var i in settings.noneOption) {
          if (parseInt(i, 10) == i) {
            var noneElement = tp._generateNoneElement(
              settings.noneOption[i],
              settings.useSelect
            );
            list.append(noneElement);
          }
        }
      } else {
        var noneElement = tp._generateNoneElement(
          settings.noneOption,
          settings.useSelect
        );
        list.append(noneElement);
      }
    }

    if (settings.className) {
      wrapped_list.addClass(settings.className);
    }

    if (
      (settings.minTime !== null || settings.durationTime !== null) &&
      settings.showDuration
    ) {
      var stepval =
        typeof settings.step == "function" ? "function" : settings.step;
      wrapped_list.addClass("ui-timepicker-with-duration");
      wrapped_list.addClass("ui-timepicker-step-" + settings.step);
    }

    var durStart = settings.minTime;
    if (typeof settings.durationTime === "function") {
      durStart = tp.time2int(settings.durationTime());
    } else if (settings.durationTime !== null) {
      durStart = settings.durationTime;
    }
    var start = settings.minTime !== null ? settings.minTime : 0;
    var end =
      settings.maxTime !== null ? settings.maxTime : start + ONE_DAY - 1;

    if (end < start) {
      // make sure the end time is greater than start time, otherwise there will be no list to show
      end += ONE_DAY;
    }

    if (
      end === ONE_DAY - 1 &&
      $.type(settings.timeFormat) === "string" &&
      settings.show2400
    ) {
      // show a 24:00 option when using military time
      end = ONE_DAY;
    }

    var dr = settings.disableTimeRanges;
    var drCur = 0;
    var drLen = dr.length;

    var stepFunc = settings.step;
    if (typeof stepFunc != "function") {
      stepFunc = function() {
        return settings.step;
      };
    }

    for (var i = start, j = 0; i <= end; j++, i += stepFunc(j) * 60) {
      var timeInt = i;
      var timeString = tp._int2time(timeInt);

      if (settings.useSelect) {
        var row = $("<option />", { value: timeString });
        row.text(timeString);
      } else {
        var row = $("<li />");
        row.addClass(
          timeInt % ONE_DAY < ONE_DAY / 2
            ? "ui-timepicker-am"
            : "ui-timepicker-pm"
        );
        row.attr("data-time", moduloSeconds(timeInt, settings));
        row.text(timeString);
      }

      if (
        (settings.minTime !== null || settings.durationTime !== null) &&
        settings.showDuration
      ) {
        var durationString = tp._int2duration(i - durStart, settings.step);
        if (settings.useSelect) {
          row.text(row.text() + " (" + durationString + ")");
        } else {
          var duration = $("<span />", { class: "ui-timepicker-duration" });
          duration.text(" (" + durationString + ")");
          row.append(duration);
        }
      }

      if (drCur < drLen) {
        if (timeInt >= dr[drCur][1]) {
          drCur += 1;
        }

        if (dr[drCur] && timeInt >= dr[drCur][0] && timeInt < dr[drCur][1]) {
          if (settings.useSelect) {
            row.prop("disabled", true);
          } else {
            row.addClass("ui-timepicker-disabled");
          }
        }
      }

      list.append(row);
    }

    wrapped_list.data("timepicker-input", self);
    tp.list = wrapped_list;

    if (settings.useSelect) {
      if (self.val()) {
        list.val(tp._roundAndFormatTime(tp.time2int(self.val())));
      }

      list.on("focus", function() {
        $(this)
          .data("timepicker-input")
          .trigger("showTimepicker");
      });
      list.on("blur", function() {
        $(this)
          .data("timepicker-input")
          .trigger("hideTimepicker");
      });
      list.on("change", function() {
        tp._setTimeValue($(this).val(), "select");
      });

      tp._setTimeValue(list.val(), "initial");
      self.hide().after(list);
    } else {
      var appendTo = settings.appendTo;
      if (typeof appendTo === "string") {
        appendTo = $(appendTo);
      } else if (typeof appendTo === "function") {
        appendTo = appendTo(self);
      }
      appendTo.append(wrapped_list);
      tp._setSelected();

      list.on("mousedown click", "li", function(e) {
        // hack: temporarily disable the focus handler
        // to deal with the fact that IE fires 'focus'
        // events asynchronously
        self.off("focus.timepicker");
        self.on("focus.timepicker-ie-hack", function() {
          self.off("focus.timepicker-ie-hack");
          self.on("focus.timepicker", methods.show);
        });

        if (!tp._hideKeyboard()) {
          self[0].focus();
        }

        // make sure only the clicked row is selected
        list.find("li").removeClass("ui-timepicker-selected");
        $(this).addClass("ui-timepicker-selected");

        if (tp._selectValue()) {
          self.trigger("hideTimepicker");

          list.on("mouseup.timepicker click.timepicker", "li", function(e) {
            list.off("mouseup.timepicker click.timepicker");
            wrapped_list.hide();
          });
        }
      });
    }
  }

  // event handler to decide whether to close timepicker
  function _closeHandler(e) {
    if (e.target == window) {
      // mobile Chrome fires focus events against window for some reason
      return;
    }

    var target = $(e.target);

    if (
      target.closest(".ui-timepicker-input").length ||
      target.closest(".ui-timepicker-wrapper").length
    ) {
      // active timepicker was focused. ignore
      return;
    }

    methods.hide();
    $(document).unbind(".ui-timepicker");
    $(window).unbind(".ui-timepicker");
  }

  function _formatValue(e, origin) {
    if (e && e.detail == "timepicker") {
      return;
    }

    var self = $(this);
    var tp = self.data("timepicker-obj");

    if (this.value === "") {
      tp._setTimeValue(null, origin);
      return;
    }

    if (self.is(":focus") && (!e || e.type != "change")) {
      return;
    }

    var settings = tp.settings;
    var seconds = tp.time2int(this.value);

    if (seconds === null) {
      self.trigger("timeFormatError");
      return;
    }

    var rangeError = false;
    // check that the time in within bounds
    if (
      settings.minTime !== null &&
      settings.maxTime !== null &&
      (seconds < settings.minTime || seconds > settings.maxTime)
    ) {
      rangeError = true;
    }

    // check that time isn't within disabled time ranges
    $.each(settings.disableTimeRanges, function() {
      if (seconds >= this[0] && seconds < this[1]) {
        rangeError = true;
        return false;
      }
    });

    if (settings.forceRoundTime) {
      var roundSeconds = settings.roundingFunction(seconds, settings);
      if (roundSeconds != seconds) {
        seconds = roundSeconds;
        origin = null;
      }
    }

    var prettyTime = tp._int2time(seconds);

    if (rangeError) {
      if (
        tp._setTimeValue(prettyTime, "error") ||
        (e && e.type == "change")
      ) {
        self.trigger("timeRangeError");
      }
    } else {
      tp._setTimeValue(prettyTime, origin);
    }
  }

  /*
   *  Keyboard navigation via arrow keys
   */
  function _keydownhandler(e) {
    var self = $(this);
    var tp = self.data("timepicker-obj");
    var list = tp.list;

    if (!list || !Timepicker.isVisible(list)) {
      if (e.keyCode == 40) {
        // show the list!
        methods.show.call(self.get(0));
        list = tp.list;
        if (!tp._hideKeyboard()) {
          self.focus();
        }
      } else {
        return true;
      }
    }

    switch (e.keyCode) {
      case 13: // return
        if (tp._selectValue()) {
          _formatValue.call(self.get(0), { type: "change" });
          methods.hide.apply(this);
        }

        e.preventDefault();
        return false;

      case 38: // up
        var selected = list.find(".ui-timepicker-selected");

        if (!selected.length) {
          list.find("li").each(function(i, obj) {
            if ($(obj).position().top > 0) {
              selected = $(obj);
              return false;
            }
          });
          selected.addClass("ui-timepicker-selected");
        } else if (!selected.is(":first-child")) {
          selected.removeClass("ui-timepicker-selected");
          selected.prev().addClass("ui-timepicker-selected");

          if (selected.prev().position().top < selected.outerHeight()) {
            list.scrollTop(list.scrollTop() - selected.outerHeight());
          }
        }

        return false;

      case 40: // down
        selected = list.find(".ui-timepicker-selected");

        if (selected.length === 0) {
          list.find("li").each(function(i, obj) {
            if ($(obj).position().top > 0) {
              selected = $(obj);
              return false;
            }
          });

          selected.addClass("ui-timepicker-selected");
        } else if (!selected.is(":last-child")) {
          selected.removeClass("ui-timepicker-selected");
          selected.next().addClass("ui-timepicker-selected");

          if (
            selected.next().position().top + 2 * selected.outerHeight() >
            list.outerHeight()
          ) {
            list.scrollTop(list.scrollTop() + selected.outerHeight());
          }
        }

        return false;

      case 27: // escape
        list.find("li").removeClass("ui-timepicker-selected");
        methods.hide();
        break;

      case 9: //tab
        methods.hide();
        break;

      default:
        return true;
    }
  }

  /*
   *	Time typeahead
   */
  function _keyuphandler(e) {
    var self = $(this);
    var tp = self.data("timepicker-obj");
    var list = tp.list;
    var settings = tp.settings;

    if (!list || !Timepicker.isVisible(list) || settings.disableTextInput) {
      return true;
    }

    if (e.type === "paste" || e.type === "cut") {
      setTimeout(function() {
        if (settings.typeaheadHighlight) {
          tp._setSelected();
        } else {
          list.hide();
        }
      }, 0);
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
        if (settings.typeaheadHighlight) {
          tp._setSelected();
        } else {
          list.hide();
        }
        break;
    }
  }

  // Plugin entry
  $.fn.timepicker = function(method) {
    if (!this.length) return this;
    if (methods[method]) {
      // check if this element is a timepicker
      if (!this.hasClass("ui-timepicker-input")) {
        return this;
      }
      return methods[method].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof method === "object" || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error("Method " + method + " does not exist on jQuery.timepicker");
    }
  };

  // Default plugin options.
  $.fn.timepicker.defaults = DEFAULT_SETTINGS;
});
