import { IFirebaseWrapper } from "../src/providers/database/firebase/IFirebaseWrapper";
import { RAFirebaseOptions } from "../src/providers/RAFirebaseOptions";
import { firestore } from "firebase";

import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

export class FirebaseWrapperStub implements IFirebaseWrapper {
  private firestore: firestore.Firestore;

  constructor() { }
  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
    if (!firebase.apps.length) {
      const app = firebase.initializeApp(firebaseConfig);
      this.firestore = app.firestore();
    }
    else {
      const app = firebase.app();
      this.firestore = app.firestore();
    }
  }
  public db(): firestore.Firestore {
    return this.firestore;
  }
  public serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }
  public storage() {
    return null;
  }
}

