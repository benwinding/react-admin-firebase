import { collection, doc, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { RAFirebaseOptions } from '../../../src';
import {
  FireApp,
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
    private firestore: FireStore | any,
    private storage: FireStorage,
    public options: RAFirebaseOptions
  ) {}

  GetApp(): FireApp {
    throw new Error('Method not implemented.');
  }

  dbGetCollection(absolutePath: string): FireStoreCollectionRef {
    return collection(this.firestore, absolutePath);
  }
  dbCreateBatch(): FireStoreBatch {
    return writeBatch(this.firestore);
  }
  dbMakeNewId(): string {
    return doc(collection(this.firestore, 'collections')).id;
  }

  // tslint:disable-next-line:no-empty
  public OnUserLogout(callBack: (u: FireUser) => any) {}
  putFile: any = async (
    storagePath: string,
    rawFile: any
  ): Promise<FireStoragePutFileResult> => {
    const task = uploadBytesResumable(ref(this.storage, storagePath), rawFile);
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
    return getDownloadURL(ref(this.storage, fieldSrc));
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
  fireStorage(): FireStorage {
    return this.storage;
  }
  /** @deprecated */
  db(): FireStore {
    return this.firestore;
  }
  /** @deprecated */
  GetUserLogin(): Promise<FireUser> {
    return this.authGetUserLoggedIn();
  }
}
