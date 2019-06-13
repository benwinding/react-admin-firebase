import { IFirebase } from "./Firebase.interface";
import { FirebaseFirestore } from "@firebase/firestore-types";

import * as firebaseApp from "firebase/app";
import "firebase/firestore";

export class FirebaseStub implements IFirebase {
  private firestore: FirebaseFirestore;

  constructor() { }

  public init(firebaseConfig: {}): void {
    if (!firebaseApp.apps.length) {
      const app = firebaseApp.initializeApp(firebaseConfig);
      this.firestore = app.firestore();
    } else {
      const app = firebaseApp.app();
      this.firestore = app.firestore();
    }
  }
  public db(): FirebaseFirestore {
    return this.firestore;
  }
  public serverTimestamp() {
    return firebaseApp.firestore.FieldValue.serverTimestamp();
  }
}
