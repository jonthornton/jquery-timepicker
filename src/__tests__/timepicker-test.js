jest.dontMock("jquery").dontMock("../jquery.timepicker");

import jQuery from 'jquery';
require('../jquery.timepicker');

const TEST_INPUT = "testInput";

beforeEach(() => {
  document.body.innerHTML = `<input type="text" id="${TEST_INPUT}" />`;
  jQuery(`#${TEST_INPUT}`).get(0).dataset = {}
});

test("timepicker initializes", () => {
  jQuery(`#${TEST_INPUT}`).timepicker();
});

test("show single string noneOption correctly", () =>{
  jQuery(`#${TEST_INPUT}`).timepicker({
    "noneOption": "----"
  }).timepicker('show');

  jQuery('.ui-timepicker-list li:first-child').trigger('click');


  expect(jQuery(`#${TEST_INPUT}`).val()).toEqual('');
});

test("timepicker can parse time value", () => {
  jQuery(`#${TEST_INPUT}`).val('2:37pm');
  jQuery(`#${TEST_INPUT}`).timepicker();

  const expectedSecondsFromMidnight = 14 * 3600 + 37 * 60;
  expect(jQuery(`#${TEST_INPUT}`).timepicker('getSecondsFromMidnight')).toEqual(expectedSecondsFromMidnight);
});
