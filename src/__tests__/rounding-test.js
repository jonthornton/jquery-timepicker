import Timepicker from '../timepicker/index.js';
import { roundingFunction } from '../timepicker/rounding.js';

const TEST_INPUT = 'testInput';

function createIntput() {
  document.body.innerHTML = `<div>
      <input type="text" id="${TEST_INPUT}" />
    </div>`;

  return document.getElementById(TEST_INPUT);
}

test('roundingFunction handles defaults', () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  const rounded = roundingFunction(23, tp.settings);
  expect(rounded).toEqual(0);

});

test('roundingFunction handles dynamic step', () => {
  const el = createIntput();
  const tp = new Timepicker(el, {
    'step': function(i) {
      return (i%2) ? 15 : 45;
    }
  });

  const rounded = roundingFunction(47700, tp.settings);

  expect(rounded).toEqual(47700);

});

