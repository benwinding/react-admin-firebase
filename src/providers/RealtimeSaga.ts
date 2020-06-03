import realtimeSaga from 'ra-realtime';
import { RAFirebaseOptions } from './options';

const observeRequest = (dataProvider, options?: RAFirebaseOptions) => (
  type,
  resource,
  params
) => {
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
      dataProvider(type, resource, params)
        // New data received, notify the observer
        .then((results) => observer.next(results))
        // Ouch, an error occured, notify the observer
        .catch((error) => observer.error(error));

      const subscription = {
        unsubscribe() {
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
