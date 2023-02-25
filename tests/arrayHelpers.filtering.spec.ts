import {
  doesRowMatch,
  filterArray,
  getFieldReferences,
  SearchObj,
} from '../src/misc';

describe('array filter', () => {
  test('filter array, filter empty', () => {
    const input = [{ name: 'Apple' }, { name: 'Pear' }, { name: 'Banana' }];
    const result = filterArray(input);
    const expected = [{ name: 'Apple' }, { name: 'Pear' }, { name: 'Banana' }];
    expect(result).toEqual(expected);
  });

  test('filter array, filter empty obj', () => {
    const input = [{ name: 'Apple' }, { name: 'Pear' }, { name: 'Banana' }];
    const result = filterArray(input, {});
    const expected = [{ name: 'Apple' }, { name: 'Pear' }, { name: 'Banana' }];
    expect(result).toEqual(expected);
  });

  test('filters array, simple', () => {
    const input = [{ a: 1 }, { a: 2 }];
    const expected = [{ a: 2 }];
    const result = filterArray(input, { a: 2 });
    expect(result).toEqual(expected);
  });

  test('filter array, multiple', () => {
    const input = [
      { name: 'Ben', age: 32 },
      { name: 'Dale', age: 23 },
      { name: 'Fred', age: 23 },
    ];
    const result = filterArray(input, { age: 32 });
    const expected = [{ name: 'Ben', age: 32 }];
    expect(result).toEqual(expected);
  });

  test('filter array, multiple search', () => {
    const input = [
      { name: 'Ben', age: 32 },
      { name: 'Dale', age: 23 },
      { name: 'Fred', age: 23 },
    ];
    const result = filterArray(input, { name: 'Ben', age: 32 });
    const expected = [{ name: 'Ben', age: 32 }];
    expect(result).toEqual(expected);
  });

  test('filter array, filter boolean true', () => {
    const input = [
      { name: 'Apple', enabled: false },
      { name: 'Pear', enabled: false },
      { name: 'Banana', enabled: true },
    ];
    const result = filterArray(input, { enabled: true });
    const expected = [{ name: 'Banana', enabled: true }];
    expect(result).toEqual(expected);
  });

  test('filter array, filter boolean false', () => {
    const input = [
      { name: 'Apple', enabled: false },
      { name: 'Pear', enabled: false },
      { name: 'Banana', enabled: true },
    ];
    const result = filterArray(input, { enabled: false });
    const expected = [
      { name: 'Apple', enabled: false },
      { name: 'Pear', enabled: false },
    ];
    expect(result).toEqual(expected);
  });

  test('filter array, filter boolean null', () => {
    const input = [
      { name: 'Apple', enabled: false },
      { name: 'Pear', enabled: false },
      { name: 'Banana', enabled: true },
    ];
    const result = filterArray(input, { enabled: null });
    const expected = [
      { name: 'Apple', enabled: false },
      { name: 'Pear', enabled: false },
    ];
    expect(result).toEqual(expected);
  });

  test('doesRowMatch, partial', () => {
    const inputRow = { name: 'Banana', enabled: true };
    const result = doesRowMatch(inputRow, 'name', 'ana');
    expect(result).toEqual(true);
  });

  test('doesRowMatch, deep object', () => {
    const inputRow = { name: 'Banana', deep: { enabled: 'Apple' } };
    const result = doesRowMatch(inputRow, 'deep.enabled', 'Apple');
    expect(result).toEqual(true);
  });

  test(`doesRowMatch, deep object path doesn't exist`, () => {
    const inputRow = { name: 'Banana', deep: { enabled: 'Apple' } };
    const result = doesRowMatch(inputRow, 'deep.enabled.sss', 'Apple');
    expect(result).toEqual(false);
  });

  test('getFieldReferences, simple field', () => {
    const res = getFieldReferences('name', 'Dan');
    const expected: SearchObj[] = [{ searchField: 'name', searchValue: 'Dan' }];
    expect(res).toEqual(expected);
  });

  test('getFieldReferences, nested field', () => {
    const res = getFieldReferences('name', { value: 'Alex' });
    const expected: SearchObj[] = [
      { searchField: 'name.value', searchValue: 'Alex' },
    ];
    expect(res).toEqual(expected);
  });

  test('getFieldReferences, nested field', () => {
    const res = getFieldReferences('customer', { details: { age: 25 } });
    const expected: SearchObj[] = [
      { searchField: 'customer.details.age', searchValue: 25 },
    ];
    expect(res).toEqual(expected);
  });
});
