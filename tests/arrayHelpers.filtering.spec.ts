import { filterArray } from "../src/misc";

describe("array filter", () => {
  test("filter array, filter empty", () => {
    const input = [
      { name: "Apple" },
      { name: "Pear" },
      { name: "Banana" },
    ];
    const result = filterArray(input, null);
    const expected = [
      { name: "Apple" },
      { name: "Pear" },
      { name: "Banana" },
    ];
    expect(result).toEqual(expected);
  });

  test("filter array, filter empty obj", () => {
    const input = [
      { name: "Apple" },
      { name: "Pear" },
      { name: "Banana" },
    ];
    const result = filterArray(input, {});
    const expected = [
      { name: "Apple" },
      { name: "Pear" },
      { name: "Banana" },
    ];
    expect(result).toEqual(expected);
  });

  test("filters array, simple", () => {
    const input = [{ a: 1 }, { a: 2 }];
    const expected = [{ a: 2 }];
    const result = filterArray(input, { a: 2 });
    expect(result).toEqual(expected);
  });

  test("filter array, multiple", () => {
    const input = [
      { name: "Ben", age: 32 },
      { name: "Dale", age: 23 },
      { name: "Fred", age: 23 },
    ];
    const result = filterArray(input, { age: 32 });
    const expected = [{ name: "Ben", age: 32 }];
    expect(result).toEqual(expected);
  });

  test("filter array, multiple search", () => {
    const input = [
      { name: "Ben", age: 32 },
      { name: "Dale", age: 23 },
      { name: "Fred", age: 23 },
    ];
    const result = filterArray(input, { name: "Ben", age: 32 });
    const expected = [{ name: "Ben", age: 32 }];
    expect(result).toEqual(expected);
  });

  test("filter array, filter boolean true", () => {
    const input = [
      { name: "Apple", enabled: false },
      { name: "Pear", enabled: false },
      { name: "Banana", enabled: true },
    ];
    const result = filterArray(input, { enabled: true });
    const expected = [{ name: "Banana", enabled: true }];
    expect(result).toEqual(expected);
  });

  test("filter array, filter boolean false", () => {
    const input = [
      { name: "Apple", enabled: false },
      { name: "Pear", enabled: false },
      { name: "Banana", enabled: true },
    ];
    const result = filterArray(input, { enabled: false });
    const expected = [
      { name: "Apple", enabled: false },
      { name: "Pear", enabled: false },
    ];
    expect(result).toEqual(expected);
  });

  test("filter array, filter boolean false", () => {
    const input = [
      { name: "Apple", enabled: false },
      { name: "Pear", enabled: false },
      { name: "Banana", enabled: true },
    ];
    const result = filterArray(input, { enabled: null });
    const expected = [
      { name: "Apple", enabled: false },
      { name: "Pear", enabled: false },
    ];
    expect(result).toEqual(expected);
  });
});
