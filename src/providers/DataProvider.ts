import {
  getAbsolutePath,
  log,
  logError,
  logger,
  MakeFirestoreLogger,
  retrieveStatusCode,
} from '../misc';
import { FireApp } from '../misc/firebase-models';
import * as ra from '../misc/react-admin-models';
import { Create, Delete, DeleteMany, Update, UpdateMany } from './commands';
import { FirebaseWrapper } from './database/firebase/FirebaseWrapper';
import { FireClient } from './database/FireClient';
import { RAFirebaseOptions } from './options';
import { GetList, GetMany, GetManyReference, GetOne } from './queries';

export interface IDataProvider extends ra.DataProvider {
  app: FireApp;
}

export function DataProvider(
  firebaseConfig: {},
  optionsInput?: RAFirebaseOptions
): IDataProvider {
  const options = optionsInput || {};
  verifyDataProviderArgs(firebaseConfig, options);

  const flogger = MakeFirestoreLogger(options);
  logger.SetEnabled(!!options?.logging);
  flogger.SetEnabled(!!options?.firestoreCostsLogger?.enabled);
  flogger.ResetCount(!options?.firestoreCostsLogger?.persistCount);
  log('Creating FirebaseDataProvider', {
    firebaseConfig,
    options,
  });

  const fireWrapper = new FirebaseWrapper(optionsInput, firebaseConfig);

  async function run<T>(cb: () => Promise<T>) {
    let res: any;
    try {
      res = await cb();
      return res;
    } catch (error) {
      const errorMsg = ((error as any) || '').toString();
      const code = retrieveStatusCode(errorMsg);
      const errorObj = { status: code, message: errorMsg, json: res };
      logError('DataProvider:', error, { errorMsg, code, errorObj });
      throw errorObj;
    }
  }
  const client = new FireClient(fireWrapper, options, flogger);

  const newProviderApi: IDataProvider = {
    app: fireWrapper.GetApp(),
    getList<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.GetListParams
    ): Promise<ra.GetListResult<RecordType>> {
      return run(() => GetList<RecordType>(resource, params, client));
    },
    getOne<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.GetOneParams
    ): Promise<ra.GetOneResult<RecordType>> {
      return run(() => GetOne<RecordType>(resource, params, client));
    },
    getMany<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.GetManyParams
    ): Promise<ra.GetManyResult<RecordType>> {
      return run(() => GetMany<RecordType>(resource, params, client));
    },
    getManyReference<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.GetManyReferenceParams
    ): Promise<ra.GetManyReferenceResult<RecordType>> {
      return run(() => GetManyReference<RecordType>(resource, params, client));
    },
    update<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.UpdateParams
    ): Promise<ra.UpdateResult<RecordType>> {
      return run(() => Update<RecordType>(resource, params, client));
    },
    updateMany(
      resource: string,
      params: ra.UpdateManyParams
    ): Promise<ra.UpdateManyResult> {
      return run(() => UpdateMany(resource, params, client));
    },
    create<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.CreateParams
    ): Promise<ra.CreateResult<RecordType>> {
      return run(() => Create<RecordType>(resource, params, client));
    },
    delete<RecordType extends ra.Record = ra.Record>(
      resource: string,
      params: ra.DeleteParams
    ): Promise<ra.DeleteResult<RecordType>> {
      return run(() => Delete(resource, params, client));
    },
    deleteMany(
      resource: string,
      params: ra.DeleteManyParams
    ): Promise<ra.DeleteManyResult> {
      return run(() => DeleteMany(resource, params, client));
    },
  };

  return newProviderApi;
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
  if (options && options.rootRef) {
    // Will throw error if rootRef doesn't point to a document
    getAbsolutePath(options.rootRef, 'test');
  }
}
