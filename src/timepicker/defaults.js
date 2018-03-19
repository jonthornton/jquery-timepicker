const DEFAULT_SETTINGS = {
  appendTo: "body",
  className: null,
  closeOnWindowScroll: false,
  disableTextInput: false,
  disableTimeRanges: [],
  disableTouchKeyboard: false,
  durationTime: null,
  forceRoundTime: false,
  lang: {},
  maxTime: null,
  minTime: null,
  noneOption: false,
  orientation: "l",
  roundingFunction: function(seconds, settings) {
    if (seconds === null) {
      return null;
    } else if (typeof settings.step !== "number") {
      // TODO: nearest fit irregular steps
      return seconds;
    } else {
      var offset = seconds % (settings.step * 60); // step is in minutes

      var start = settings.minTime || 0;

      // adjust offset by start mod step so that the offset is aligned not to 00:00 but to the start
      offset -= start % (settings.step * 60);

      if (offset >= settings.step * 30) {
        // if offset is larger than a half step, round up
        seconds += settings.step * 60 - offset;
      } else {
        // round down
        seconds -= offset;
      }

      return _moduloSeconds(seconds, settings);
    }
  },
  scrollDefault: null,
  selectOnBlur: false,
  show2400: false,
  showDuration: false,
  showOn: ["click", "focus"],
  showOnFocus: true,
  step: 30,
  stopScrollPropagation: false,
  timeFormat: "g:ia",
  typeaheadHighlight: true,
  useSelect: false,
  wrapHours: true
};

const DEFAULT_LANG = {
  am: 'am',
  pm: 'pm',
  AM: 'AM',
  PM: 'PM',
  decimal: '.',
  mins: 'mins',
  hr: 'hr',
  hrs: 'hrs'
};

export { DEFAULT_SETTINGS, DEFAULT_LANG };
