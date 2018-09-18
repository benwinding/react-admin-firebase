// In createRealtimeSaga.js
import { fb } from './';

const observeRequest = (firebaseProvider: any) => (
  type: any,
  resource: any,
  params: any
) => {
  console.log("REALTIME!!", { type, resource, params });
  // Filtering so that only posts are updated in real time

  // Use your apollo client methods here or sockets or whatever else including the following very naive polling mechanism
  return {
    subscribe(observer: any) {
      const r = fb.GetResource(resource);
      // const subscription = r.realtimeObservable.subscribe((newList) => {
      //   observer.next(newList);
      // });
      const sub = {
        // unsubscribe() {
        //   subscription.unsubscribe();
        //   // Notify the saga that we cleaned up everything
        //   observer.complete();
        // }
      };
      return sub;
    }    
  };
};

export default (dataProvider: any) => {
  console.log({dataProvider});
  return observeRequest(dataProvider);
};
