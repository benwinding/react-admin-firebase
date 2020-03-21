import { IFirebaseWrapper } from "./IFirebaseWrapper";
import { RAFirebaseOptions } from "providers/RAFirebaseOptions";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

export class FirebaseWrapper implements IFirebaseWrapper {
  private firestore: firebase.firestore.Firestore;
  private app: firebase.app.App;

  constructor() { }

  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
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

function ObtainFirebaseApp(firebaseConfig: {}, options: RAFirebaseOptions): firebase.app.App {
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