function isEmptyObj(obj) {
  if (!obj) {
    return true;
  }
  return JSON.stringify(obj) === "{}";
}

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
  searchFields: { [field: string]: string }
): Array<{}> {
  if (isEmptyObj(searchFields)) {
    return data;
  }
  const searchObjs = Object.keys(searchFields).map(n => ({
    name: n,
    value: (searchFields[n] || '').toLowerCase()
  }));
  return data.filter(row =>
    searchObjs.reduce(
      (prev, curr) => doesRowMatch(row, curr.name, curr.value) && prev,
      true
    )
  );
}

function doesRowMatch(
  row: {},
  searchField: string,
  searchValue: string
): boolean {
  const searchPart = row[searchField];
  if (typeof searchPart !== "string") {
    return false;
  }
  return searchPart
    .toString()
    .toLowerCase()
    .includes(searchValue.toLowerCase());
}
