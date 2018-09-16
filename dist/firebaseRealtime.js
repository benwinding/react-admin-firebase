"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// In createRealtimeSaga.js
const _1 = require("./");
const observeRequest = (firebaseProvider) => (type, resource, params) => {
    console.log("REALTIME!!", { type, resource, params });
    // Filtering so that only posts are updated in real time
    // Use your apollo client methods here or sockets or whatever else including the following very naive polling mechanism
    return {
        subscribe(observer) {
            const r = _1.fb.GetResource(resource);
            const subscription = r.realtimeObservable.subscribe((newList) => {
                observer.next(newList);
            });
            const sub = {
                unsubscribe() {
                    subscription.unsubscribe();
                    // Notify the saga that we cleaned up everything
                    observer.complete();
                }
            };
            return sub;
        }
    };
};
exports.default = (dataProvider) => {
    console.log({ dataProvider });
    return observeRequest(dataProvider);
};
