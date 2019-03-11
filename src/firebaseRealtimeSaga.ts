import realtimeSaga from "ra-realtime";
import { fb } from "./firebaseDataProvider";
import { Subscription } from "rxjs";

const observeRequest = (dataProvider, options) => (type, resourceName, params) => {
  // If the paths are explicitly set in options
  if (
    options &&
    Array.isArray(options.watch) &&
    !options.watch.includes(resourceName)
  ) {
    // Then don't observe it, if it's not set
    return;
  }
  if (
    options &&
    Array.isArray(options.dontwatch) &&
    options.dontwatch.includes(resourceName)
  ) {
    // Then don't observe it, if it's not set
    return;
  }

  // Use your apollo client methods here or sockets or whatever else including the following very naive polling mechanism
  return {
    subscribe(observer) {
      let subscription: Subscription;
      (async () => {
        const resourceObj = await fb.GetResource(resourceName);
        subscription = resourceObj.observable.subscribe(() => {
          dataProvider(type, resourceName, params)
            .then(results => observer.next(results)) // New data received, notify the observer
            .catch(error => observer.error(error)); // Ouch, an error occured, notify the observer
        });
      })();

      return {
        unsubscribe: () => {
          if (subscription) {
            subscription.unsubscribe()
          }
        }
      };
    }
  };
};

export default (dataProvider, options) => {
  return realtimeSaga(observeRequest(dataProvider, options));
};
