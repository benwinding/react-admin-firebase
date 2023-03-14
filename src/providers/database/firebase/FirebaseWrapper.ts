import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  Persistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getFirestore,
  serverTimestamp as firestoreServerTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
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
} from 'misc/firebase-models';
import { log } from '../../../misc';
import { RAFirebaseOptions } from '../../options';
import { IFirebaseWrapper } from './IFirebaseWrapper';

export class FirebaseWrapper implements IFirebaseWrapper {
  private readonly _app: FireApp;
  private readonly _firestore: FireStore;
  private readonly _storage: FireStorage;
  private readonly _auth: FireAuth;
  public options: RAFirebaseOptions;

  constructor(inputOptions: RAFirebaseOptions | undefined, firebaseConfig: {}) {
    const optionsSafe = inputOptions || {};
    this.options = optionsSafe;
    this._app = (window as any)['_app'] = ObtainFirebaseApp(
      firebaseConfig,
      optionsSafe
    );
    this._firestore = getFirestore(this._app);
    this._storage = getStorage(this._app);
    this._auth = getAuth(this._app);
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

  public OnUserLogout(callBack: (u: FireUser | null) => any) {
    this._auth.onAuthStateChanged((user) => {
      const isLoggedOut = !user;
      log('FirebaseWrapper.OnUserLogout', { user, isLoggedOut });
      if (isLoggedOut) {
        callBack(user);
      }
    });
  }
  putFile(storagePath: string, rawFile: any): FireStoragePutFileResult {
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
  }
  async getStorageDownloadUrl(fieldSrc: string): Promise<string> {
    return getDownloadURL(ref(this._storage, fieldSrc));
  }
  public serverTimestamp() {
    // This line doesn't work for some reason, might be firebase sdk.
    return firestoreServerTimestamp();
  }

  async authSetPersistence(persistenceInput: 'session' | 'local' | 'none') {
    let persistenceResolved: Persistence;
    switch (persistenceInput) {
      case 'local':
        persistenceResolved = browserLocalPersistence;
        break;
      case 'none':
        persistenceResolved = inMemoryPersistence;
        break;
      case 'session':
      default:
        persistenceResolved = browserSessionPersistence;
        break;
    }

    log('setPersistence', { persistenceInput, persistenceResolved });

    return this._auth
      .setPersistence(persistenceResolved)
      .catch((error) => console.error(error));
  }
  async authSigninEmailPassword(
    email: string,
    password: string
  ): Promise<FireAuthUserCredentials> {
    const user = await signInWithEmailAndPassword(this._auth, email, password);
    return user;
  }
  async authSignOut(): Promise<void> {
    return signOut(this._auth);
  }
  async authGetUserLoggedIn(): Promise<FireUser> {
    return new Promise((resolve, reject) => {
      const auth = this._auth;
      if (auth.currentUser) return resolve(auth.currentUser);
      const unsubscribe = onAuthStateChanged(this._auth, (user) => {
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
    return this._auth;
  }
  /** @deprecated */
  public storage(): FireStorage {
    return this._storage;
  }
  /** @deprecated */
  public GetApp(): FireApp {
    return this._app;
  }
  /** @deprecated */
  public db(): FireStore {
    return this._firestore;
  }
}

function ObtainFirebaseApp(
  firebaseConfig: {},
  options: RAFirebaseOptions
): FirebaseApp {
  if (options.app) {
    return options.app;
  }
  const apps = getApps();

  const isInitialized = !!apps?.length;

  if (isInitialized) {
    return getApp();
  } else {
    return initializeApp(firebaseConfig);
  }
}
