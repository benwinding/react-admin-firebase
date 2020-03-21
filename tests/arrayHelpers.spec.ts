import { sortArray } from "../src/misc";

test("returns an ascending array", () => {
  const input = [{ a: 1 }, { a: 2 }];
  const expected = [{ a: 1 }, { a: 2 }];
  sortArray(input, "a", "asc");
  expect(input).toEqual(expected);
});

test("returns an descending array", () => {
  const input = [{ a: 1 }, { a: 2 }];
  const expected = [{ a: 2 }, { a: 1 }];
  sortArray(input, "a", "desc");
  expect(input).toEqual(expected);
});
