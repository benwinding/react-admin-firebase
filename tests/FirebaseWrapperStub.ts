import { IFirebaseWrapper } from "../src/providers/database/firebase/IFirebaseWrapper";
import { RAFirebaseOptions } from "../src/providers/RAFirebaseOptions";
import { firestore } from "firebase";

import * as firebaseApp from "firebase/app";
import "firebase/firestore";

export class FirebaseWrapperStub implements IFirebaseWrapper {
  private firestore: firestore.Firestore;

  constructor() { }
  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
    if (!firebaseApp.apps.length) {
      const app = firebaseApp.initializeApp(firebaseConfig);
      this.firestore = app.firestore();
    }
    else {
      const app = firebaseApp.app();
      this.firestore = app.firestore();
    }
  }
  public db(): firestore.Firestore {
    return this.firestore;
  }
  public serverTimestamp() {
    return firebaseApp.firestore.FieldValue.serverTimestamp();
  }
}

