import { firestore } from "firebase";

export interface IFirebaseWrapper {
  init(firebaseConfig: {}): void;
  db(): firestore.Firestore;
  serverTimestamp(): any;
}