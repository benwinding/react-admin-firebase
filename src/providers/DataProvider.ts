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
} from "react-admin";
import { getAbsolutePath, log, CheckLogging } from "../misc";
import { RAFirebaseOptions } from "./RAFirebaseOptions";
import { FirebaseClient } from "./database/FirebaseClient";
import { FirebaseWrapper } from "./database/firebase/FirebaseWrapper";

export let fb: FirebaseClient;

export function DataProvider(firebaseConfig: {}, optionsInput?: RAFirebaseOptions) {
  const options = optionsInput || {};
  VerifyDataProviderArgs(firebaseConfig, options);
  CheckLogging(firebaseConfig, options);

  log("react-admin-firebase:: Creating FirebaseDataProvider", { firebaseConfig, options });
  const fireWrapper = new FirebaseWrapper();
  fireWrapper.init(firebaseConfig, optionsInput);
  fb = new FirebaseClient(fireWrapper, options);
  async function providerApi(type: string, resourceName: string, params: any): Promise<any> {
    log("FirebaseDataProvider: event", { type, resourceName, params });
    switch (type) {
      case GET_MANY:
        return fb.apiGetMany(resourceName, params);
      case GET_MANY_REFERENCE:
        return fb.apiGetManyReference(resourceName, params);
      case GET_LIST:
        return fb.apiGetList(resourceName, params);
      case GET_ONE:
        return fb.apiGetOne(resourceName, params);
      case CREATE:
        return fb.apiCreate(resourceName, params);
      case UPDATE:
        return fb.apiUpdate(resourceName, params);
      case UPDATE_MANY:
        return fb.apiUpdateMany(resourceName, params);
      case DELETE:
        return fb.apiDelete(resourceName, params);
      case DELETE_MANY:
        return fb.apiDeleteMany(resourceName, params);
      default:
        return {};
    }
  }
  return providerApi;
}

function VerifyDataProviderArgs(firebaseConfig: {}, options?: RAFirebaseOptions) {
  const hasNoApp = !options || !options.app;
  const hasNoConfig = !firebaseConfig;
  if (hasNoConfig && hasNoApp) {
    throw new Error(
      "Please pass the Firebase firebaseConfig object or options.app to the FirebaseAuthProvider"
    );
  }
  if (options.rootRef) {
    // Will throw error if rootRef doesn't point to a document
    getAbsolutePath(options.rootRef, 'test');
  }
}