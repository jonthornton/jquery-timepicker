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

export { roundingFunction, moduloSeconds };
