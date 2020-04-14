import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  UPDATE_MANY,
} from "react-admin";
import { getAbsolutePath, log, CheckLogging, messageTypes } from "../misc";
import { RAFirebaseOptions } from "./RAFirebaseOptions";
import { FirebaseClient } from "./database/FirebaseClient";
import { FirebaseWrapper } from "./database/firebase/FirebaseWrapper";

import { HttpError } from "react-admin";

export let fb: FirebaseClient;

export function DataProvider(
  firebaseConfig: {},
  optionsInput?: RAFirebaseOptions
) {
  const options = optionsInput || {};
  VerifyDataProviderArgs(firebaseConfig, options);
  CheckLogging(firebaseConfig, options);

  log("react-admin-firebase:: Creating FirebaseDataProvider", {
    firebaseConfig,
    options,
  });
  const fireWrapper = new FirebaseWrapper();
  fireWrapper.init(firebaseConfig, optionsInput);
  fb = new FirebaseClient(fireWrapper, options);
  async function providerApi(
    type: string,
    resourceName: string,
    params: any
  ): Promise<messageTypes.IResponseAny> {
    log("FirebaseDataProvider: event", { type, resourceName, params });
    let res: messageTypes.IResponseAny;
    try {
      switch (type) {
        case GET_MANY:
          res = await fb.apiGetMany(resourceName, params);
          break;
        case GET_MANY_REFERENCE:
          res = await fb.apiGetManyReference(resourceName, params);
          break;
        case GET_LIST:
          res = await fb.apiGetList(resourceName, params);
          break;
        case GET_ONE:
          res = await fb.apiGetOne(resourceName, params);
          break;
        case CREATE:
          res = await fb.apiCreate(resourceName, params);
          break;
        case UPDATE:
          res = await fb.apiUpdate(resourceName, params);
          break;
        case UPDATE_MANY:
          res = await fb.apiUpdateMany(resourceName, params);
          break;
        case DELETE:
          res = await fb.apiDelete(resourceName, params);
          break;
        case DELETE_MANY:
          res = await fb.apiDeleteMany(resourceName, params);
          break;
        default:
          throw new Error(`Unknkown dataprovider command type: "${type}"`);
      }
      return res;
    } catch (error) {
      // TODO: Determine if Auth Error
      throw { status: 409, message: error.toString(), json: res };
    }
  }
  return providerApi;
}

function VerifyDataProviderArgs(
  firebaseConfig: {},
  options?: RAFirebaseOptions
) {
  const hasNoApp = !options || !options.app;
  const hasNoConfig = !firebaseConfig;
  if (hasNoConfig && hasNoApp) {
    throw new Error(
      "Please pass the Firebase firebaseConfig object or options.app to the FirebaseAuthProvider"
    );
  }
  if (options.rootRef) {
    // Will throw error if rootRef doesn't point to a document
    getAbsolutePath(options.rootRef, "test");
  }
}
