import { FireApp, IFirebaseWrapper } from "./IFirebaseWrapper";
import { RAFirebaseOptions } from "providers/RAFirebaseOptions";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import { log } from "misc";

export class FirebaseWrapper implements IFirebaseWrapper {
  private firestore: firebase.firestore.Firestore = null as any;
  private app: FireApp = null as any;
  public options: RAFirebaseOptions = {};

  public GetApp(): FireApp {
    return this.app;
  }

  constructor() { }

  public init(firebaseConfig: {}, options?: RAFirebaseOptions): void {
    const optionsSafe = options || {};
    this.options = optionsSafe;
    this.app = ObtainFirebaseApp(firebaseConfig, optionsSafe);
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
  public OnUserLogout(callBack: (u: firebase.User | null) => any) {
    this.app.auth().onAuthStateChanged(user => {
      const isLoggedOut = !user;
      log('FirebaseWrapper.OnUserLogout', {user, isLoggedOut});
      if (isLoggedOut) {
        callBack(user);
      }
    });
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