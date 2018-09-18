"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// In createRealtimeSaga.js
var _1 = require("./");
var observeRequest = function (firebaseProvider) { return function (type, resource, params) {
    console.log("REALTIME!!", { type: type, resource: resource, params: params });
    // Filtering so that only posts are updated in real time
    // Use your apollo client methods here or sockets or whatever else including the following very naive polling mechanism
    return {
        subscribe: function (observer) {
            var r = _1.fb.GetResource(resource);
            // const subscription = r.realtimeObservable.subscribe((newList) => {
            //   observer.next(newList);
            // });
            var sub = {
            // unsubscribe() {
            //   subscription.unsubscribe();
            //   // Notify the saga that we cleaned up everything
            //   observer.complete();
            // }
            };
            return sub;
        }
    };
}; };
exports.default = (function (dataProvider) {
    console.log({ dataProvider: dataProvider });
    return observeRequest(dataProvider);
});
