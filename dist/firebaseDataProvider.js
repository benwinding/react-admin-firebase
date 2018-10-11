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
var FirebaseClient = /** @class */ (function () {
    function FirebaseClient(firebaseConfig) {
        this.firebaseConfig = firebaseConfig;
        this.resources = [];
        this.app = firebase.initializeApp(this.firebaseConfig);
        this.db = this.app.firestore();
        var settings = { /* your settings... */ timestampsInSnapshots: true };
        this.db.settings(settings);
    }
    FirebaseClient.prototype.initPath = function (inputPath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        if (inputPath == null) {
                            return;
                        }
                        var path = inputPath;
                        var collection = _this.db.collection(path);
                        var observable = _this.getCollectionObservable(collection);
                        observable.subscribe(function (querySnapshot) {
                            var newList = querySnapshot.docs.map(function (doc) {
                                var data = doc.data();
                                Object.keys(data).forEach(function (key) {
                                    var value = data[key];
                                    if (value.toDate && value.toDate instanceof Function) {
                                        data[key] = value.toDate().toISOString();
                                    }
                                });
                                return __assign({ id: doc.id }, data);
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
                        _this.resources.push(r);
                    })];
            });
        });
    };
    FirebaseClient.prototype.apiGetList = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r, data, _a, field, order, pageStart, pageEnd, dataPage, total;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _b.sent();
                        data = r.list;
                        if (params.sort != null) {
                            _a = params.sort, field = _a.field, order = _a.order;
                            if (order === "ASC") {
                                this.sortAsc(data, field);
                            }
                            else {
                                this.sortDesc(data, field);
                            }
                        }
                        pageStart = (params.pagination.page - 1) * params.pagination.perPage;
                        pageEnd = pageStart + params.pagination.perPage;
                        dataPage = data.slice(pageStart, pageEnd);
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
                        data = r.list.filter(function (val) { return val.id === params.id; });
                        if (data.length < 1) {
                            throw Error("react-admin-firebase: No id found matching: " + params.id);
                        }
                        return [2 /*return*/, { data: data[0] }];
                }
            });
        });
    };
    FirebaseClient.prototype.apiCreate = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _a.sent();
                        r.collection.add(params.data);
                        return [2 /*return*/, {
                                data: __assign({}, params.data)
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
            var r, matches, _i, _a, item, _b, _c, id;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.tryGetResource(resourceName)];
                    case 1:
                        r = _d.sent();
                        matches = [];
                        for (_i = 0, _a = r.list; _i < _a.length; _i++) {
                            item = _a[_i];
                            for (_b = 0, _c = params.ids; _b < _c.length; _b++) {
                                id = _c[_b];
                                if (id === item["id"]) {
                                    matches.push(item);
                                }
                            }
                        }
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
                        data = r.list;
                        targetField = params.target;
                        targetValue = params.id;
                        matches = data.filter(function (val) { return val[targetField] === targetValue; });
                        if (params.sort != null) {
                            _a = params.sort, field = _a.field, order = _a.order;
                            if (order === "ASC") {
                                this.sortAsc(matches, field);
                            }
                            else {
                                this.sortDesc(matches, field);
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
        var matches = this.resources.filter(function (val) {
            return val.path === resourceName;
        });
        if (matches.length < 1) {
            throw new Error("react-admin-firebase: Cant find resource with id");
        }
        var match = matches[0];
        return match;
    };
    FirebaseClient.prototype.sortAsc = function (data, field) {
        data.sort(function (a, b) {
            var aValue = a[field] ? a[field].toString().toLowerCase() : "";
            var bValue = b[field] ? b[field].toString().toLowerCase() : "";
            if (aValue > bValue) {
                return -1;
            }
            if (aValue < bValue) {
                return 1;
            }
            return 0;
        });
    };
    FirebaseClient.prototype.sortDesc = function (data, field) {
        data.sort(function (a, b) {
            var aValue = a[field] ? a[field].toString().toLowerCase() : "";
            var bValue = b[field] ? b[field].toString().toLowerCase() : "";
            if (aValue < bValue) {
                return -1;
            }
            if (aValue > bValue) {
                return 1;
            }
            return 0;
        });
    };
    FirebaseClient.prototype.setList = function (newList, resourceName) {
        return this.tryGetResource(resourceName).then(function (resource) {
            resource.list = newList;
        });
    };
    FirebaseClient.prototype.tryGetResource = function (resourceName) {
        return __awaiter(this, void 0, void 0, function () {
            var matches, match;
            return __generator(this, function (_a) {
                matches = this.resources.filter(function (val) {
                    return val.path === resourceName;
                });
                if (matches.length < 1) {
                    throw new Error("react-admin-firebase: Cant find resource with id");
                }
                match = matches[0];
                return [2 /*return*/, match];
            });
        });
    };
    FirebaseClient.prototype.getCollectionObservable = function (collection) {
        var observable = rxjs_1.Observable.create(function (observer) {
            return collection.onSnapshot(observer);
        });
        // LOGGING
        // observable.subscribe((querySnapshot: firebase.firestore.QuerySnapshot) => {
        //   console.log("react-admin-firebase: Observable List Changed:", querySnapshot);
        // });
        return observable;
    };
    return FirebaseClient;
}());
function FirebaseProvider(config) {
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
