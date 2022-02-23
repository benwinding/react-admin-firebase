import {
  IFirebaseWrapper,
} from './IFirebaseWrapper';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

import { log } from 'misc';
import { RAFirebaseOptions } from 'providers/options';
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
  FireUser
} from 'misc/firebase-models';

export class FirebaseWrapper implements IFirebaseWrapper {
  private firestore: FireStore;
  private app: FireApp;
  public options: RAFirebaseOptions;

  constructor(
    inputOptions: RAFirebaseOptions | undefined,
    firebaseConfig: {},
  ) { 
    const optionsSafe = inputOptions || {};
    this.options = optionsSafe;
    this.app = (window as any)['_app'] = ObtainFirebaseApp(firebaseConfig, optionsSafe);
    this.firestore = this.app.firestore();
  }
  dbGetCollection(absolutePath: string): FireStoreCollectionRef {
    return this.firestore.collection(absolutePath);
  }
  dbCreateBatch(): FireStoreBatch {
    return this.firestore.batch();
  }
  dbMakeNewId(): string {
    return this.firestore.collection("collections").doc().id
  }

  public OnUserLogout(callBack: (u: FireUser | null) => any) {
    this.app.auth().onAuthStateChanged((user) => {
      const isLoggedOut = !user;
      log('FirebaseWrapper.OnUserLogout', { user, isLoggedOut });
      if (isLoggedOut) {
        callBack(user);
      }
    });
  }
  putFile(storagePath: string, rawFile: any): FireStoragePutFileResult {
    const task = this.app.storage().ref(storagePath).put(rawFile);
    const taskResult = new Promise<FireUploadTaskSnapshot>(
      (res, rej) => task.then(res).catch(rej)
    );
    const downloadUrl = taskResult.then(t => t.ref.getDownloadURL()).then(url => url as string)
    return {
      task,
      taskResult,
      downloadUrl,
    }
  }
  async getStorageDownloadUrl(fieldSrc: string): Promise<string> {
    return this.app.storage().ref(fieldSrc).getDownloadURL();
  }
  public serverTimestamp() {
    // This line doesn't work for some reason, might be firebase sdk.
    return firebase.firestore.FieldValue.serverTimestamp();
  }
  async authSetPersistence(persistenceInput: 'session' | 'local' | 'none') {
    let persistenceResolved: string;
    switch (persistenceInput) {
      case 'local':
        persistenceResolved = firebase.auth.Auth.Persistence.LOCAL;
        break;
      case 'none':
        persistenceResolved = firebase.auth.Auth.Persistence.NONE;
        break;
      case 'session':
      default:
        persistenceResolved = firebase.auth.Auth.Persistence.SESSION;
        break;
    }
    log('setPersistence', { persistenceInput, persistenceResolved });
    return this.app.auth()
      .setPersistence(persistenceResolved)
      .catch((error) => console.error(error));
  }
  async authSigninEmailPassword(email: string, password: string): Promise<FireAuthUserCredentials> {
    const user = await this.app.auth().signInWithEmailAndPassword(
      email,
      password
    );
    return user;
  }
  async authSignOut(): Promise<void> {
    return this.app.auth().signOut();
  }
  async authGetUserLoggedIn(): Promise<FireUser> {
    return new Promise((resolve, reject) => {
      const auth = this.app.auth();
      if (auth.currentUser) return resolve(auth.currentUser);
      const unsubscribe = this.app.auth().onAuthStateChanged((user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  }
  public async GetUserLogin(): Promise<FireUser> {
    return this.authGetUserLoggedIn();
  }

  /** @deprecated */
  public auth(): FireAuth {
    return this.app.auth();
  }
  /** @deprecated */
  public storage(): FireStorage {
    return this.app.storage();
  }
  /** @deprecated */
  public GetApp(): FireApp {
    return this.app;
  }
  /** @deprecated */
  public db(): FireStore {
    return this.firestore;
  }
}

function ObtainFirebaseApp(
  firebaseConfig: {},
  options: RAFirebaseOptions
): firebase.app.App {
  if (options.app) {
    return options.app;
  }
  const isInitialized = !!firebase.apps?.length;
  if (isInitialized) {
    return firebase.app();
  } else {
    return firebase.initializeApp(firebaseConfig);
  }
}
