import Timepicker from "../timepicker/index.js";

const TEST_INPUT = "testInput";

// beforeEach(() => {
//   document.body.innerHTML = `<div>
//       <input type="text" id="${TEST_INPUT}" />
//     </div>`;
// });

test("time2int works", () => {
  document.body.innerHTML = `<div>
      <input type="text" id="${TEST_INPUT}" />
    </div>`;
  const el = document.getElementById(TEST_INPUT);

  const tp = new Timepicker(el);

  expect(tp.time2int('00')).toEqual(0);
  expect(tp.time2int('43200')).toEqual(0);
});


