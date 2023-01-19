import { sortArray } from '../src/misc';

describe('array sort', () => {
  test('returns an ascending array', () => {
    const input = [{ a: 1 }, { a: 2 }];
    const expected = [{ a: 1 }, { a: 2 }];
    sortArray(input, 'a', 'asc');
    expect(input).toEqual(expected);
  });

  test('returns an ascending array - nested', () => {
    const input = [{ obj: { a: 2 } }, { obj: { a: 1 } }];
    const expected = [{ obj: { a: 1 } }, { obj: { a: 2 } }];
    sortArray(input, 'obj.a', 'asc');
    expect(input).toEqual(expected);
  });

  test('returns an descending array', () => {
    const input = [{ a: 1 }, { a: 2 }];
    const expected = [{ a: 2 }, { a: 1 }];
    sortArray(input, 'a', 'desc');
    expect(input).toEqual(expected);
  });

  test('sorting dates', () => {
    const input = [
      { date: new Date('2019-10-13') },
      { date: new Date('2019-10-12') },
      { date: new Date('2019-10-20') },
    ];
    sortArray(input, 'date', 'asc');
    const firstSortedItem = input[0];
    expect(firstSortedItem).toBeTruthy();
    expect(firstSortedItem.date).toBeInstanceOf(Date);
    expect(firstSortedItem.date).toEqual(new Date('2019-10-12'));
  });

  test('sorting dates, with times', () => {
    const input = [
      { date: new Date('2019-10-12, 10:20 pm') },
      { date: new Date('2019-10-24, 11:20 pm') },
      { date: new Date('2019-10-12, 9:20 pm') },
    ];
    sortArray(input, 'date', 'desc');
    expect(input[0].date).toEqual(new Date('2019-10-24, 11:20 pm'));
    expect(input[1].date).toEqual(new Date('2019-10-12, 10:20 pm'));
    expect(input[2].date).toEqual(new Date('2019-10-12, 9:20 pm'));
  });
});
