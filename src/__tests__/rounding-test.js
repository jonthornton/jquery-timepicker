import Timepicker from "../timepicker/index.js";
import { roundingFunction } from "../timepicker/rounding.js";

const TEST_INPUT = "testInput";

function createIntput() {
  document.body.innerHTML = `<div>
      <input type="text" id="${TEST_INPUT}" />
    </div>`;

  return document.getElementById(TEST_INPUT);
}

test("roundingFunction handles defaults", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  const rounded = roundingFunction(23, tp.settings);
  expect(rounded).toEqual(0);
});

test("roundingFunction handles dynamic step", () => {
  const el = createIntput();
  const tp = new Timepicker(el, {
    step: function (i) {
      return i % 2 ? 15 : 45;
    }
  });

  const rounded = roundingFunction(47700, tp.settings);

  expect(rounded).toEqual(47700);
});

test("roundingFunction counts steps from minTime", () => {
  const el = createIntput();
  const tp = new Timepicker(el, { minTime: "00:04", step: 5 });

  expect(roundingFunction(9 * 60, tp.settings)).toEqual(9 * 60);
  expect(roundingFunction(11 * 60, tp.settings)).toEqual(9 * 60);
  expect(roundingFunction(12 * 60, tp.settings)).toEqual(14 * 60);
});

test("roundingFunction handles times before minTime in a wrapped list", () => {
  const el = createIntput();
  const tp = new Timepicker(el, {
    minTime: "10:05pm",
    maxTime: "2:05am",
    step: 30
  });

  expect(roundingFunction(3600 + 40 * 60, tp.settings)).toEqual(3600 + 35 * 60);
});
