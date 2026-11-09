jest.dontMock("jquery").dontMock("../jquery.timepicker");

import $ from "jquery";
import { _expectThrewEvent, _expectDidntThrowEvent } from "../testHelpers.js";
require("../jquery.timepicker");

const TEST_INPUT = "testInput";
let el = "";

beforeEach(() => {
  document.body.innerHTML = `<div>
      <input type="text" id="${TEST_INPUT}" />
    </div>`;

  el = document.getElementById(TEST_INPUT);
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

  $(el).timepicker("setTime", new Date("December 17, 1995 03:24:00"));
  expect($(el).val()).toEqual("3:24am");
});

test("setTime selects 24:00 from a string with show2400", () => {
  $(el).timepicker({
    timeFormat: "H:i",
    minTime: "00:30",
    maxTime: "24:00",
    step: 30,
    show2400: true
  });
  $(el).timepicker("show");

  $(el).timepicker("setTime", "24:00");

  expect($(el).val()).toEqual("24:00");
  expect($(".ui-timepicker-selected").text()).toEqual("24:00");
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
  $(el).get(0).dispatchEvent(event);
});

test("useSelect doesn't crash", () => {
  $(el).val("2:00pm");
  $(el).timepicker({ useSelect: true });
});

// GH-794
test("useSelect keeps the initial value", () => {
  $(el).val("2:30pm");
  $(el).timepicker({ useSelect: true });

  expect($(el).val()).toEqual("2:30pm");
  expect($(".ui-timepicker-select option:selected").text()).toEqual("2:30pm");
});

test("useSelect setTime updates the select", () => {
  $(el).timepicker({ useSelect: true });
  $(el).timepicker("setTime", "3:00pm");

  expect($(el).val()).toEqual("3:00pm");
  expect($(".ui-timepicker-select option:selected").text()).toEqual("3:00pm");
});

test("useSelect picking an option sets a formatted time", () => {
  $(el).timepicker({ useSelect: true });

  const select = $(".ui-timepicker-select");
  select.val(select.find("option:contains('3:00pm')").val()).trigger("change");

  expect($(el).val()).toEqual("3:00pm");
});

// GH-795
test("useSelect moves required validation to the visible select", () => {
  document.body.innerHTML = `<form>
      <input type="text" id="${TEST_INPUT}" required />
    </form>`;
  el = document.getElementById(TEST_INPUT);

  $(el).timepicker({ useSelect: true, noneOption: true });

  // the hidden input can't show a validation message, so it must not be
  // what blocks the form
  const form = el.form;
  const invalid = Array.from(form.querySelectorAll(":invalid"));
  expect(form.checkValidity()).toBe(false);
  expect(invalid.map(e => e.className)).toEqual(["ui-timepicker-select"]);

  // re-rendering must not lose track of it
  $(el).timepicker("option", "step", 15);
  expect($(".ui-timepicker-select").prop("required")).toBe(true);
});

// GH-795
test("useSelect keeps an initial value that isn't in the list", () => {
  $(el).val("8:00am");
  $(el).timepicker({ useSelect: true, minTime: "9am", maxTime: "5pm" });

  expect($(el).val()).toEqual("8:00am");
  expect($(".ui-timepicker-select").val()).toBeNull();

  // re-rendering must not drop it either
  $(el).timepicker("option", "step", 15);
  expect($(el).val()).toEqual("8:00am");
});

// GH-795
test.each([
  ["without minTime", {}],
  ["with minTime", { minTime: "9am" }]
])("useSelect leaves an empty initial value empty %s", (_, options) => {
  $(el).timepicker({ useSelect: true, ...options });

  expect($(el).val()).toEqual("");
  expect($(".ui-timepicker-select").prop("selectedIndex")).toEqual(-1);

  // re-rendering must not pick a time either
  $(el).timepicker("option", "step", 15);
  expect($(el).val()).toEqual("");
  expect($(".ui-timepicker-select").prop("selectedIndex")).toEqual(-1);
});

// GH-795
test("useSelect selects the noneOption for an empty initial value", () => {
  $(el).timepicker({ useSelect: true, noneOption: "----" });

  expect($(el).val()).toEqual("");
  expect($(".ui-timepicker-select option:selected").text()).toEqual("----");
});

// GH-795
test("useSelect with no selection blocks a required form", () => {
  document.body.innerHTML = `<form>
      <input type="text" id="${TEST_INPUT}" required />
    </form>`;
  el = document.getElementById(TEST_INPUT);

  $(el).timepicker({ useSelect: true });

  expect(el.form.checkValidity()).toBe(false);
});

