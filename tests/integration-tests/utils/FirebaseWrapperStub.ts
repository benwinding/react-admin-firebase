import { getAuth } from 'firebase/auth';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { RAFirebaseOptions } from '../../../src';
import {
  FireApp,
  FireAuth,
  FireAuthUserCredentials,
  FireStorage,
  FireStoragePutFileResult,
  FireStore,
  FireStoreBatch,
  FireStoreCollectionRef,
  FireUploadTaskSnapshot,
  FireUser,
} from '../../../src/misc/firebase-models';
import { IFirebaseWrapper } from '../../../src/providers/database';

export class FirebaseWrapperStub implements IFirebaseWrapper {
  constructor(
    private _firestore: FireStore | any,
    private _storage: FireStorage,
    public options: RAFirebaseOptions
  ) {}

  GetApp(): FireApp {
    throw new Error('Method not implemented.');
  }

  dbGetCollection(absolutePath: string): FireStoreCollectionRef {
    return collection(this._firestore, absolutePath);
  }
  dbCreateBatch(): FireStoreBatch {
    return writeBatch(this._firestore);
  }
  dbMakeNewId(): string {
    return doc(collection(this._firestore, 'collections')).id;
  }

  // tslint:disable-next-line:no-empty
  public OnUserLogout(callBack: (u: FireUser) => any) {}
  putFile: any = async (
    storagePath: string,
    rawFile: any
  ): Promise<FireStoragePutFileResult> => {
    const task = uploadBytesResumable(ref(this._storage, storagePath), rawFile);
    const taskResult = new Promise<FireUploadTaskSnapshot>((res, rej) =>
      task.then(res).catch(rej)
    );
    const downloadUrl = taskResult
      .then((t) => getDownloadURL(t.ref))
      .then((url) => url as string);
    return {
      task,
      taskResult,
      downloadUrl,
    };
  };
  async getStorageDownloadUrl(fieldSrc: string): Promise<string> {
    return getDownloadURL(ref(this._storage, fieldSrc));
  }
  authSetPersistence(
    persistenceInput: 'session' | 'local' | 'none'
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  authGetUserLoggedIn(): Promise<FireUser> {
    return { uid: 'alice', email: 'alice@test.com' } as any;
  }
  authSigninEmailPassword(
    email: string,
    password: string
  ): Promise<FireAuthUserCredentials> {
    throw new Error('Method not implemented.');
  }
  authSignOut(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  serverTimestamp() {
    return new Date();
  }

  // Deprecated methods

  /** @deprecated */
  auth(): FireAuth {
    return getAuth(this.GetApp());
  }
  /** @deprecated */
  storage(): FireStorage {
    return this._storage;
  }
  /** @deprecated */
  db(): FireStore {
    return this._firestore;
  }
  /** @deprecated */
  GetUserLogin(): Promise<FireUser> {
    return this.authGetUserLoggedIn();
  }
}
