import Timepicker from "../timepicker/index.js";
import renderHtml from "../timepicker/render.js";
import { _expectThrewEvent } from '../testHelpers.js'

const TEST_INPUT = "testInput";

// beforeEach(() => {
//   document.body.innerHTML = `<div>
//       <input type="text" id="${TEST_INPUT}" />
//     </div>`;
// });

function createIntput() {
  document.body.innerHTML = `<div>
	    <input type="text" id="${TEST_INPUT}" />
	  </div>`;

  return document.getElementById(TEST_INPUT);
}

// test("render works", () => {
//   const el = createIntput();
//   const tp = new Timepicker(el);

//   const list = renderHtml(tp);
//   console.log(list)
// });

// test("_getDropdownTimes works", () => {
//   const el = createIntput();
//   const tp = new Timepicker(el);

//   const list = _getDropdownTimes(tp);
// // console.log(list)
// });
