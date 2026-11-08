import Timepicker from "../timepicker/index.js";
import { _expectThrewEvent, _expectDidntThrowEvent } from "../testHelpers.js";

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

test("time2int supports localization", () => {
  const el = createIntput();
  const tp = new Timepicker(el, {
    lang: {
      am: "pap",
      AM: "pap",
      pm: "pop",
      PM: "pop"
    }
  });

  expect(tp.time2int("1pop")).toEqual(46800);
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
    minTime: "1am",
    maxTime: "23:00",
    disableTimeRanges: [["3am", "4am"]]
  });

  el.value = "1";
  tp._formatValue();
  expect(el.value).toEqual("1:00am");

  el.value = "3am";
  el.dispatchEvent = jest.fn();
  tp._formatValue();
  expect(el.value).toEqual("3:00am");
  _expectThrewEvent(el.dispatchEvent.mock, "timeRangeError");

  el.value = "12:30am";
  el.dispatchEvent = jest.fn();
  tp._formatValue();
  expect(el.value).toEqual("12:30am");
  _expectThrewEvent(el.dispatchEvent.mock, "timeRangeError");
  // todo: learn how to check if timeRangeError event was thrown

  el.value = "abc";
  el.dispatchEvent = jest.fn();
  tp._formatValue();
  expect(el.value).toEqual("abc");
  _expectThrewEvent(el.dispatchEvent.mock, "timeFormatError");
  // todo: learn how to check if timeFormatError event was thrown
});

function _expectRangeError(tp, value, expected) {
  tp.targetEl.value = value;
  tp.targetEl.dispatchEvent = jest.fn();
  tp._formatValue();

  if (expected) {
    _expectThrewEvent(tp.targetEl.dispatchEvent.mock, "timeRangeError");
  } else {
    _expectDidntThrowEvent(tp.targetEl.dispatchEvent.mock, "timeRangeError");
  }
}

test("timeRangeError doesn't fire without minTime or maxTime", () => {
  const tp = new Timepicker(createIntput());

  _expectRangeError(tp, "12:00am", false);
  _expectRangeError(tp, "12:01am", false);
  _expectRangeError(tp, "3pm", false);
  _expectRangeError(tp, "11:59pm", false);
});

test("timeRangeError includes the minTime and maxTime boundaries", () => {
  const tp = new Timepicker(createIntput(), {
    minTime: "9am",
    maxTime: "5pm"
  });

  _expectRangeError(tp, "9am", false);
  _expectRangeError(tp, "5pm", false);
  _expectRangeError(tp, "8:59am", true);
  _expectRangeError(tp, "5:01pm", true);
});

test("timeRangeError with only maxTime set uses the default minTime", () => {
  const tp = new Timepicker(createIntput(), { maxTime: "5pm" });

  _expectRangeError(tp, "12:00am", false);
  _expectRangeError(tp, "4pm", false);
  _expectRangeError(tp, "6pm", true);
});

test("timeRangeError with only minTime set allows the following 24 hours", () => {
  const tp = new Timepicker(createIntput(), { minTime: "2pm" });

  _expectRangeError(tp, "2pm", false);
  _expectRangeError(tp, "11pm", false);
  _expectRangeError(tp, "1pm", false);
});

test("timeRangeError allows ranges that wrap past midnight", () => {
  const tp = new Timepicker(createIntput(), {
    minTime: "10pm",
    maxTime: "2am"
  });

  _expectRangeError(tp, "10pm", false);
  _expectRangeError(tp, "11:30pm", false);
  _expectRangeError(tp, "1am", false);
  _expectRangeError(tp, "2am", false);
  _expectRangeError(tp, "3am", true);
  _expectRangeError(tp, "9pm", true);
});

test("timeRangeError allows 24:00 with show2400", () => {
  const tp = new Timepicker(createIntput(), {
    timeFormat: "H:i",
    show2400: true
  });

  _expectRangeError(tp, "24:00", false);
});

test("12-hour time with an am/pm-less minTime doesn't recurse", () => {
  const el = createIntput();

  const tp = new Timepicker(el, {
    timeFormat: "g:i A",
    minTime: "10:30:00",
    maxTime: "17:00:00",
    step: 30
  });

  // minTime doubles as the default scrollDefault, so parsing it used to ask
  // scrollDefault for an am/pm hint and loop forever
  expect(tp.settings.minTime()).toEqual(37800);
  expect(tp.settings.scrollDefault()).toEqual(37800);

  // an explicit scrollDefault is just as self-referential
  const tp2 = new Timepicker(el, {
    timeFormat: "g:i A",
    scrollDefault: "11:00"
  });

  expect(tp2.settings.scrollDefault()).toEqual(39600);
});

test("12-hour time still guesses am/pm from the scrollDefault", () => {
  const el = createIntput();

  const tp = new Timepicker(el, {
    timeFormat: "g:i A",
    minTime: "10:30:00"
  });

  expect(tp.time2int("11")).toEqual(39600); // 11am, after the scrollDefault
  expect(tp.time2int("9:00")).toEqual(75600); // 9pm, before it
});
