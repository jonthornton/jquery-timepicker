import Timepicker from "../timepicker/index.js";

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
