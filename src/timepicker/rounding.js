import { ONE_DAY } from "./constants";

const roundingFunction = (seconds, settings) => {
  if (seconds === null) {
    return null;
  }

  // Steps are counted from minTime, the same way the dropdown is built.
  // Times before minTime belong to the next day when the list wraps past
  // midnight.
  const start = settings.minTime() ?? 0;
  if (seconds < start) {
    seconds += ONE_DAY;
  }

  let i = 0;
  let nextVal = start;
  while (nextVal < seconds) {
    i++;
    nextVal += settings.step(i) * 60;
  }

  const prevVal = nextVal - settings.step(i - 1) * 60;

  if (seconds - prevVal < nextVal - seconds) {
    return moduloSeconds(prevVal, settings);
  } else {
    return moduloSeconds(nextVal, settings);
  }
};

function moduloSeconds(seconds, settings) {
  if (seconds == ONE_DAY && settings.show2400) {
    return seconds;
  }

  return seconds % ONE_DAY;
}

// The span of times the dropdown covers. minTime defaults to midnight and
// maxTime to 24 hours after minTime; end is pushed into the next day when the
// range wraps past midnight.
function timeWindow(settings) {
  const start = settings.minTime() ?? 0;
  let end = settings.maxTime() ?? start + ONE_DAY - 1;

  if (end < start) {
    end += ONE_DAY;
  }

  if (
    end === ONE_DAY - 1 &&
    typeof settings.timeFormat === "string" &&
    settings.show2400
  ) {
    // include a 24:00 option when using military time
    end = ONE_DAY;
  }

  return { start, end };
}

export { roundingFunction, moduloSeconds, timeWindow };
