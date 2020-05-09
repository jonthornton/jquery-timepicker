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
  $(`#${TEST_INPUT}`).timepicker({ 'disableTimeRanges': null });
});
