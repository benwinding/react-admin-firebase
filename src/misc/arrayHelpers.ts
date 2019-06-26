function isEmptyObj(obj) {
  if (!obj) {
    return true;
  }
  return JSON.stringify(obj) === "{}";
}

export function sortArray(data: Array<{}>, field: string, dir: "asc" | "desc"): void {
  data.sort((a: {}, b: {}) => {
    const aValue = a[field] ? a[field].toString().toLowerCase() : "";
    const bValue = b[field] ? b[field].toString().toLowerCase() : "";
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
  filterFields: { [field: string]: string }
): Array<{}> {
  if (isEmptyObj(filterFields)) {
    return data;
  }
  const fieldNames = Object.keys(filterFields);
  return data.filter((item) =>
    fieldNames.reduce((previousMatched, fieldName) => {
      let fieldVal = filterFields[fieldName];
      if (fieldVal == null || fieldVal == undefined) {
        fieldVal = '';
      }
      const fieldSearchText = fieldVal.toString().toLowerCase();
      const dataFieldValue = item[fieldName];
      if (dataFieldValue == null) {
        return false;
      }
      const currentIsMatched = dataFieldValue
        .toLowerCase()
        .includes(fieldSearchText);
      return previousMatched || currentIsMatched;
    }, false)
  );
}