"use strict";
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
require("firebase/auth");
var react_admin_1 = require("react-admin");
function log(description, obj) {
    if (ISDEBUG) {
        console.log('FirebaseAuthProvider: ' + description, obj);
    }
}
var ISDEBUG = false;
var AuthClient = /** @class */ (function () {
    function AuthClient(firebaseConfig) {
        log("Auth Client: initializing...");
        if (!firebase.apps.length) {
            this.app = firebase.initializeApp(firebaseConfig);
        }
        else {
            this.app = firebase.app();
        }
        this.auth = firebase.auth();
    }
    AuthClient.prototype.HandleAuthLogin = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var username, password, user, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        username = params.username, password = params.password;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.auth.signInWithEmailAndPassword(username, password)];
                    case 2:
                        user = _a.sent();
                        log("HandleAuthLogin: user sucessfully logged in", { user: user });
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        log("HandleAuthLogin: invalid credentials", { params: params });
                        throw new Error("Login error: invalid credentials");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuthClient.prototype.HandleAuthLogout = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.auth.signOut()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthClient.prototype.HandleAuthError = function (params) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    AuthClient.prototype.HandleAuthCheck = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var user, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getUserLogin()];
                    case 1:
                        user = _a.sent();
                        log("HandleAuthCheck: user is still logged in", { user: user });
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        log("HandleAuthCheck: ", { e: e_2 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthClient.prototype.getUserLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.auth.onAuthStateChanged(function (user) {
                            if (user) {
                                resolve(user);
                            }
                            else {
                                reject("User not logged in");
                            }
                        });
                    })];
            });
        });
    };
    return AuthClient;
}());
function SetUpAuth(config) {
    var _this = this;
    if (!config) {
        throw new Error('Please pass the Firebase config.json object to the FirebaseAuthProvider');
    }
    ISDEBUG = config['debug'];
    var auth = new AuthClient(config);
    return function (type, params) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    log("Auth Event: ", { type: type, params: params });
                    _a = type;
                    switch (_a) {
                        case react_admin_1.AUTH_LOGIN: return [3 /*break*/, 1];
                        case react_admin_1.AUTH_LOGOUT: return [3 /*break*/, 3];
                        case react_admin_1.AUTH_ERROR: return [3 /*break*/, 5];
                        case react_admin_1.AUTH_CHECK: return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 1: return [4 /*yield*/, auth.HandleAuthLogin(params)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 3: return [4 /*yield*/, auth.HandleAuthLogout(params)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 5: return [4 /*yield*/, auth.HandleAuthError(params)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, auth.HandleAuthCheck(params)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 9: throw new Error("Unhandled auth type:" + type);
                case 10: return [2 /*return*/];
            }
        });
    }); };
}
exports.default = SetUpAuth;
//# sourceMappingURL=firebaseAuthProvider.js.map