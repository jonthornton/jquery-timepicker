jest.dontMock("jquery").dontMock("../jquery.timepicker");

import $ from "jquery";
import { _expectThrewEvent, _expectDidntThrowEvent } from "../testHelpers.js";
require("../jquery.timepicker");

const TEST_INPUT = "testInput";
let el = "";

beforeEach(() => {
  document.body.innerHTML = `<div>
      <input type="text" id="${TEST_INPUT}" />
    </div>`;

  el = document.getElementById(TEST_INPUT);
});

test("timepicker initializes", () => {
  $(el).timepicker();
});

test("show single string noneOption correctly", () => {
  $(el).timepicker({ noneOption: "----" });
  $(el).timepicker("show");

  $(".ui-timepicker-list li:first-child").trigger("click");
  expect($(el).val()).toEqual("");
});

test("timepicker can parse time value", () => {
  $(el).val("2:37pm");
  $(el).timepicker();

  const expectedSecondsFromMidnight = 14 * 3600 + 37 * 60;
  expect($(el).timepicker("getSecondsFromMidnight")).toEqual(
    expectedSecondsFromMidnight
  );
});

test("timepicker can tolerate undefined values", () => {
  $(el).val("2:37pm");
  $(el).timepicker({ disableTimeRanges: null });
});

test("setTime works", () => {
  $(el).val("2:37pm");
  $(el).timepicker();

  $(el).timepicker("setTime", 43200);

  expect($(el).val()).toEqual("12:00pm");

  $(el).timepicker("setTime", "11pm");
  expect($(el).val()).toEqual("11:00pm");

  $(el).timepicker("setTime", new Date("December 17, 1995 03:24:00"));
  expect($(el).val()).toEqual("3:24am");
});

test("showDuration works", () => {
  $(el).val("2:00pm");
  $(el).timepicker({
    showDuration: true,
    durationTime: "2:00pm"
  });
  $(el).timepicker("show");
});

test("disableTextInput works", () => {
  $(el).val("2:00pm");
  $(el).timepicker({ disableTextInput: true });
  const event = new KeyboardEvent("keydown", { keyCode: 37 });
  $(el).get(0).dispatchEvent(event);
});

test("useSelect doesn't crash", () => {
  $(el).val("2:00pm");
  $(el).timepicker({ useSelect: true });
});

// GH-794
test("useSelect keeps the initial value", () => {
  $(el).val("2:30pm");
  $(el).timepicker({ useSelect: true });

  expect($(el).val()).toEqual("2:30pm");
  expect($(".ui-timepicker-select option:selected").text()).toEqual("2:30pm");
});

test("useSelect setTime updates the select", () => {
  $(el).timepicker({ useSelect: true });
  $(el).timepicker("setTime", "3:00pm");

  expect($(el).val()).toEqual("3:00pm");
  expect($(".ui-timepicker-select option:selected").text()).toEqual("3:00pm");
});

test("useSelect picking an option sets a formatted time", () => {
  $(el).timepicker({ useSelect: true });

  const select = $(".ui-timepicker-select");
  select.val(select.find("option:contains('3:00pm')").val()).trigger("change");

  expect($(el).val()).toEqual("3:00pm");
});

test("option works", () => {
  $(el).timepicker({ disableTextInput: true });
  expect($(el).timepicker("option", "disableTextInput")).toEqual(true);

  $(el).timepicker("option", { disableTextInput: false });
  expect($(el).timepicker("option", "disableTextInput")).toEqual(false);
});

test("selecting throws a change event", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({});
  const initialValue = $(el).val();

  $(el).timepicker("show");
  $(".ui-timepicker-list li:first-child").trigger("click");
  const afterValue = $(el).val();

  expect(initialValue).not.toEqual(afterValue);
  _expectThrewEvent(el.dispatchEvent.mock, "change");
});

test("setTime doesn't throw a change event", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({});
  $(el).timepicker("setTime", "3pm");
  $(el).timepicker("setTime", "4pm");
  expect($(el).val()).toEqual("4:00pm");

  _expectDidntThrowEvent(el.dispatchEvent.mock, "change");
});

test("setTime can't set a disabled time", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({ disableTimeRanges: [["1:00pm", "5:00pm"]] });
  $(el).timepicker("setTime", "2pm");

  _expectThrewEvent(el.dispatchEvent.mock, "timeRangeError");
});

// jQuery 4 reimplemented focus/blur on top of the native events, and the
// plugin opens on focus by default (showOn: ["click", "focus"]), so these
// cover the paths most likely to break across jQuery majors.
//
// Timepicker.isVisible reads offsetWidth/offsetHeight, which jsdom always
// reports as 0. Without this shim every assertion below passes vacuously.
function withLayout(fn) {
  const props = ["offsetWidth", "offsetHeight"];
  const saved = props.map(p =>
    Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, p)
  );

  props.forEach(p =>
    Object.defineProperty(window.HTMLElement.prototype, p, {
      configurable: true,
      get() {
        if (!this.isConnected) return 0;
        for (let n = this; n && n.style; n = n.parentElement) {
          if (n.style.display === "none") return 0;
        }
        return 100;
      }
    })
  );

  try {
    fn();
  } finally {
    props.forEach((p, i) =>
      saved[i]
        ? Object.defineProperty(window.HTMLElement.prototype, p, saved[i])
        : delete window.HTMLElement.prototype[p]
    );
  }
}

test("layout shim makes isVisible observable", () => {
  $(el).timepicker();
  withLayout(() => {
    $(el).timepicker("show");
    expect($(el).timepicker("isVisible")).toEqual(true);
  });
});

test("opens on native focus", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    el.focus();
    expect($(el).timepicker("isVisible")).toEqual(true);
  });
});

test("opens on click", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    $(el).trigger("click");
    expect($(el).timepicker("isVisible")).toEqual(true);
  });
});

test("escape and enter close the dropdown", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });

    $(el).timepicker("show");
    $(el).trigger($.Event("keydown", { keyCode: 27, which: 27 }));
    expect($(el).timepicker("isVisible")).toEqual(false);

    $(el).timepicker("show");
    $(el).trigger($.Event("keydown", { keyCode: 13, which: 13 }));
    expect($(el).timepicker("isVisible")).toEqual(false);
  });
});

test("hide closes an open dropdown", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    $(el).timepicker("show");
    $(el).timepicker("hide");
    expect($(el).timepicker("isVisible")).toEqual(false);
  });
});

test("remove tears down plugin state", () => {
  $(el).timepicker();
  $(el).timepicker("remove");
  expect($(el).data("timepicker-obj")).toBeFalsy();
});

test("12-hour format with an am/pm-less minTime renders a list", () => {
  $(el).timepicker({
    timeFormat: "g:i A",
    minTime: "10:30:00",
    maxTime: "17:00:00",
    step: 30
  });
  $(el).timepicker("show");

  expect($(".ui-timepicker-list li:first-child").text()).toEqual("10:30 AM");
  expect($(".ui-timepicker-list li:last-child").text()).toEqual("5:00 PM");
});
