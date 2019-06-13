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
import { log, EnableLogging } from "../misc/logger";
import { RAFirebaseOptions } from "./RAFirebaseOptions";
import { IFirebaseWrapper } from "./database/firebase/IFirebaseWrapper";
import { FirebaseClient } from "./database/FirebaseClient";
import { FirebaseWrapper } from "./database/firebase/FirebaseWrapper";

export let fb: FirebaseClient;

export function DataProvider(config: {}, options?: RAFirebaseOptions) {
  if (!config) {
    throw new Error("Please pass the Firebase config.json object to the FirebaseDataProvider");
  }
  console.log("react-admin-firebase:: Creating FirebaseDataProvider", { config, options });
  const optionsSafe = options || {};
  if (config["debug"] || optionsSafe.logging) {
    EnableLogging();
  }
  const fireWrapper: IFirebaseWrapper = new FirebaseWrapper();
  fireWrapper.init(config);
  fb = new FirebaseClient(fireWrapper, optionsSafe);
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
