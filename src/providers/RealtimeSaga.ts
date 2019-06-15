import realtimeSaga from "ra-realtime";
import { fb } from "./DataProvider";
import { RAFirebaseOptions } from "index";

const observeRequest = (dataProvider, options?: RAFirebaseOptions) => (type, resource, params) => {
  const safeOptions = options || {};
  if (Array.isArray(safeOptions.watch)) {
    const mustWatchResource = safeOptions.watch.includes(resource);
    if (!mustWatchResource) {
      return;
    }
  }
  if (Array.isArray(safeOptions.dontwatch)) {
    const mustNotWatchResource = safeOptions.dontwatch.includes(resource);
    if (mustNotWatchResource) {
      return;
    }
  }

  return {
    subscribe(observer) {
      const resourceObj = fb.GetResource(resource);
      const sub = resourceObj.observable.subscribe(() => {
        dataProvider(type, resource, params)
          .then((results) => observer.next(results)) // New data received, notify the observer
          .catch((error) => observer.error(error)); // Ouch, an error occured, notify the observer
      });

      const subscription = {
        unsubscribe() {
          sub.unsubscribe();
          // Notify the saga that we cleaned up everything
          // observer.complete();
          // ^ THIS FAILS FRAMEWORK ISSUE
        }
      };

      return subscription;
    }
  };
};

export function RealtimeSaga(dataProvider, options) {
  return realtimeSaga(observeRequest(dataProvider, options));
}
