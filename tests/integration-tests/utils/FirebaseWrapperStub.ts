import { IFirebaseWrapper } from '../../../src/providers/database/firebase/IFirebaseWrapper';
import { RAFirebaseOptions } from '../../../src/providers/options';
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

export class FirebaseWrapperStub implements IFirebaseWrapper {
  constructor(
    private firestore: FireStore,
    private app: FireApp,
    public options: RAFirebaseOptions,
  ) { }

  dbGetCollection(absolutePath: string): FireStoreCollectionRef {
    return this.firestore.collection(absolutePath);
  }
  dbCreateBatch(): FireStoreBatch {
    return this.firestore.batch();
  }
  dbMakeNewId(): string {
    return this.firestore.collection("collections").doc().id
  }

  public OnUserLogout(callBack: (u: FireUser) => any) {

  }
  putFile: any = async (storagePath: string, rawFile: any): Promise<FireStoragePutFileResult> => {
    const task = this.app.storage().ref(storagePath).put(rawFile);
    const taskResult = new Promise<FireUploadTaskSnapshot>(
      (res, rej) => task.then(res).catch(rej)
    );
    const downloadUrl = taskResult.then(t => t.ref.getDownloadURL()).then(url => url as string)
    return {
      task,
      taskResult,
      downloadUrl,
    };
  }
  async getStorageDownloadUrl(fieldSrc: string): Promise<string> {
    return this.app.storage().ref(fieldSrc).getDownloadURL();
  }
  authSetPersistence(persistenceInput: 'session' | 'local' | 'none'): Promise<void> {
    throw new Error('Method not implemented.');
  }
  authGetUserLoggedIn(): Promise<FireUser> {
    return { uid: "alice", email: 'alice@test.com' } as any;
  }
  authSigninEmailPassword(email: string, password: string): Promise<FireAuthUserCredentials> {
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
    return this.app.auth();
  }
  /** @deprecated */
  storage(): FireStorage {
    return this.app.storage();
  }
  /** @deprecated */
  db(): FireStore {
    return this.firestore;
  }
  /** @deprecated */
  GetApp() {
    return this.app;
  }
  /** @deprecated */
  GetUserLogin(): Promise<FireUser> {
    return this.authGetUserLoggedIn();
  }
}
