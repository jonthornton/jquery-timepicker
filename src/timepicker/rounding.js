import { ONE_DAY } from "./constants";

const roundingFunction = (seconds, settings) => {
  if (seconds === null) {
    return null;
  }

  let i = 0;
  let nextVal = 0;
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
