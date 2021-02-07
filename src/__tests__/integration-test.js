jest.dontMock("jquery").dontMock("../jquery.timepicker");

import $ from "jquery";
import { _expectThrewEvent, _expectDidntThrowEvent } from '../testHelpers.js'
require("../jquery.timepicker");


const TEST_INPUT = "testInput";
let el = ''

beforeEach(() => {
  document.body.innerHTML = `<div>
      <input type="text" id="${TEST_INPUT}" />
    </div>`;

  el = document.getElementById(TEST_INPUT)
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

  $(el).timepicker(
    "setTime",
    new Date("December 17, 1995 03:24:00")
  );
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
  $(el)
    .get(0)
    .dispatchEvent(event);
});

test("option works", () => {
  $(el).timepicker({ disableTextInput: true });
  expect($(el).timepicker("option", "disableTextInput")).toEqual(
    true
  );

  $(el).timepicker("option", { disableTextInput: false });
  expect($(el).timepicker("option", "disableTextInput")).toEqual(
    false
  );
});

test("selecting throws a change event", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({});
  const initialValue = $(el).val();

  $(el).timepicker("show");
  $(".ui-timepicker-list li:first-child").trigger("click");
  const afterValue = $(el).val();

  expect(initialValue).not.toEqual(afterValue);
  _expectThrewEvent(el.dispatchEvent.mock, 'change');
});

test("setTime doesn't throw a change event", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({});
  $(el).timepicker('setTime', '3pm');
  $(el).timepicker('setTime', '4pm');
  expect($(el).val()).toEqual('4:00pm');

  _expectDidntThrowEvent(el.dispatchEvent.mock, 'change');
});
