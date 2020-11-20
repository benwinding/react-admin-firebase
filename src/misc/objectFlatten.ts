export interface SearchObj {
  searchField: string;
  searchValue: number | string | boolean | null;
}
export function getFieldReferences(
  fieldName: string,
  value: {} | number | string | boolean | null
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
        searchValue: value as number | string | boolean | null,
      },
    ];
  }
  const tree = {} as any;
  tree[fieldName] = value;
  return objectFlatten(tree);
}

export function objectFlatten(tree: {}): SearchObj[] {
  var leaves: SearchObj[] = [];
  var recursivelyWalk = function (obj: any, path: string | null) {
    path = path || "";
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        const objVal = obj && obj[key];
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
