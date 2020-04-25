import { isEmpty } from "lodash";

export function sortArray(
  data: Array<{}>,
  field: string,
  dir: "asc" | "desc"
): void {
  data.sort((a: {}, b: {}) => {
    const rawA = a[field];
    const rawB = b[field];
    const isNumberField = Number.isFinite(rawA) && Number.isFinite(rawB);
    let aValue: string, bValue: string;
    if (isNumberField) {
      aValue = rawA;
      bValue = rawB;
    } else {
      aValue = (a[field] || "").toString().toLowerCase();
      bValue = (b[field] || "").toString().toLowerCase();
    }
    if (aValue > bValue) {
      return dir === "asc" ? 1 : -1;
    }
    if (aValue < bValue) {
      return dir === "asc" ? -1 : 1;
    }
    return 0;
  });
}

export function filterArray(
  data: Array<{}>,
  searchFields: { [field: string]: string | number | boolean }
): Array<{}> {
  if (isEmpty(searchFields)) {
    return data;
  }
  const searchObjs = Object.keys(searchFields).map((field) => ({
    searchField: field,
    searchValue: searchFields[field],
  }));
  const filtered = data.filter((row) =>
    searchObjs.reduce(
      (prev, curr) =>
        doesRowMatch(row, curr.searchField, curr.searchValue) && prev,
      true
    )
  );
  return filtered;
}

export function doesRowMatch(
  row: {},
  searchField: string,
  searchValue: any
): boolean {
  const searchThis = row[searchField];
  const isFalseySearch = !searchThis && !searchValue;
  if (isFalseySearch) {
    return true;
  }
  const isStringSearch = typeof searchValue === "string";
  if (isStringSearch) {
    return searchThis
      .toString()
      .toLowerCase()
      .includes(searchValue.toLowerCase());
  }
  const isBooleanOrNumber =
    typeof searchValue === "boolean" || typeof searchValue === "number";
  if (isBooleanOrNumber) {
    return searchThis === searchValue;
  }
  return false;
}
