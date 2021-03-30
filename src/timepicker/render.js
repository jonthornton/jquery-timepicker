import { ONE_DAY } from "./constants";
import { moduloSeconds } from "./rounding";

function _getNoneOptionItems(settings) {
  if (!settings.noneOption) {
    return []
  }

  if (settings.noneOption === true) {
    return [{
      'label': 'None',
      'value': ''
    }];
  }

  if (Array.isArray(settings.noneOption)) {
    const output = [];
    for (const item of settings.noneOption) {
      output.push({
        'label': item,
        'value': ''
      })
    }

    return output;
  }

  if (typeof settings.noneOption === 'object') {
    return [settings.noneOption];
  }

  if (typeof settings.noneOption === 'string') {
    return [{
      'label': settings.noneOption,
      'value': ''
    }]
  }
}

function _getDropdownTimes(tp) {
  const settings = tp.settings;

  const start = settings.minTime() ?? 0;
  let end = settings.maxTime() ?? start + ONE_DAY - 1;

  if (end < start) {
    // make sure the end time is greater than start time, otherwise there will be no list to show
    end += ONE_DAY;
  }

  if (
    end === ONE_DAY - 1 &&
    typeof settings.timeFormat === 'string' &&
    settings.show2400
  ) {
    // show a 24:00 option when using military time
    end = ONE_DAY;
  }

  const dr = settings.disableTimeRanges;
  let drCur = 0;
  const output = [];

  for (var i = start, j = 0; i <= end; j++, i += settings.step(j) * 60) {
    var timeInt = i;
    const timeString = tp._int2time(timeInt);

    const className = timeInt % ONE_DAY < ONE_DAY / 2
          ? 'ui-timepicker-am'
          : 'ui-timepicker-pm';

    const item = {
      'label': timeString,
      'value': moduloSeconds(timeInt, settings),
      'className': className
    }

    if (
      (settings.minTime() !== null || settings.durationTime() !== null) &&
      settings.showDuration
    ) {
      const durStart = settings.durationTime() ?? settings.minTime();
      const durationString = tp._int2duration(i - durStart, settings.step());
      item.duration = durationString;
    }

    if (drCur < dr.length) {
      if (timeInt >= dr[drCur][1]) {
        drCur += 1;
      }

      if (dr[drCur] && timeInt >= dr[drCur][0] && timeInt < dr[drCur][1]) {
        item.disabled = true;
      }
    }

    output.push(item);
  }

  return output;
}

function _renderSelectItem(item) {
  const el = document.createElement('option');
  
  el.value = item.label;

  if (item.duration) {
    el.appendChild(document.createTextNode(item.label + ' (' + item.duration + ')'));
  } else {
    el.appendChild(document.createTextNode(item.label));
  }

  if (item.disabled) {
    el.disabled = true;
  }

  return el;
}

function _renderStandardItem(item) {
  const el = document.createElement('li');
  el.dataset['time'] = item.value;
  el.className = item.className;
  el.appendChild(document.createTextNode(item.label));

  if (item.duration) {
    const durationEl = document.createElement('span');
    durationEl.appendChild(document.createTextNode('('+item.duration+')'));
    durationEl.classList.add('ui-timepicker-duration');
    el.appendChild(durationEl);
  }

  if (item.disabled) {
    el.classList.add('ui-timepicker-disabled');
  }

  return el;
}

function _renderStandardList(items) {
  const list = document.createElement('ul');
  list.classList.add('ui-timepicker-list');

  for (const item of items) {
    const itemEl = _renderStandardItem(item);
    list.appendChild(itemEl);
  }

  const wrapper = document.createElement('div');
  wrapper.classList.add('ui-timepicker-wrapper');
  wrapper.tabIndex = -1;
  wrapper.style.display = 'none';
  wrapper.style.position = 'absolute';

  wrapper.appendChild(list);

  return wrapper;
}

function _renderSelectList(items) {
  const el = document.createElement('select');
  el.classList.add('ui-timepicker-select');

  if (el.target.name) {
    el.name = 'ui-timepicker-' + el.target.name;
  }

  for (const item of items) {
    const itemEl = _renderSelectItem(item);
    el.appendChild(itemEl);
  }

  return el
}

function renderHtml(tp) {
  const items = [].concat(
    _getNoneOptionItems(tp.settings),
    _getDropdownTimes(tp));

  let el;
  if (tp.settings.useSelect) {
    el = _renderSelectList(items)
  } else {
    el = _renderStandardList(items)
  }

  if (tp.settings.className) {
    el.classList.add(settings.className);
  }

  if (tp.settings.showDuration
    && (tp.settings.minTime !== null || tp.settings.durationTime !== null)) {
    el.classList.add("ui-timepicker-with-duration");
    el.classList.add("ui-timepicker-step-" + tp.settings.step());
  }

  return el;
}

export default renderHtml;