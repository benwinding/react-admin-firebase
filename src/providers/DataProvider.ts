import { logError } from "./../misc/logger";
import {
  getAbsolutePath,
  log,
  CheckLogging,
  retrieveStatusCode,
} from "../misc";
import * as ra from "../misc/react-admin-models";
import { RAFirebaseOptions } from "./RAFirebaseOptions";
import { FirebaseClient } from "./database/FirebaseClient";
import { FirebaseWrapper } from "./database/firebase/FirebaseWrapper";

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
  async function runCommand<T>(cb: () => Promise<T>) {
    let res: any;
    try {
      res = await cb();
      return res;
    } catch (error) {
      const errorMsg = error.toString();
      const code = retrieveStatusCode(errorMsg);
      const errorObj = { status: code, message: errorMsg, json: res };
      logError("DataProvider:", error, { errorMsg, code, errorObj });
      throw errorObj;
    }
  };

  const newProviderApi: ra.DataProvider = {
    getList<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.GetListParams
    ): Promise<ra.GetListResult<RecordType>> {
      return runCommand(() => fb.apiGetList<RecordType>(resource, params));
    },
    getOne<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.GetOneParams
    ): Promise<ra.GetOneResult<RecordType>> {
      return runCommand(() => fb.apiGetOne<RecordType>(resource, params));
    },
    getMany<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.GetManyParams
    ): Promise<ra.GetManyResult<RecordType>> {
      return runCommand(() => fb.apiGetMany<RecordType>(resource, params));
    },
    getManyReference<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.GetManyReferenceParams
    ): Promise<ra.GetManyReferenceResult<RecordType>> {
      return runCommand(() =>
        fb.apiGetManyReference<RecordType>(resource, params)
      );
    },
    update<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.UpdateParams
    ): Promise<ra.UpdateResult<RecordType>> {
      return runCommand(() => fb.apiUpdate<RecordType>(resource, params));
    },
    updateMany(
      resource: string,
      params: ra.UpdateManyParams
    ): Promise<ra.UpdateManyResult> {
      return runCommand(() => fb.apiUpdateMany(resource, params));
    },
    create<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.CreateParams
    ): Promise<ra.CreateResult<RecordType>> {
      return runCommand(() => fb.apiCreate<RecordType>(resource, params));
    },
    delete<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.DeleteParams
    ): Promise<ra.DeleteResult<RecordType>> {
      if (options.softDelete)
        return runCommand(() => fb.apiSoftDelete(resource, params));
      else return runCommand(() => fb.apiDelete(resource, params));
    },
    deleteMany(
      resource: string,
      params: ra.DeleteManyParams
    ): Promise<ra.DeleteManyResult> {
      if (options.softDelete)
        return runCommand(() => fb.apiSoftDeleteMany(resource, params));
      else return runCommand(() => fb.apiDeleteMany(resource, params));
    }
  }

  return newProviderApi;
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
