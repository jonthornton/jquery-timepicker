import Timepicker from "../timepicker/index.js";
import renderHtml from "../timepicker/render.js";
import { _expectThrewEvent } from "../testHelpers.js";

const TEST_INPUT = "testInput";

function createIntput() {
  document.body.innerHTML = `<div>
	    <input type="text" id="${TEST_INPUT}" />
	  </div>`;

  return document.getElementById(TEST_INPUT);
}

test("render doesn't crash", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  const list = renderHtml(tp);
});

test("className works", () => {
  const el = createIntput();
  const tp = new Timepicker(el, {
    className: "foo"
  });

  const list = renderHtml(tp);
  expect(list.className).toEqual("ui-timepicker-wrapper foo");

  const el2 = createIntput();
  const tp2 = new Timepicker(el2, {
    className: "foo bar"
  });

  const list2 = renderHtml(tp2);
  expect(list2.className).toEqual("ui-timepicker-wrapper foo bar");
});

test("noneOption works", () => {
  const el = createIntput();
  const tp = new Timepicker(el, {
    noneOption: [
      {
        label: "Foobar",
        className: "shibby",
        value: "oh hai"
      },
      "Foobar2"
    ]
  });

  const list = renderHtml(tp);

  const firstNoneOption = list.children[0].children[0];
  const secondNoneOption = list.children[0].children[1];

  expect(firstNoneOption.innerHTML).toEqual("Foobar");
  expect(firstNoneOption.dataset["time"]).toEqual("oh hai");
  expect(firstNoneOption.classList.contains("shibby")).toEqual(true);

  expect(secondNoneOption.innerHTML).toEqual("Foobar2");
  expect(secondNoneOption.dataset["time"]).toEqual("");
  expect(secondNoneOption.classList.contains("shibby")).toEqual(false);
});

test("disableTimeRanges treats 24:00 apart from midnight", () => {
  const disabledTimes = options => {
    const tp = new Timepicker(createIntput(), {
      timeFormat: "H:i",
      step: 60,
      ...options
    });
    const items = renderHtml(tp).querySelectorAll("li.ui-timepicker-disabled");
    return Array.from(items, li => li.textContent);
  };

  // a range starting at midnight leaves 24:00 enabled
  expect(
    disabledTimes({ show2400: true, disableTimeRanges: [["0:00", "1:00"]] })
  ).toEqual(["00:00"]);

  // ends are exclusive, so a range has to end past 24:00 to cover it
  expect(
    disabledTimes({ show2400: true, disableTimeRanges: [["23:00", 86401]] })
  ).toEqual(["23:00", "24:00"]);

  // rows past midnight in a wrapping list still match next-day ranges
  expect(
    disabledTimes({
      minTime: "22:00",
      maxTime: "3:00",
      disableTimeRanges: [["1:00", "2:00"]]
    })
  ).toEqual(["01:00"]);
});
