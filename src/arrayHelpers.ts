function isEmptyObj(obj) {
  return JSON.stringify(obj) == "{}";
}

function sortArray(data: Array<{}>, field: string, dir: "asc" | "desc"): void {
  data.sort((a: {}, b: {}) => {
    const aValue = a[field] ? a[field].toString().toLowerCase() : "";
    const bValue = b[field] ? b[field].toString().toLowerCase() : "";
    if (aValue > bValue) {
      return dir === "asc" ? -1 : 1;
    }
    if (aValue < bValue) {
      return dir === "asc" ? 1 : -1;
    }
    return 0;
  });
}

function filterArray(
  data: Array<{}>,
  filterFields: { [field: string]: string }
): Array<{}> {
  if (isEmptyObj(filterFields)) {
    return data;
  }
  const fieldNames = Object.keys(filterFields);
  return data.filter(item =>
    fieldNames.reduce((previousMatched, fieldName) => {
      const fieldSearchText = filterFields[fieldName].toLowerCase();
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