import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  UPDATE_MANY
} from 'react-admin';
import {
  getAbsolutePath,
  log,
  logError,
  checkLogging,
  messageTypes,
  retrieveStatusCode
} from '../misc';
import { RAFirebaseOptions } from './options';
import { FirebaseClient } from './database/FirebaseClient';
import { FirebaseWrapper } from './database/firebase/FirebaseWrapper';

export let fb: FirebaseClient;

export function DataProvider(
  firebaseConfig: {},
  optionsInput?: RAFirebaseOptions
) {
  const options = optionsInput || {};
  verifyDataProviderArgs(firebaseConfig, options);
  checkLogging(firebaseConfig, options);

  log('Creating FirebaseDataProvider', {
    firebaseConfig,
    options
  });

  const fireWrapper = new FirebaseWrapper();
  fireWrapper.init(firebaseConfig, optionsInput);

  fb = new FirebaseClient(fireWrapper, options);
  async function providerApi(
    type: string,
    resourceName: string,
    params: any
  ): Promise<messageTypes.IResponseAny> {
    log('FirebaseDataProvider: event', { type, resourceName, params });

    try {
      switch (type) {
        case GET_MANY:
          return await fb.apiGetMany(resourceName, params);
        case GET_MANY_REFERENCE:
          return await fb.apiGetManyReference(resourceName, params);
        case GET_LIST:
          return await fb.apiGetList(resourceName, params);
        case GET_ONE:
          return await fb.apiGetOne(resourceName, params);
        case CREATE:
          return await fb.apiCreate(resourceName, params);
        case UPDATE:
          return await fb.apiUpdate(resourceName, params);
        case UPDATE_MANY:
          return await fb.apiUpdateMany(resourceName, params);
        case DELETE:
          return options.softDelete ?
            await fb.apiSoftDelete(resourceName, params) :
            await fb.apiDelete(resourceName, params);
        case DELETE_MANY:
          return options.softDelete ?
            await fb.apiSoftDeleteMany(resourceName, params) :
            await fb.apiDeleteMany(resourceName, params);
        default:
          throw new Error(
            `Unknown FirebaseDataProvider command type: "${type}"`
          );
      }
    } catch (error) {
      const errorMsg = error.toString();
      const code = errorMsg ? retrieveStatusCode(errorMsg) : null;
      const errorObj = { status: code, message: errorMsg };
      logError('DataProviderError:', error, { errorMsg, code, errorObj });
      throw errorObj;
    }
  }
  return providerApi;
}

function verifyDataProviderArgs(
  firebaseConfig: {},
  options?: RAFirebaseOptions
) {
  const hasNoApp = !options || !options.app;
  const hasNoConfig = !firebaseConfig;
  if (hasNoConfig && hasNoApp) {
    throw new Error(
      'Please pass the Firebase firebaseConfig object or options.app to the FirebaseAuthProvider'
    );
  }
  if (options.rootRef) {
    // Will throw error if rootRef doesn't point to a document
    getAbsolutePath(options.rootRef, 'test');
  }
}
