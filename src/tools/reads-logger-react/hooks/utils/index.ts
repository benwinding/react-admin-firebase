import { initFirebaseReadsLoggerSubscriptions } from './initFirebaseReadsLoggerSubscriptions';
import { cleanFirebaseReadsLoggerSubscriptions } from './cleanFirebaseReadsLoggerSubscriptions';

export namespace effectUtils {
  export const init = initFirebaseReadsLoggerSubscriptions;
  export const clean = cleanFirebaseReadsLoggerSubscriptions;
}
