import { ONE_DAY } from "./constants";
import { moduloSeconds, timeWindow } from "./rounding";

function _getNoneOptionItems(settings) {
  if (!settings.noneOption) {
    return [];
  }

  const noneOptions = _getNoneOptionItemsHelper(settings.noneOption);

  if (Array.isArray(settings.noneOption)) {
    return noneOptions;
  } else {
    return [noneOptions];
  }
}

function _getNoneOptionItemsHelper(noneOption) {
  if (Array.isArray(noneOption)) {
    return noneOption.map(_getNoneOptionItemsHelper);
  }

  if (noneOption === true) {
    return {
      label: "None",
      value: ""
    };
  }

  if (typeof noneOption === "object") {
    return noneOption;
  }

  return {
    label: noneOption,
    value: ""
  };
}

function _getDropdownTimes(tp) {
  const settings = tp.settings;

  const { start, end } = timeWindow(settings);

  const output = [];

  for (var i = start, j = 0; i <= end; j++, i += settings.step(j) * 60) {
    var timeInt = i;
    const timeString = tp._int2time(timeInt);

    const className =
      timeInt % ONE_DAY < ONE_DAY / 2 ? "ui-timepicker-am" : "ui-timepicker-pm";

    const item = {
      label: timeString,
      value: moduloSeconds(timeInt, settings),
      className: className
    };

    if (
      (settings.minTime() !== null || settings.durationTime() !== null) &&
      settings.showDuration
    ) {
      let durStart = settings.durationTime() ?? settings.minTime();
      if (durStart > i) {
        durStart -= ONE_DAY;
      }

      const durationString = tp._int2duration(i - durStart, settings.step());
      item.duration = durationString;
    }

    // item.value keeps 24:00 as 86400 rather than wrapping it to midnight
    for (const range of settings.disableTimeRanges) {
      if (item.value >= range[0] && item.value < range[1]) {
        item.disabled = true;
        break;
      }
    }

    output.push(item);
  }

  return output;
}

function _renderSelectItem(item) {
  const el = document.createElement("option");

  el.value = item.value ?? item.label;

  if (item.duration) {
    el.appendChild(
      document.createTextNode(item.label + " (" + item.duration + ")")
    );
  } else {
    el.appendChild(document.createTextNode(item.label));
  }

  if (item.disabled) {
    el.disabled = true;
  }

  return el;
}

function _renderStandardItem(item) {
  const el = document.createElement("li");
  el.dataset["time"] = item.value;

  if (item.className) {
    el.classList.add(item.className);
  }
  el.className = item.className;
  el.appendChild(document.createTextNode(item.label));

  if (item.duration) {
    const durationEl = document.createElement("span");
    durationEl.appendChild(document.createTextNode("(" + item.duration + ")"));
    durationEl.classList.add("ui-timepicker-duration");
    el.appendChild(durationEl);
  }

  if (item.disabled) {
    el.classList.add("ui-timepicker-disabled");
  }

  return el;
}

function _renderStandardList(items) {
  const list = document.createElement("ul");
  list.classList.add("ui-timepicker-list");

  for (const item of items) {
    const itemEl = _renderStandardItem(item);
    list.appendChild(itemEl);
  }

  const wrapper = document.createElement("div");
  wrapper.classList.add("ui-timepicker-wrapper");
  wrapper.tabIndex = -1;
  wrapper.style.display = "none";
  wrapper.style.position = "absolute";

  wrapper.appendChild(list);

  return wrapper;
}

function _renderSelectList(items, targetName) {
  const el = document.createElement("select");
  el.classList.add("ui-timepicker-select");

  if (targetName) {
    el.name = "ui-timepicker-" + targetName;
  }

  for (const item of items) {
    const itemEl = _renderSelectItem(item);
    el.appendChild(itemEl);
  }

  return el;
}

function renderHtml(tp) {
  const items = [].concat(
    _getNoneOptionItems(tp.settings),
    _getDropdownTimes(tp)
  );

  let el;
  if (tp.settings.useSelect) {
    el = _renderSelectList(items, tp.targetEl.name);
  } else {
    el = _renderStandardList(items);
  }

  if (tp.settings.className) {
    for (const token of tp.settings.className.split(" ")) {
      el.classList.add(token);
    }
  }

  if (
    tp.settings.showDuration &&
    (tp.settings.minTime !== null || tp.settings.durationTime !== null)
  ) {
    el.classList.add("ui-timepicker-with-duration");
    el.classList.add("ui-timepicker-step-" + tp.settings.step());
  }

  return el;
}

export default renderHtml;
