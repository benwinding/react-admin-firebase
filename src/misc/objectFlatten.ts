type SearchValues = {} | number | string | boolean | null ;
type SearchValue = SearchValues | SearchValue[];

export interface SearchObj {
  searchField: string;
  searchValue: SearchValue;
}
export function getFieldReferences(
  fieldName: string,
  value: {} | SearchValue
): SearchObj[] {
  const isFalsy = !value;
  const isSimple = isFalsy ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean';

  if (isSimple) {
    return [
      {
        searchField: fieldName,
        searchValue: value as SearchValue,
      },
    ];
  }
  const tree = {} as Record<string, SearchValue>;
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
          typeof objVal === 'object' || objVal instanceof Array;
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