test("remove restores required on a useSelect input", () => {
  el.required = true;
  $(el).timepicker({ useSelect: true });
  $(el).timepicker("remove");

  expect(el.required).toBe(true);
});

test("useSelect doesn't add required to an optional input", () => {
  $(el).timepicker({ useSelect: true });

  expect($(".ui-timepicker-select").prop("required")).toBe(false);
  expect(el.required).toBe(false);
});

test("option works", () => {
  $(el).timepicker({ disableTextInput: true });
  expect($(el).timepicker("option", "disableTextInput")).toEqual(true);

  $(el).timepicker("option", { disableTextInput: false });
  expect($(el).timepicker("option", "disableTextInput")).toEqual(false);
});

test("selecting throws a change event", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({});
  const initialValue = $(el).val();

  $(el).timepicker("show");
  $(".ui-timepicker-list li:first-child").trigger("click");
  const afterValue = $(el).val();

  expect(initialValue).not.toEqual(afterValue);
  _expectThrewEvent(el.dispatchEvent.mock, "change");
});

test("setTime doesn't throw a change event", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({});
  $(el).timepicker("setTime", "3pm");
  $(el).timepicker("setTime", "4pm");
  expect($(el).val()).toEqual("4:00pm");

  _expectDidntThrowEvent(el.dispatchEvent.mock, "change");
});

test("setTime without minTime or maxTime doesn't fire timeRangeError", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({});
  $(el).timepicker("setTime", "3pm");

  _expectDidntThrowEvent(el.dispatchEvent.mock, "timeRangeError");
});

test("setTime can't set a disabled time", () => {
  el.dispatchEvent = jest.fn();

  $(el).timepicker({ disableTimeRanges: [["1:00pm", "5:00pm"]] });
  $(el).timepicker("setTime", "2pm");

  _expectThrewEvent(el.dispatchEvent.mock, "timeRangeError");
});

// jQuery 4 reimplemented focus/blur on top of the native events, and the
// plugin opens on focus by default (showOn: ["click", "focus"]), so these
// cover the paths most likely to break across jQuery majors.
//
// Timepicker.isVisible reads offsetWidth/offsetHeight, which jsdom always
// reports as 0. Without this shim every assertion below passes vacuously.
function withLayout(fn) {
  const props = ["offsetWidth", "offsetHeight"];
  const saved = props.map(p =>
    Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, p)
  );

  props.forEach(p =>
    Object.defineProperty(window.HTMLElement.prototype, p, {
      configurable: true,
      get() {
        if (!this.isConnected) return 0;
        for (let n = this; n && n.style; n = n.parentElement) {
          if (n.style.display === "none") return 0;
        }
        return 100;
      }
    })
  );

  try {
    fn();
  } finally {
    props.forEach((p, i) =>
      saved[i]
        ? Object.defineProperty(window.HTMLElement.prototype, p, saved[i])
        : delete window.HTMLElement.prototype[p]
    );
  }
}

test("layout shim makes isVisible observable", () => {
  $(el).timepicker();
  withLayout(() => {
    $(el).timepicker("show");
    expect($(el).timepicker("isVisible")).toEqual(true);
  });
});

test("opens on native focus", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    el.focus();
    expect($(el).timepicker("isVisible")).toEqual(true);
  });
});

test("opens on click", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    $(el).trigger("click");
    expect($(el).timepicker("isVisible")).toEqual(true);
  });
});

test("escape and enter close the dropdown", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });

    $(el).timepicker("show");
    $(el).trigger($.Event("keydown", { keyCode: 27, which: 27 }));
    expect($(el).timepicker("isVisible")).toEqual(false);

    $(el).timepicker("show");
    $(el).trigger($.Event("keydown", { keyCode: 13, which: 13 }));
    expect($(el).timepicker("isVisible")).toEqual(false);
  });
});

test("hide closes an open dropdown", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    $(el).timepicker("show");
    $(el).timepicker("hide");
    expect($(el).timepicker("isVisible")).toEqual(false);
  });
});

test("remove tears down plugin state", () => {
  $(el).timepicker();
  $(el).timepicker("remove");
  expect($(el).data("timepicker-obj")).toBeFalsy();
});

test("12-hour format with an am/pm-less minTime renders a list", () => {
  $(el).timepicker({
    timeFormat: "g:i A",
    minTime: "10:30:00",
    maxTime: "17:00:00",
    step: 30
  });
  $(el).timepicker("show");

  expect($(".ui-timepicker-list li:first-child").text()).toEqual("10:30 AM");
  expect($(".ui-timepicker-list li:last-child").text()).toEqual("5:00 PM");
});

