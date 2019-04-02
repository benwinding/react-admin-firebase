"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ra_realtime_1 = require("ra-realtime");
var firebaseDataProvider_1 = require("./firebaseDataProvider");
var observeRequest = function (dataProvider, options) { return function (type, resource, params) {
    // If the paths are explicitly set in options
    if (options && Array.isArray(options.watch) && !options.watch.includes(resource)) {
        // Then don't observe it, if it's not set
        return;
    }
    if (options && Array.isArray(options.dontwatch) && options.dontwatch.includes(resource)) {
        // Then don't observe it, if it's not set
        return;
    }
    // Use your apollo client methods here or sockets or whatever else including the following very naive polling mechanism
    return {
        subscribe: function (observer) {
            var resourceObj = firebaseDataProvider_1.fb.GetResource(resource);
            var sub = resourceObj.observable.subscribe(function () {
                dataProvider(type, resource, params)
                    .then(function (results) { return observer.next(results); }) // New data received, notify the observer
                    .catch(function (error) { return observer.error(error); }); // Ouch, an error occured, notify the observer
            });
            var subscription = {
                unsubscribe: function () {
                    sub.unsubscribe();
                    // Notify the saga that we cleaned up everything
                    // observer.complete();
                    // ^ THIS FAILS FRAMEWORK ISSUE
                }
            };
            return subscription;
        }
    };
}; };
exports.default = (function (dataProvider, options) {
    return ra_realtime_1.default(observeRequest(dataProvider, options));
});
//# sourceMappingURL=firebaseRealtimeSaga.js.map