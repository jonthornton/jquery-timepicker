import Timepicker from "./timepicker/index.js";
import renderHtml from "./timepicker/render.js";
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

        this.timepickerObj = tp;
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
          self.on("change.timepicker", tp._handleFormatValue);
          self.on("keydown.timepicker", _keydownhandler);
          self.on("keyup.timepicker", tp._handleKeyUp);
          if (settings.disableTextInput) {
            self.on("keydown.timepicker", tp._disableTextInputHandler);
          }
          self.on("cut.timepicker", tp._handleKeyUp);
          self.on("paste.timepicker", tp._handleKeyUp);

          tp._formatValue(null, "initial");
        }
      });
    },

    show: function(e) {
      var self = $(this);
      var tp = self[0].timepickerObj;
      var settings = tp.settings;

      if (e) {
        e.preventDefault();
      }

      if (settings.useSelect) {
        tp.list.trigger('focus');
        return;
      }

      if (tp._hideKeyboard()) {
        // block the keyboard on mobile devices
        self.trigger('blur');
      }

      var list = tp.list;

      // check if input is readonly
      if (self.prop("readonly")) {
        return;
      }

      // check if list needs to be rendered
      _render(self);
      list = tp.list;

      if (Timepicker.isVisible(list)) {
        return;
      }

      if (self.is('input')) {
        tp.selectedValue = self.val();
      }

      tp._setSelected();

      // make sure other pickers are hidden
      Timepicker.hideAll();

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
        var timeInt = tp.anytime2int(tp._getTimeValue());
        if (timeInt !== null) {
          selected = $(tp._findRow(timeInt));
        } else if (settings.scrollDefault()) {
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
      window.addEventListener('resize', _closeHandler);
      if (settings.closeOnWindowScroll) {
        $(document).on("scroll.ui-timepicker", _closeHandler);
      }

      self.trigger("showTimepicker");

      return this;
    },

    hide: function(e) {
      var tp = this[0].timepickerObj;

      if (tp){
        tp.hideMe();
      }

      Timepicker.hideAll();
      return this;
    },

    option: function(key, value) {
      if (typeof key == "string" && typeof value == "undefined") {
        var tp = this[0].timepickerObj
        return tp.settings[key];
      }

      return this.each(function() {
        var self = $(this);
        var tp = self[0].timepickerObj;
        var settings = tp.settings;
        var list = tp.list;

        if (typeof key == "object") {
          settings = $.extend(settings, key);
        } else if (typeof key == "string") {
          settings[key] = value;
        }

        settings = tp.parseSettings(settings);
        tp.settings = settings;

        tp._formatValue({ type: "change" }, "initial");

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
      var tp = this[0].timepickerObj;
      return tp.anytime2int(tp._getTimeValue());
    },

    getTime: function(relative_date) {
      var tp = this[0].timepickerObj;

      var time_string = tp._getTimeValue();
      if (!time_string) {
        return null;
      }

      var offset = tp.anytime2int(time_string);
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
      var tp = this[0].timepickerObj;
      return !!(tp && tp.list && Timepicker.isVisible(tp.list));
    },

    setTime: function(value) {
      var tp = this[0].timepickerObj;
      var settings = tp.settings;

      if (settings.forceRoundTime) {
        var prettyTime = tp._roundAndFormatTime(tp.anytime2int(value));
      } else {
        var prettyTime = tp._int2time(tp.anytime2int(value));
      }

      if (value && prettyTime === null && settings.noneOption) {
        prettyTime = value;
      }

      tp._setTimeValue(prettyTime, "initial");
      tp._formatValue({ type: "change" }, "initial");

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

      var tp = self[0].timepickerObj;
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
    var tp = self[0].timepickerObj;
    var list = tp.list;
    var settings = tp.settings;

    if (list && list.length) {
      list.remove();
      tp.list = null;
    }

    const wrapped_list = $(renderHtml(tp));
    if (settings.useSelect) {
      list = wrapped_list;
    } else {
      list = wrapped_list.children('ul');
    }

    wrapped_list.data("timepicker-input", self);
    tp.list = wrapped_list;

    if (settings.useSelect) {
      if (self.val()) {
        list.val(tp._roundAndFormatTime(tp.anytime2int(self.val())));
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
    if (e.type == 'focus' && e.target == window) {
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

    Timepicker.hideAll();
    $(document).unbind(".ui-timepicker");
    $(window).unbind(".ui-timepicker");
  }

  

  /*
   *  Keyboard navigation via arrow keys
   */
  function _keydownhandler(e) {
    var self = $(this);
    var tp = self[0].timepickerObj;
    var list = tp.list;

    if (!list || !Timepicker.isVisible(list)) {
      if (e.keyCode == 40) {
        // show the list!
        methods.show.call(self.get(0));
        list = tp.list;
        if (!tp._hideKeyboard()) {
          self.trigger('focus');
        }
      } else {
        return true;
      }
    }

    switch (e.keyCode) {
      case 13: // return
        if (tp._selectValue()) {
          tp._formatValue({ type: "change" });
          tp.hideMe();
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
        tp.hideMe();
        break;

      case 9: //tab
        tp.hideMe();
        break;

      default:
        return true;
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
