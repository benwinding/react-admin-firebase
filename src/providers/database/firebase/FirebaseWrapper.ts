import { IFirebaseWrapper } from './IFirebaseWrapper';
import { RAFirebaseOptions } from 'providers/options';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

export class FirebaseWrapper implements IFirebaseWrapper {
  private firestore: firebase.firestore.Firestore;
  private app: firebase.app.App;

  public options: RAFirebaseOptions;

  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
    this.options = options;
    this.app = ObtainFirebaseApp(firebaseConfig, options);
    this.firestore = this.app.firestore();
  }
  public db(): firebase.firestore.Firestore {
    return this.firestore;
  }
  public serverTimestamp() {
    // This line doesn't work for some reason, might be firebase sdk.
    // return firebase.firestore.FieldValue.serverTimestamp();
    return new Date();
  }
  public auth() {
    return this.app.auth() as any;
  }
  public storage() {
    return this.app.storage();
  }
}

function ObtainFirebaseApp(
  firebaseConfig: {},
  options: RAFirebaseOptions
): firebase.app.App {
  if (options.app) {
    return options.app;
  }
  const isInitialized = !!firebase.apps.length;
  if (isInitialized) {
    return firebase.app();
  } else {
    return firebase.initializeApp(firebaseConfig);
  }
}
