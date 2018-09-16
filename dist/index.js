"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = require("firebase");
const react_admin_1 = require("react-admin");
const rxjs_1 = require("rxjs");
class FirebaseClient {
    constructor(firebaseConfig) {
        this.firebaseConfig = firebaseConfig;
        this.resources = [];
        this.app = firebase.initializeApp(this.firebaseConfig);
        this.db = this.app.firestore();
    }
    initPath(inputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                if (inputPath == null) {
                    return;
                }
                const path = inputPath;
                const collection = this.db.collection(path);
                const observable = this.getCollectionObservable(collection);
                const realtimeObservable = new rxjs_1.Subject();
                observable.subscribe((querySnapshot) => {
                    const newList = querySnapshot.docs.map((doc) => {
                        return Object.assign({}, doc.data(), { id: doc.id });
                    });
                    realtimeObservable.next(newList);
                    this.setList(newList, path);
                    // The data has been set, so resolve the promise
                    resolve();
                });
                const list = [];
                const r = {
                    collection,
                    list,
                    observable,
                    path,
                    realtimeObservable
                };
                this.resources.push(r);
            });
        });
    }
    apiGetList(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.tryGetResource(resourceName);
            const data = r.list;
            if (params.sort != null) {
                const { field, order } = params.sort;
                if (order === "ASC") {
                    this.sortAsc(data, field);
                }
                else {
                    this.sortDesc(data, field);
                }
            }
            const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
            const pageEnd = pageStart + params.pagination.perPage;
            const dataPage = data.slice(pageStart, pageEnd);
            const total = r.list.length;
            return {
                data: dataPage,
                total
            };
        });
    }
    apiGetOne(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.tryGetResource(resourceName);
            const data = r.list.filter((val) => val.id === params.id);
            if (data.length < 1) {
                throw Error("No id found matching: " + params.id);
            }
            return { data: data[0] };
        });
    }
    apiCreate(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.tryGetResource(resourceName);
            const docRef = yield r.collection.add(params.data);
            return {
                data: Object.assign({}, params.data, { id: docRef.id })
            };
        });
    }
    apiUpdate(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = params.id;
            delete params.data.id;
            const r = yield this.tryGetResource(resourceName);
            r.collection.doc(id).set(params.data);
            return {
                data: Object.assign({}, params.data, { id })
            };
        });
    }
    apiUpdateMany(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            delete params.data.id;
            const r = yield this.tryGetResource(resourceName);
            const returnData = [];
            for (const id of params.ids) {
                r.collection.doc(id).set(params.data);
                returnData.push(Object.assign({}, params.data, { id }));
            }
            return {
                data: returnData
            };
        });
    }
    apiDelete(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.tryGetResource(resourceName);
            r.collection.doc(params.id).delete();
            return {
                data: params.previousData
            };
        });
    }
    apiDeleteMany(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.tryGetResource(resourceName);
            const returnData = [];
            const batch = this.db.batch();
            for (const id of params.ids) {
                batch.delete(r.collection.doc(id));
                returnData.push({ id });
            }
            batch.commit();
            return { data: returnData };
        });
    }
    apiGetMany(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.tryGetResource(resourceName);
            const matches = [];
            for (const item of r.list) {
                for (const id of params.ids) {
                    if (id === item["id"]) {
                        matches.push(item);
                    }
                }
            }
            return {
                data: matches
            };
        });
    }
    apiGetManyReference(resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.tryGetResource(resourceName);
            const data = r.list;
            const targetField = params.target;
            const targetValue = params.id;
            const matches = data.filter(val => val[targetField] === targetValue);
            if (params.sort != null) {
                const { field, order } = params.sort;
                if (order === "ASC") {
                    this.sortAsc(matches, field);
                }
                else {
                    this.sortDesc(matches, field);
                }
            }
            const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
            const pageEnd = pageStart + params.pagination.perPage;
            const dataPage = matches.slice(pageStart, pageEnd);
            const total = matches.length;
            return { data: dataPage, total };
        });
    }
    GetResource(resourceName) {
        const matches = this.resources.filter(val => {
            return val.path === resourceName;
        });
        if (matches.length < 1) {
            throw new Error("Cant find resource with id");
        }
        const match = matches[0];
        return match;
    }
    sortAsc(data, field) {
        data.sort((a, b) => {
            const aValue = a[field] ? a[field].toString().toLowerCase() : "";
            const bValue = b[field] ? b[field].toString().toLowerCase() : "";
            if (aValue > bValue) {
                return -1;
            }
            if (aValue < bValue) {
                return 1;
            }
            return 0;
        });
    }
    sortDesc(data, field) {
        data.sort((a, b) => {
            const aValue = a[field] ? a[field].toString().toLowerCase() : "";
            const bValue = b[field] ? b[field].toString().toLowerCase() : "";
            if (aValue < bValue) {
                return -1;
            }
            if (aValue > bValue) {
                return 1;
            }
            return 0;
        });
    }
    setList(newList, resourceName) {
        return this.tryGetResource(resourceName).then((resource) => {
            resource.list = newList;
        });
    }
    tryGetResource(resourceName) {
        return __awaiter(this, void 0, void 0, function* () {
            const matches = this.resources.filter(val => {
                return val.path === resourceName;
            });
            if (matches.length < 1) {
                throw new Error("Cant find resource with id");
            }
            const match = matches[0];
            return match;
        });
    }
    getCollectionObservable(collection) {
        const observable = rxjs_1.Observable.create((observer) => collection.onSnapshot(observer));
        observable.subscribe((querySnapshot) => {
            console.log("Observable List Changed:", querySnapshot);
        });
        return observable;
    }
}
function FirebaseProvider(config) {
    exports.fb = new FirebaseClient(config);
    function providerApi(type, resourceName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exports.fb.initPath(resourceName);
            switch (type) {
                case react_admin_1.GET_MANY:
                    return exports.fb.apiGetMany(resourceName, params);
                case react_admin_1.GET_MANY_REFERENCE:
                    return exports.fb.apiGetManyReference(resourceName, params);
                case react_admin_1.GET_LIST:
                    return exports.fb.apiGetList(resourceName, params);
                case react_admin_1.GET_ONE:
                    return exports.fb.apiGetOne(resourceName, params);
                case react_admin_1.CREATE:
                    return exports.fb.apiCreate(resourceName, params);
                case react_admin_1.UPDATE:
                    return exports.fb.apiUpdate(resourceName, params);
                case react_admin_1.UPDATE_MANY:
                    return exports.fb.apiUpdateMany(resourceName, params);
                case react_admin_1.DELETE:
                    return exports.fb.apiDelete(resourceName, params);
                case react_admin_1.DELETE_MANY:
                    return exports.fb.apiDeleteMany(resourceName, params);
                default:
                    return {};
            }
        });
    }
    return providerApi;
}
exports.FirebaseProvider = FirebaseProvider;
