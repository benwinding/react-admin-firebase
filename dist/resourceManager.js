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
var rxjs_1 = require("rxjs");
var ResourceManager = /** @class */ (function () {
    function ResourceManager(db) {
        this.db = db;
        this.resourcesRoot = {};
        this.resourcesNested = {};
    }
    ResourceManager.prototype.TryGetResource = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var isNested;
            return __generator(this, function (_a) {
                isNested = this.IsNested(resourceName);
                if (isNested) {
                    return [2 /*return*/, this.TryGetNestedResource(resourceName, params)];
                }
                else {
                    return [2 /*return*/, this.TryGetRootResource(resourceName)];
                }
                return [2 /*return*/];
            });
        });
    };
    ResourceManager.prototype.TryGetRootResource = function (resourceName) {
        return __awaiter(this, void 0, void 0, function () {
            var firebasePath, resource, resourceAfterinit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        firebasePath = resourceName;
                        resource = this.resourcesRoot[firebasePath];
                        if (resource) {
                            return [2 /*return*/, resource];
                        }
                        return [4 /*yield*/, this.InitResource(firebasePath)];
                    case 1:
                        _a.sent();
                        resourceAfterinit = this.resourcesRoot[firebasePath];
                        if (resourceAfterinit) {
                            return [2 /*return*/, resourceAfterinit];
                        }
                        throw new Error("react-admin-firebase: the resource \"" + resourceName + "\" could not be inited");
                }
            });
        });
    };
    ResourceManager.prototype.IsNested = function (resourceName) {
        return resourceName.includes("*");
    };
    ResourceManager.prototype.TryGetNestedResource = function (resourceName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var firebasePath, resource, resourceAfterinit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        firebasePath = this.getFirebasePath(resourceName, params);
                        resource = this.resourcesNested[firebasePath];
                        if (resource) {
                            return [2 /*return*/, resource];
                        }
                        return [4 /*yield*/, this.InitNestedResource(firebasePath)];
                    case 1:
                        _a.sent();
                        resourceAfterinit = this.resourcesNested[firebasePath];
                        if (resourceAfterinit) {
                            return [2 /*return*/, resourceAfterinit];
                        }
                        throw new Error("react-admin-firebase: the nested resource \"" + firebasePath + "\" could not be inited");
                }
            });
        });
    };
    ResourceManager.prototype.InitResource = function (resourceName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var path = resourceName;
                        var collection = _this.db.collection(path);
                        var observable = _this.getCollectionObservable(collection);
                        var subscription = observable.subscribe(function (querySnapshot) {
                            var newList = querySnapshot.docs.map(function (doc) {
                                return _this.parseFireStoreDocument(doc);
                            });
                            _this.resourcesRoot[path].list = newList;
                            // The data has been set, so resolve the promise
                            resolve();
                        });
                        var list = [];
                        var r = {
                            collection: collection,
                            list: list,
                            observable: observable,
                            path: path,
                            subscription: subscription
                        };
                        _this.resourcesRoot[path] = r;
                        console.log("initPath", {
                            path: path,
                            r: r,
                            "this.resourcesRoot": _this.resourcesRoot
                        });
                    })];
            });
        });
    };
    ResourceManager.prototype.InitNestedResource = function (firebasePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var path = firebasePath;
                        var collection = _this.db.collection(path);
                        var observable = _this.getCollectionObservable(collection);
                        var subscription = observable.subscribe(function (querySnapshot) {
                            var newList = querySnapshot.docs.map(function (doc) {
                                return _this.parseFireStoreDocument(doc);
                            });
                            _this.resourcesNested[path].list = newList;
                            // The data has been set, so resolve the promise
                            resolve();
                        });
                        var list = [];
                        var r = {
                            collection: collection,
                            list: list,
                            observable: observable,
                            path: path,
                            subscription: subscription
                        };
                        _this.resourcesNested[path] = r;
                        console.log("initPath", {
                            path: path,
                            r: r,
                            "this.resourcesNested": _this.resourcesNested
                        });
                    })];
            });
        });
    };
    ResourceManager.prototype.parseFireStoreDocument = function (doc) {
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
    ResourceManager.prototype.getFirebasePath = function (resourceName, params) {
        return this.getNestedPath(resourceName, params).join("/");
    };
    ResourceManager.prototype.getReactAdminPath = function (resourceName, params) {
        return this.getNestedPath(resourceName, params).join("");
    };
    ResourceManager.prototype.getNestedPath = function (resourceName, params) {
        var resourcePaths = resourceName.split("*");
        var resourceId1 = params.id;
        return [resourcePaths[0], resourceId1, resourcePaths[1]];
    };
    ResourceManager.prototype.getCollectionObservable = function (collection) {
        var observable = rxjs_1.Observable.create(function (observer) { return collection.onSnapshot(observer); });
        // LOGGING
        return observable;
    };
    return ResourceManager;
}());
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=resourceManager.js.map