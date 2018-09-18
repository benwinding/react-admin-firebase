import realtimeSaga from "ra-realtime";
import {
  fb
} from './index';

const observeRequest = (dataProvider, options) => (type, resource, params) => {  
  // If the paths are explicitly set in options
  if (options && Array.isArray(options.observe) && !options.observe.includes(resource)) {
    // Then don't observe it, if it's not set
    return;
  }

  // Use your apollo client methods here or sockets or whatever else including the following very naive polling mechanism
  return {
    subscribe(observer) {
      const resourceObj = fb.GetResource(resource);
      const sub = resourceObj.observable.subscribe(() => {
        dataProvider(type, resource, params)
          .then(results => observer.next(results)) // New data received, notify the observer
          .catch(error => observer.error(error)); // Ouch, an error occured, notify the observer
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

export default (dataProvider, options) => {
  return realtimeSaga(observeRequest(dataProvider, options));
}