// https://github.com/jonthornton/jquery-timepicker/issues/796
test("selected time is highlighted when minTime is offset from the step", () => {
  $(el).timepicker({ minTime: "00:04", maxTime: "23:59", step: 5 });
  $(el).timepicker("show");

  const option = $(".ui-timepicker-list li").eq(1);
  expect(option.text()).toEqual("12:09am");
  option.trigger("click");
  expect($(el).val()).toEqual("12:09am");

  $(el).timepicker("show");
  expect($(".ui-timepicker-list li.ui-timepicker-selected").text()).toEqual(
    "12:09am"
  );
});

// a real click is mousedown, mouseup, then click
function realClick(target) {
  target.trigger("mousedown");
  target.trigger("mouseup");
  target.trigger("click");
}

function recordEvents(names) {
  const log = [];
  names.forEach(name => $(el).on(name, () => log.push(name)));
  return log;
}

// https://github.com/jonthornton/jquery-timepicker/issues/677
test("clicking a time fires each event once", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    const log = recordEvents(["selectTime", "changeTime", "hideTimepicker"]);

    $(el).timepicker("show");
    realClick($(".ui-timepicker-list li").eq(3));

    expect(log).toEqual(["selectTime", "changeTime", "hideTimepicker"]);
  });
});

// https://github.com/jonthornton/jquery-timepicker/issues/650
test("hideTimepicker fires after the dropdown is hidden", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    const visibleOnHide = [];
    $(el).on("hideTimepicker", () =>
      visibleOnHide.push($(el).timepicker("isVisible"))
    );

    $(el).timepicker("show");
    realClick($(".ui-timepicker-list li").eq(3));

    expect(visibleOnHide).toEqual([false]);
  });
});

// https://github.com/jonthornton/jquery-timepicker/issues/650
test("pressing on a time and releasing elsewhere doesn't select it", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    const visibleOnHide = [];
    $(el).on("hideTimepicker", () =>
      visibleOnHide.push($(el).timepicker("isVisible"))
    );

    $(el).timepicker("show");
    $(".ui-timepicker-list li").eq(3).trigger("mousedown");

    expect($(el).val()).toEqual("");
    expect($(el).timepicker("isVisible")).toEqual(true);
    expect(visibleOnHide).toEqual([]);
  });
});

// Android keyboards report keyCode 229 for every key, so the value change is
// the only reliable signal: keydown, value update, input, keyup
function androidType(value) {
  $(el).trigger($.Event("keydown", { keyCode: 229, which: 229 }));
  el.value = value;
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
  $(el).trigger($.Event("keyup", { keyCode: 229, which: 229 }));
}

// https://github.com/jonthornton/jquery-timepicker/issues/665
test("typeahead highlights a time typed on an Android keyboard", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    $(el).timepicker("show");

    androidType("1pm");

    expect($(".ui-timepicker-list li.ui-timepicker-selected").text()).toEqual(
      "1:00pm"
    );
  });
});

test("typing hides the list when typeaheadHighlight is off", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60, typeaheadHighlight: false });
    $(el).timepicker("show");

    androidType("1pm");

    expect($(el).timepicker("isVisible")).toEqual(false);
  });
});

test("pasting a time highlights it", () => {
  withLayout(() => {
    $(el).timepicker({ step: 60 });
    $(el).timepicker("show");

    el.value = "3pm";
    el.dispatchEvent(new window.Event("input", { bubbles: true }));

    expect($(".ui-timepicker-list li.ui-timepicker-selected").text()).toEqual(
      "3:00pm"
    );
  });
});

