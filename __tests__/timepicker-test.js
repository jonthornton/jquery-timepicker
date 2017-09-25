jest.dontMock("jquery").dontMock("../jquery.timepicker");

const $ = require("jquery");
require("../jquery.timepicker");

const TEST_INPUT = "testInput";

beforeEach(() => {
  document.body.innerHTML = `<input type="text" id="${TEST_INPUT}" />`;
});

test("timepicker initializes", () => {
  $(`#${TEST_INPUT}`).timepicker();
});
