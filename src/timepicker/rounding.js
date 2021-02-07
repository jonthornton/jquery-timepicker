import { ONE_DAY } from "./constants";

const roundingFunction = (seconds, settings) => {
  if (seconds === null) {
    return null;
  } else if (typeof settings.step !== "number") {
    // TODO: nearest fit irregular steps
    return seconds;
  } else {
    var offset = seconds % (settings.step * 60); // step is in minutes

    var start = settings.minTime() ?? 0;

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
};

function _moduloSeconds(seconds, settings) {
  if (seconds == ONE_DAY && settings.show2400) {
    return seconds;
  }

  return seconds % ONE_DAY;
}

export default roundingFunction;