// https://github.com/jonthornton/jquery-timepicker/issues/763
describe("accessibility", () => {
  const activeRow = () =>
    document.getElementById(el.getAttribute("aria-activedescendant"));
  const key = keyCode =>
    $(el).trigger($.Event("keydown", { keyCode: keyCode, which: keyCode }));

  test("renders the combobox pattern", () => {
    $(el).timepicker({ step: 60, disableTimeRanges: [["1am", "2am"]] });
    expect(el.getAttribute("role")).toEqual("combobox");
    expect(el.getAttribute("aria-expanded")).toEqual("false");

    $(el).timepicker("show");
    const list = $(".ui-timepicker-list");
    expect(list.attr("role")).toEqual("listbox");
    expect(el.getAttribute("aria-controls")).toEqual(list.attr("id"));

    const rows = list.find("li");
    expect(rows.eq(0).attr("role")).toEqual("option");
    expect(rows.eq(0).attr("id")).toEqual(list.attr("id") + "-0");
    expect(rows.eq(1).attr("aria-disabled")).toEqual("true");
    expect(rows.eq(0).attr("aria-disabled")).toBeUndefined();
  });

  test("each timepicker gets its own ids", () => {
    document.body.innerHTML = `<input id="a" /><input id="b" />`;
    $("#a, #b").timepicker();
    $("#a").timepicker("show");
    $("#b").timepicker("show");

    const ids = $(".ui-timepicker-list")
      .map((i, list) => list.id)
      .get();
    expect(ids.length).toEqual(2);
    expect(ids[0]).not.toEqual(ids[1]);
  });

  test("aria-expanded follows the dropdown", () => {
    withLayout(() => {
      $(el).timepicker({ step: 60 });

      $(el).timepicker("show");
      expect(el.getAttribute("aria-expanded")).toEqual("true");
      key(27);
      expect(el.getAttribute("aria-expanded")).toEqual("false");

      $(el).timepicker("show");
      realClick($(".ui-timepicker-list li").eq(3));
      expect(el.getAttribute("aria-expanded")).toEqual("false");

      $(el).timepicker("option", "typeaheadHighlight", false);
      $(el).timepicker("show");
      androidType("1pm");
      expect(el.getAttribute("aria-expanded")).toEqual("false");
    });
  });

  test("aria-activedescendant points at the highlighted row", () => {
    withLayout(() => {
      $(el).timepicker({ step: 60 });
      $(el).timepicker("show");
      expect(el.hasAttribute("aria-activedescendant")).toBe(false);

      androidType("3pm");
      expect(activeRow().textContent).toEqual("3:00pm");
      expect(activeRow().getAttribute("aria-selected")).toEqual("true");

      key(40);
      expect(activeRow().textContent).toEqual("4:00pm");
      expect($("[aria-selected]").length).toEqual(1);

      key(27);
      expect(el.hasAttribute("aria-activedescendant")).toBe(false);
      expect($("[aria-selected]").length).toEqual(0);
    });
  });

  test("first arrow press highlights the input's time", () => {
    withLayout(() => {
      $(el).val("2:30pm");
      $(el).timepicker({ step: 60 });
      $(el).timepicker("show");
      expect(el.hasAttribute("aria-activedescendant")).toBe(false);

      key(40);
      expect(activeRow().textContent).toEqual("3:00pm");
    });
  });

  test("first arrow press falls back to scrollDefault", () => {
    withLayout(() => {
      $(el).timepicker({ step: 60, scrollDefault: "9am" });
      $(el).timepicker("show");

      key(38);
      expect(activeRow().textContent).toEqual("9:00am");
    });
  });

  test("the listbox is named by the input's label", () => {
    document.body.innerHTML = `
      <label id="start-label" for="start">Start</label><input id="start" />
      <label for="end">End</label><input id="end" />`;
    $("#start, #end").timepicker();

    $("#start").timepicker("show");
    expect($(".ui-timepicker-list").attr("aria-labelledby")).toEqual(
      "start-label"
    );

    $("#end").timepicker("show");
    const endLabel = $("label[for=end]");
    expect(endLabel.attr("id")).toBeTruthy();
    expect(
      $("#" + $("#end").attr("aria-controls")).attr("aria-labelledby")
    ).toEqual(endLabel.attr("id"));

    $("#start").timepicker("remove");
    $("#end").timepicker("remove");
    expect($("#start-label").length).toEqual(1);
    expect(endLabel.attr("id")).toBeUndefined();
  });

  test("an unlabelled input leaves the listbox unnamed", () => {
    $(el).timepicker();
    $(el).timepicker("show");
    expect($(".ui-timepicker-list").attr("aria-labelledby")).toBeUndefined();
  });

  test("remove strips the ARIA attributes", () => {
    withLayout(() => {
      $(el).timepicker({ step: 60 });
      $(el).timepicker("show");
      androidType("3pm");
      $(el).timepicker("remove");

      for (const attr of [
        "role",
        "aria-expanded",
        "aria-controls",
        "aria-activedescendant"
      ]) {
        expect(el.hasAttribute(attr)).toBe(false);
      }
    });
  });

  test("useSelect gets no combobox attributes", () => {
    $(el).timepicker({ useSelect: true });
    expect(el.hasAttribute("role")).toBe(false);
  });
});
