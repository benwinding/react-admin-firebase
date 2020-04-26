export interface SearchObj {
  searchField: string;
  searchValue: number | string | boolean;
}
export function getFieldReferences(
  fieldName: string,
  value: {} | number | string | boolean
): SearchObj[] {
  const isFalsey = !value;
  const isSimple = isFalsey;
  typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";
  if (isSimple) {
    return [
      {
        searchField: fieldName,
        searchValue: value as number | string | boolean,
      },
    ];
  }
  const tree = {};
  tree[fieldName] = value;
  return objectFlatten(tree);
}

export function objectFlatten(tree: {}): SearchObj[] {
  var leaves: SearchObj[] = [];
  var recursivelyWalk = function (obj: {}, path) {
    path = path || "";
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        const objVal = obj[key];
        const currentPath = !!path ? path + "." + key : key;
        const isWalkable =
          typeof objVal === "object" || objVal instanceof Array;
        if (isWalkable) {
          recursivelyWalk(objVal, currentPath);
        } else {
          leaves.push({ searchField: currentPath, searchValue: objVal });
        }
      }
    }
  };
  recursivelyWalk(tree, null);
  return leaves;
}
