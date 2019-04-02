"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase/app");
require("firebase/firestore");
var react_admin_1 = require("react-admin");
var rxjs_1 = require("rxjs");
// UTILS
function isEmptyObj(obj) {
    return JSON.stringify(obj) == "{}";
}
function log(description, obj) {
    if (ISDEBUG) {
        console.log(description, obj);
    }
}
var ISDEBUG = false;
var FirebaseClient = /** @class */ (function () {
    function FirebaseClient(firebaseConfig) {
        this.firebaseConfig = firebaseConfig;
        this.resources = {};
        if (!firebase.apps.length) {
            this.app = firebase.initializeApp(firebaseConfig);
        }
        else {
            this.app = firebase.app();
        }
        this.db = this.app.firestore();
    }
    FirebaseClient.prototype.parseFireStoreDocument = function (doc) {
        var data = doc.data();
        Object.keys(data).forEach(function (key) {
            var value = data[key];
            if (value && value.toDate && value.toDate instanceof Function) {
                data[key] = value.toDate().toISOString();
            }
        });
        // React Admin requires an id field on every document,
        // So we can just using the firestore document id
        return __assign({ id: doc.id }, data);
    };
    FirebaseClient.prototype.initPath = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var hasBeenInited = _this.resources[path];
                        if (hasBeenInited) {
                            return resolve();
                        }
                        var collection = _this.db.collection(path);
                        var observable = _this.getCollectionObservable(collection);
                        observable.subscribe(function (querySnapshot) {
                            var newList = querySnapshot.docs.map(function (doc) {
                                return _this.parseFireStoreDocument(doc);
                            });
                            _this.setList(newList, path);
                            // The data has been set, so resolve the promise
                            resolve();
                        });
                        var list = [];
                        var r = {
                            collection: collection,
                            list: list,
                            observable: observable,
                            path: path
                        };
                        _this.resources[path] = r;
                        log("initPath", { path: path, r: r, "this.resources": _this.resources });
                    })];
            });
        });
    };
    FirebaseClient.prototype.apiGetList = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r, data, _a, field, order, filteredData, pageStart, pageEnd, dataPage, total;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _b.sent();
                        data = r.list;
                        if (params.sort != null) {
                            _a = params.sort, field = _a.field, order = _a.order;
                            if (order === "ASC") {
                                this.sortArray(data, field, "asc");
                            }
                            else {
                                this.sortArray(data, field, "desc");
                            }
                        }
                        log("apiGetList", { resourceName: resourceName, resource: r, params: params });
                        filteredData = this.filterArray(data, params.filter);
                        pageStart = (params.pagination.page - 1) * params.pagination.perPage;
                        pageEnd = pageStart + params.pagination.perPage;
                        dataPage = filteredData.slice(pageStart, pageEnd);
                        total = r.list.length;
                        return [2 /*return*/, {
                                data: dataPage,
                                total: total
                            }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiGetOne = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _a.sent();
                        log("apiGetOne", { resourceName: resourceName, resource: r, params: params });
                        data = r.list.filter(function (val) { return val.id === params.id; });
                        if (data.length < 1) {
                            throw new Error("react-admin-firebase: No id found matching: " + params.id);
                        }
                        return [2 /*return*/, { data: data.pop() }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiCreate = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _a.sent();
                        log("apiCreate", { resourceName: resourceName, resource: r, params: params });
                        return [4 /*yield*/, r.collection.add(params.data)];
                    case 2:
                        doc = _a.sent();
                        return [2 /*return*/, {
                                data: __assign({}, params.data, { id: doc.id })
                            }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiUpdate = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var id, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = params.id;
                        delete params.data.id;
                        return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _a.sent();
                        log("apiUpdate", { resourceName: resourceName, resource: r, params: params });
                        r.collection.doc(id).update(params.data);
                        return [2 /*return*/, {
                                data: __assign({}, params.data, { id: id })
                            }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiUpdateMany = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r, returnData, _i, _a, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        delete params.data.id;
                        return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _b.sent();
                        log("apiUpdateMany", { resourceName: resourceName, resource: r, params: params });
                        returnData = [];
                        for (_i = 0, _a = params.ids; _i < _a.length; _i++) {
                            id = _a[_i];
                            r.collection.doc(id).update(params.data);
                            returnData.push(__assign({}, params.data, { id: id }));
                        }
                        return [2 /*return*/, {
                                data: returnData
                            }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiDelete = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _a.sent();
                        log("apiDelete", { resourceName: resourceName, resource: r, params: params });
                        r.collection.doc(params.id).delete();
                        return [2 /*return*/, {
                                data: params.previousData
                            }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiDeleteMany = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r, returnData, batch, _i, _a, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _b.sent();
                        log("apiDeleteMany", { resourceName: resourceName, resource: r, params: params });
                        returnData = [];
                        batch = this.db.batch();
                        for (_i = 0, _a = params.ids; _i < _a.length; _i++) {
                            id = _a[_i];
                            batch.delete(r.collection.doc(id));
                            returnData.push({ id: id });
                        }
                        batch.commit();
                        return [2 /*return*/, { data: returnData }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiGetMany = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r, ids, matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _a.sent();
                        log("apiGetMany", { resourceName: resourceName, resource: r, params: params });
                        ids = new Set(params.ids);
                        matches = r.list.filter(function (item) { return ids.has(item["id"]); });
                        return [2 /*return*/, {
                                data: matches
                            }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiGetManyReference = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r, data, targetField, targetValue, matches, _a, field, order, pageStart, pageEnd, dataPage, total;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _b.sent();
                        log("apiGetManyReference", { resourceName: resourceName, resource: r, params: params });
                        data = r.list;
                        targetField = params.target;
                        targetValue = params.id;
                        matches = data.filter(function (val) { return val[targetField] === targetValue; });
                        if (params.sort != null) {
                            _a = params.sort, field = _a.field, order = _a.order;
                            if (order === "ASC") {
                                this.sortArray(data, field, "asc");
                            }
                            else {
                                this.sortArray(data, field, "desc");
                            }
                        }
                        pageStart = (params.pagination.page - 1) * params.pagination.perPage;
                        pageEnd = pageStart + params.pagination.perPage;
                        dataPage = matches.slice(pageStart, pageEnd);
                        total = matches.length;
                        return [2 /*return*/, { data: dataPage, total: total }];
                }
            });
        });
    };
    FirebaseClient.prototype.GetResource = function (resourceName) {
        return this.tryGetResource(resourceName);
    };
    FirebaseClient.prototype.sortArray = function (data, field, dir) {
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
    };
    FirebaseClient.prototype.filterArray = function (data, filterFields) {
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
    };
    FirebaseClient.prototype.setList = function (newList, resourceName) {
        return __awaiter(this, void 0, void 0, function () {
            var resource;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        resource = _a.sent();
                        resource.list = newList;
                        return [2 /*return*/];
                }
            });
        });
    };
    FirebaseClient.prototype.tryGetResource = function (resourceName) {
        var resource = this.resources[resourceName];
        if (!resource) {
            throw new Error("react-admin-firebase: Cant find resource: \"" + resourceName + "\"");
        }
        return resource;
    };
    FirebaseClient.prototype.getCollectionObservable = function (collection) {
        var observable = rxjs_1.Observable.create(function (observer) { return collection.onSnapshot(observer); });
        // LOGGING
        return observable;
    };
    return FirebaseClient;
}());
function FirebaseProvider(config) {
    if (!config) {
        throw new Error('Please pass the Firebase config.json object to the FirebaseDataProvider');
    }
    ISDEBUG = config['debug'];
    exports.fb = new FirebaseClient(config);
    function providerApi(type, resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exports.fb.initPath(resourceName)];
                    case 1:
                        _a.sent();
                        switch (type) {
                            case react_admin_1.GET_MANY:
                                return [2 /*return*/, exports.fb.apiGetMany(resourceName, params)];
                            case react_admin_1.GET_MANY_REFERENCE:
                                return [2 /*return*/, exports.fb.apiGetManyReference(resourceName, params)];
                            case react_admin_1.GET_LIST:
                                return [2 /*return*/, exports.fb.apiGetList(resourceName, params)];
                            case react_admin_1.GET_ONE:
                                return [2 /*return*/, exports.fb.apiGetOne(resourceName, params)];
                            case react_admin_1.CREATE:
                                return [2 /*return*/, exports.fb.apiCreate(resourceName, params)];
                            case react_admin_1.UPDATE:
                                return [2 /*return*/, exports.fb.apiUpdate(resourceName, params)];
                            case react_admin_1.UPDATE_MANY:
                                return [2 /*return*/, exports.fb.apiUpdateMany(resourceName, params)];
                            case react_admin_1.DELETE:
                                return [2 /*return*/, exports.fb.apiDelete(resourceName, params)];
                            case react_admin_1.DELETE_MANY:
                                return [2 /*return*/, exports.fb.apiDeleteMany(resourceName, params)];
                            default:
                                return [2 /*return*/, {}];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    return providerApi;
}
exports.default = FirebaseProvider;
//# sourceMappingURL=firebaseDataProvider.js.map