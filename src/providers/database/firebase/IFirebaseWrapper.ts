import firebase from 'firebase/compat';
import {
  FireApp,
  FireAuth,
  FireAuthUserCredentials,
  FireStorage,
  FireStoragePutFileResult,
  FireStore,
  FireStoreBatch,
  FireStoreCollectionRef,
  FireStoreTimeStamp,
  FireUser,
} from 'misc/firebase-models';
import { RAFirebaseOptions } from '../../options';

export interface IFirebaseWrapper {
  options: RAFirebaseOptions;
  putFile(storagePath: string, rawFile: any): FireStoragePutFileResult;
  getStorageDownloadUrl(fieldSrc: string): Promise<string>;

  dbGetCollection(absolutePath: string): FireStoreCollectionRef;
  dbCreateBatch(): FireStoreBatch;
  dbMakeNewId(): string;

  OnUserLogout(cb: (user: FireUser | null) => void): void;
  authSetPersistence(
    persistenceInput: 'session' | 'local' | 'none'
  ): Promise<void>;
  authGetUserLoggedIn(): Promise<FireUser>;
  authSigninEmailPassword(
    email: string,
    password: string
  ): Promise<FireAuthUserCredentials>;
  authSignOut(): Promise<void>;
  serverTimestamp(): FireStoreTimeStamp | Date;

  // Deprecated methods
  /** @deprecated */
  auth(): FireAuth;
  /** @deprecated */
  storage(): FireStorage;
  /** @deprecated */
  db(): FireStore | firebase.firestore.Firestore;
  /** @deprecated */
  GetApp(): FireApp;
  /** @deprecated */
  GetUserLogin(): Promise<FireUser>;
}
