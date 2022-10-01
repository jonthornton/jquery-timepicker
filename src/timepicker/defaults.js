import { roundingFunction } from "./rounding";

const DEFAULT_SETTINGS = {
  appendTo: "body",
  className: null,
  closeOnWindow: false,
  closeOnScroll: false,
  disableTextInput: false,
  disableTimeRanges: [],
  disableTouchKeyboard: false,
  durationTime: null,
  forceRoundTime: false,
  lang: {},
  listWidth: null,
  maxTime: null,
  minTime: null,
  noneOption: false,
  orientation: "l",
  roundingFunction,
  scrollDefault: null,
  selectOnBlur: false,
  show2400: false,
  showDuration: false,
  showOn: ["click", "focus"],
  step: 30,
  stopScrollPropagation: false,
  timeFormat: "g:ia",
  typeaheadHighlight: true,
  useSelect: false,
  wrapHours: true
};

const DEFAULT_LANG = {
  am: "am",
  pm: "pm",
  AM: "AM",
  PM: "PM",
  decimal: ".",
  mins: "mins",
  hr: "hr",
  hrs: "hrs"
};

export { DEFAULT_SETTINGS, DEFAULT_LANG };
