import Timepicker from "../timepicker/index.js";

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

test("time2int works", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  expect(tp.time2int('00')).toEqual(0);
});

test("int2duration works", () => {
  const el = createIntput();
  const tp = new Timepicker(el);

  expect(tp._int2duration(5400, 15)).toEqual('1 hr 30 mins');
  expect(tp._int2duration(5400, 30)).toEqual('1.5 hrs');
});

