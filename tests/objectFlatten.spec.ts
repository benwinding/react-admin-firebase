import { objectFlatten, SearchObj } from '../src/misc';

describe('objectFlatten tests', () => {
  test('objectFlatten level 1', () => {
    const obj = {
      a: 9,
    };
    const res = objectFlatten(obj);
    const expected: SearchObj[] = [
      {
        searchField: 'a',
        searchValue: 9,
      },
    ];
    expect(res).toEqual(expected);
  });

  test('objectFlatten level 2', () => {
    const obj = {
      a: 9,
      apple: {
        value: 1,
      },
    };
    const res = objectFlatten(obj);
    const expected: SearchObj[] = [
      {
        searchField: 'a',
        searchValue: 9,
      },
      {
        searchField: 'apple.value',
        searchValue: 1,
      },
    ];
    expect(res).toEqual(expected);
  });
});
