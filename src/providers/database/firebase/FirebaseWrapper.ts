import { IFirebaseWrapper } from "./IFirebaseWrapper";
import { firestore } from "firebase";
import { RAFirebaseOptions } from "providers/RAFirebaseOptions";

import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

export class FirebaseWrapper implements IFirebaseWrapper {
  private firestore: firestore.Firestore;
  private app;

  constructor() { }

  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
    this.app = ObtainFirebaseApp(firebaseConfig, options) as any;
    this.firestore = this.app.firestore();
  }
  public db(): firestore.Firestore {
    return this.firestore;
  }
  public serverTimestamp() {
    return firestore.FieldValue.serverTimestamp();
  }
  public auth() {
    return this.app.auth();
  }
  public storage() {
    return this.app.storage();
  }
}

function ObtainFirebaseApp(firebaseConfig: {}, options: RAFirebaseOptions) {
  if (options.app) {
    return options.app;
  }
  const isInitialized = !!firebase.apps.length;
  if (isInitialized) {
    const app = firebase.app();
    return app;
  } else {
    const app = firebase.initializeApp(firebaseConfig);
    return app;
  }
}