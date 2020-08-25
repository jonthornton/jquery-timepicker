jest.dontMock("jquery").dontMock("../jquery.timepicker");

import $ from "jquery";
require("../jquery.timepicker");

const TEST_INPUT = "testInput";

beforeEach(() => {
  document.body.innerHTML = `<div>
      <input type="text" id="${TEST_INPUT}" />
    </div>`;
});

test("timepicker initializes", () => {
  $(`#${TEST_INPUT}`).timepicker();
});

test("show single string noneOption correctly", () => {
  $(`#${TEST_INPUT}`)
    .timepicker({
      noneOption: "----"
    })
    .timepicker("show");

  $(".ui-timepicker-list li:first-child").trigger("click");
  expect($(`#${TEST_INPUT}`).val()).toEqual("");
});

test("timepicker can parse time value", () => {
  $(`#${TEST_INPUT}`).val("2:37pm");
  $(`#${TEST_INPUT}`).timepicker();

  const expectedSecondsFromMidnight = 14 * 3600 + 37 * 60;
  expect($(`#${TEST_INPUT}`).timepicker("getSecondsFromMidnight")).toEqual(
    expectedSecondsFromMidnight
  );
});

test("timepicker can tolerate undefined values", () => {
  $(`#${TEST_INPUT}`).val("2:37pm");
  $(`#${TEST_INPUT}`).timepicker({ disableTimeRanges: null });
});

test("setTime works", () => {
  $(`#${TEST_INPUT}`).val("2:37pm");
  $(`#${TEST_INPUT}`).timepicker();

  $(`#${TEST_INPUT}`).timepicker("setTime", 43200);

  expect($(`#${TEST_INPUT}`).val()).toEqual("12:00pm");

  $(`#${TEST_INPUT}`).timepicker("setTime", "11pm");
  expect($(`#${TEST_INPUT}`).val()).toEqual("11:00pm");

  $(`#${TEST_INPUT}`).timepicker(
    "setTime",
    new Date("December 17, 1995 03:24:00")
  );
  expect($(`#${TEST_INPUT}`).val()).toEqual("3:24am");
});

test("showDuration works", () => {
  $(`#${TEST_INPUT}`).val("2:00pm");
  $(`#${TEST_INPUT}`).timepicker({
    showDuration: true,
    durationTime: "2:00pm"
  });
  $(`#${TEST_INPUT}`).timepicker("show");
});

test("disableTextInput works", () => {
  $(`#${TEST_INPUT}`).val("2:00pm");
  $(`#${TEST_INPUT}`).timepicker({ disableTextInput: true });
  const event = new KeyboardEvent("keydown", { keyCode: 37 });
  $(`#${TEST_INPUT}`)
    .get(0)
    .dispatchEvent(event);
});

test("option works", () => {
  $(`#${TEST_INPUT}`).timepicker({ disableTextInput: true });
  expect($(`#${TEST_INPUT}`).timepicker("option", "disableTextInput")).toEqual(
    true
  );

  $(`#${TEST_INPUT}`).timepicker("option", { disableTextInput: false });
  expect($(`#${TEST_INPUT}`).timepicker("option", "disableTextInput")).toEqual(
    false
  );
});
