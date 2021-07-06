import { get, isEmpty } from 'lodash';
import { getFieldReferences, SearchObj } from './objectFlatten';

export function sortArray(
  data: Array<{}>,
  field: string,
  dir: 'asc' | 'desc'
): void {
  data.sort((a: {}, b: {}) => {
    const rawA = get(a, field);
    const rawB = get(b, field);
    const isAsc = dir === "asc";

    const isNumberField = Number.isFinite(rawA) && Number.isFinite(rawB);
    if (isNumberField) {
      return basicSort(rawA, rawB, isAsc);
    }
    const isStringField = typeof rawA === 'string' && typeof rawB === 'string';
    if (isStringField) {
      const aParsed = rawA.toLowerCase();
      const bParsed = rawB.toLowerCase();
      return basicSort(aParsed, bParsed, isAsc);
    }
    const isDateField = rawA instanceof Date && rawB instanceof Date;
    if (isDateField) {
      return basicSort(rawA, rawB, isAsc);
    }
    return basicSort(!!rawA, !!rawB, isAsc);
  });
}

function basicSort(aValue: any, bValue: any, isAsc: boolean) {
  if (aValue > bValue) {
    return isAsc ? 1 : -1;
  }
  if (aValue < bValue) {
    return isAsc ? -1 : 1;
  }
  return 0;
}

export function filterArray(
  data: Array<{}>,
  searchFields?: { [field: string]: string | number | boolean | null }
): Array<{}> {
  if (!searchFields || isEmpty(searchFields)) {
    return data;
  }
  const searchObjs: SearchObj[] = [];
  Object.keys(searchFields).map((fieldName) => {
    const fieldValue = searchFields[fieldName];
    const getSubObjects = getFieldReferences(fieldName, fieldValue);
    searchObjs.push(...getSubObjects);
  });
  const filtered = data.filter((row) =>
    searchObjs.reduce((acc, cur) => {
      const res = doesRowMatch(row, cur.searchField, cur.searchValue);
      return res && acc;
    }, true as boolean)
  );
  return filtered;
}

export function doesRowMatch(
  row: {},
  searchField: string,
  searchValue: any
): boolean {
  const searchThis = get(row, searchField);
  const bothAreFalsey = !searchThis && !searchValue;
  if (bothAreFalsey) {
    return true;
  }
  const nothingToSearch = !searchThis;
  if (nothingToSearch) {
    return false;
  }
  const isStringSearch = typeof searchValue === 'string';
  if (isStringSearch) {
    return searchThis
      .toString()
      .toLowerCase()
      .includes(searchValue.toLowerCase());
  }
  const isBooleanOrNumber =
    typeof searchValue === 'boolean' || typeof searchValue === 'number';
  if (isBooleanOrNumber) {
    return searchThis === searchValue;
  }
  const isArraySearch = Array.isArray(searchValue);
  if (isArraySearch) {
    return searchValue.includes(searchThis);
  }
  return false;
}
