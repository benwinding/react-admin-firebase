import { getFiltersConstraints } from '../../../src/providers/lazy-loading/paramsToQuery';
import { QueryConstraintType } from '@firebase/firestore';

describe('getFiltersConstraints', () => {
  it('should return where filter with array-contains-any operator when filter value is array', () => {
    const filters = { fieldA: ['valueA'] };

    const result = getFiltersConstraints(filters);

    expect(result.length).toEqual(1);
    const queryConstraint = result[0];
    expect(queryConstraint.type).toEqual('where' as QueryConstraintType);
    // @ts-ignore
    expect(queryConstraint['_op']).toEqual('array-contains-any');
  });

  it('should return two where filters when filter value is string', () => {
    const filters = { fieldA: 'valueA' };

    const result = getFiltersConstraints(filters);

    expect(result.length).toEqual(2);
    const queryConstraintGte = result[0];
    const queryConstraintLt = result[1];
    expect(queryConstraintGte.type).toEqual('where' as QueryConstraintType);
    expect(queryConstraintLt.type).toEqual('where' as QueryConstraintType);
    // @ts-ignore
    expect(queryConstraintGte['_op']).toEqual('>=');
    // @ts-ignore
    expect(queryConstraintLt['_op']).toEqual('<');
  });

  it('should return where filter with == operator when field value is number', () => {
    const filters = { fieldA: 1 };

    const result = getFiltersConstraints(filters);

    expect(result.length).toEqual(1);
    const queryConstraint = result[0];
    expect(queryConstraint.type).toEqual('where' as QueryConstraintType);
    // @ts-ignore
    expect(queryConstraint['_op']).toEqual('==');
  });

  it('should return where filter with == operator when field value is boolean', () => {
    const filters = { fieldA: false };

    const result = getFiltersConstraints(filters);

    expect(result.length).toEqual(1);
    const queryConstraint = result[0];
    expect(queryConstraint.type).toEqual('where' as QueryConstraintType);
    // @ts-ignore
    expect(queryConstraint['_op']).toEqual('==');
  });
});