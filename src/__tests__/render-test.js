import Timepicker from '../timepicker/index.js';
import renderHtml from '../timepicker/render.js';
import { _expectThrewEvent } from '../testHelpers.js'

const TEST_INPUT = 'testInput';

function createIntput() {
  document.body.innerHTML = `<div>
	    <input type="text" id="${TEST_INPUT}" />
	  </div>`;

  return document.getElementById(TEST_INPUT);
}

test('render doesn\'t crash', () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  const list = renderHtml(tp);
});

test('className works', () => {
  const el = createIntput();
  const tp = new Timepicker(el, {
    className: 'foo'
  });

  const list = renderHtml(tp);
  expect(list.className).toEqual('ui-timepicker-wrapper foo');

  const el2 = createIntput();
  const tp2 = new Timepicker(el2, {
    className: 'foo bar'
  });

  const list2 = renderHtml(tp2);
  expect(list2.className).toEqual('ui-timepicker-wrapper foo bar');
});


test('noneOption works', () => {
  const el = createIntput();
  const tp = new Timepicker(el, {
    'noneOption': [
      {
        'label': 'Foobar',
        'className': 'shibby',
        'value': 'oh hai'
      },
      'Foobar2'
    ]
  });

  const list = renderHtml(tp);

  const firstNoneOption = list.children[0].children[0];
  const secondNoneOption = list.children[0].children[1];

  expect(firstNoneOption.innerHTML).toEqual('Foobar');
  expect(firstNoneOption.dataset['time']).toEqual('oh hai');
  expect(firstNoneOption.classList.contains('shibby')).toEqual(true);

  expect(secondNoneOption.innerHTML).toEqual('Foobar2');
  expect(secondNoneOption.dataset['time']).toEqual('');
  expect(secondNoneOption.classList.contains('shibby')).toEqual(false);
});