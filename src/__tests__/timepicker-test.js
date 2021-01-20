import Timepicker from "../timepicker/index.js";
import { _expectThrewEvent } from '../testHelpers.js'

const TEST_INPUT = "testInput";

// beforeEach(() => {
//   document.body.innerHTML = `<div>
//       <input type="text" id="${TEST_INPUT}" />
//     </div>`;
// });

function createIntput() {
  document.body.innerHTML = `<div>
	    <input type="text" id="${TEST_INPUT}" />
	  </div>`;

  return document.getElementById(TEST_INPUT);
}

test("time2int works", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  expect(tp.time2int("00")).toEqual(0);
  expect(tp.time2int("12:00")).toEqual(43200);
  expect(tp.time2int("12:0")).toEqual(43200);
  expect(tp.time2int("130")).toEqual(5400);
  expect(tp.time2int("2430")).toEqual(1800);

});

test("int2duration works", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  expect(tp._int2duration(5400, 15)).toEqual("1 hr 30 mins");
  expect(tp._int2duration(5400, 30)).toEqual("1.5 hrs");
});

test("_int2time works", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  expect(tp._int2time(0)).toEqual("12:00am");
  expect(tp._int2time(7200)).toEqual("2:00am");
});

test("_roundAndFormatTime works", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  expect(tp._roundAndFormatTime(5)).toEqual("12:00am");
  expect(tp._roundAndFormatTime(7100)).toEqual("2:00am");
});

test("_findRow works", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  // todo: finish this test after moving show method
  // tp.show();
});

test("_formatValue works", () => {
  const el = createIntput();

  const tp = new Timepicker(el, {
    minTime: '1am',
    maxTime: '23:00',
    disableTimeRanges: [
      ['3am', '4am']
    ]
  });

  el.value = '1';
  tp._formatValue();
  expect(el.value).toEqual("1:00am");

  el.value = '3am';
  el.dispatchEvent = jest.fn();
  tp._formatValue();
  expect(el.value).toEqual("3:00am");
  _expectThrewEvent(el.dispatchEvent.mock, 'timeRangeError');

  el.value = '12:30am';
  el.dispatchEvent = jest.fn();
  tp._formatValue();
  expect(el.value).toEqual("12:30am");
  _expectThrewEvent(el.dispatchEvent.mock, 'timeRangeError');
  // todo: learn how to check if timeRangeError event was thrown

  el.value = 'abc';
  el.dispatchEvent = jest.fn();
  tp._formatValue();
  expect(el.value).toEqual("abc");
  _expectThrewEvent(el.dispatchEvent.mock, 'timeFormatError');
  // todo: learn how to check if timeFormatError event was thrown
});