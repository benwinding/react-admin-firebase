// From firebase SDK

import { logError } from './logger';

// tslint:disable-next-line:max-line-length
// - https://github.com/firebase/firebase-js-sdk/blob/9f109f85ad0d99f6c13e68dcb549a0b852e35a2a/packages/functions/src/api/error.ts
export function retrieveStatusTxt(status: number): 'ok' | 'unauthenticated' {
  // Make sure any successful status is OK.
  if (status >= 200 && status < 300) {
    return 'ok';
  }
  switch (status) {
    case 401: // 'unauthenticated'
    case 403: // 'permission-denied'
      return 'unauthenticated';

    case 0: // 'internal'
    case 400: // 'invalid-argument'
    case 404: // 'not-found'
    case 409: // 'aborted'
    case 429: // 'resource-exhausted'
    case 499: // 'cancelled'
    case 500: // 'internal'
    case 501: // 'unimplemented'
    case 503: // 'unavailable'
    case 504: // 'deadline-exceeded'
    default:
      // ignore
      return 'ok';
  }
}

// From firebase SDK
// tslint:disable-next-line:max-line-length
// - https://github.com/firebase/firebase-js-sdk/blob/9f109f85ad0d99f6c13e68dcb549a0b852e35a2a/packages/functions/src/api/error.ts
export function retrieveStatusCode(statusTxt: string): number {
  // Make sure any successful status is OK.
  const regexResult = /\[code\=([\w-]*)/g.exec(statusTxt);
  const status = Array.isArray(regexResult) && regexResult[1];
  if (!status) {
    logError('unknown StatusCode ', { statusTxt });
  }
  switch (status) {
    case 'unauthenticated':
      return 401;
    case 'permission-denied':
      return 403;
    case 'internal':
      return 0;
    case 'invalid-argument':
      return 400;
    case 'not-found':
      return 404;
    case 'aborted':
      return 409;
    case 'resource-exhausted':
      return 429;
    case 'cancelled':
      return 499;
    case 'internal':
      return 500;
    case 'unimplemented':
      return 501;
    case 'unavailable':
      return 503;
    case 'deadline-exceeded':
      return 504;
    default:
      return 200;
  }
}
