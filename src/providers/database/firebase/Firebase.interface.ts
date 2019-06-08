import { firestore } from "firebase";

export interface IFirebase {
  init(firebaseConfig: {}): void;
  db(): firestore.Firestore;
  serverTimestamp(): any;
}