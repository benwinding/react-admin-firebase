"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isEmptyObj(obj) {
    return JSON.stringify(obj) == "{}";
}
function sortArray(data, field, dir) {
    data.sort(function (a, b) {
        var aValue = a[field] ? a[field].toString().toLowerCase() : "";
        var bValue = b[field] ? b[field].toString().toLowerCase() : "";
        if (aValue > bValue) {
            return dir === "asc" ? -1 : 1;
        }
        if (aValue < bValue) {
            return dir === "asc" ? 1 : -1;
        }
        return 0;
    });
}
exports.sortArray = sortArray;
function filterArray(data, filterFields) {
    if (isEmptyObj(filterFields)) {
        return data;
    }
    var fieldNames = Object.keys(filterFields);
    return data.filter(function (item) {
        return fieldNames.reduce(function (previousMatched, fieldName) {
            var fieldSearchText = filterFields[fieldName].toLowerCase();
            var dataFieldValue = item[fieldName];
            if (dataFieldValue == null) {
                return false;
            }
            var currentIsMatched = dataFieldValue
                .toLowerCase()
                .includes(fieldSearchText);
            return previousMatched || currentIsMatched;
        }, false);
    });
}
exports.filterArray = filterArray;
//# sourceMappingURL=utils.js.map