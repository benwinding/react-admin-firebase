import { RAFirebaseOptions } from "../../options";
import {
  FireApp,
  FireAuth,
  FireUser,
  FireAuthUserCredentials,
  FireStorage,
  FireStore,
  FireStoreTimeStamp,
  FireStoragePutFileResult,
  FireStoreCollectionRef,
  FireStoreBatch
} from "misc/firebase-models";

export interface IFirebaseWrapper {
  options: RAFirebaseOptions;
  putFile(storagePath: string, rawFile: any): FireStoragePutFileResult;
  getStorageDownloadUrl(fieldSrc: string): Promise<string>;
  
  dbGetCollection(absolutePath: string): FireStoreCollectionRef;
  dbCreateBatch(): FireStoreBatch;
  dbMakeNewId(): string;
  
  OnUserLogout(cb: (user: FireUser | null) => void): void;
  authSetPersistence(persistenceInput: 'session' | 'local' | 'none'): Promise<void>;
  authGetUserLoggedIn(): Promise<FireUser>;
  authSigninEmailPassword(email: string, password: string): Promise<FireAuthUserCredentials>;
  authSignOut(): Promise<void>;
  serverTimestamp(): FireStoreTimeStamp | Date;

  // Deprecated methods

  /** @deprecated */
  auth(): FireAuth;
  /** @deprecated */
  storage(): FireStorage;
  /** @deprecated */
  db(): FireStore;
  /** @deprecated */
  GetApp(): FireApp;
  /** @deprecated */
  GetUserLogin(): Promise<FireUser>;
}
