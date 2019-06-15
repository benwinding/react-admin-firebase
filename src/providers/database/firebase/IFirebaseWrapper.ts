import { firestore } from "firebase";
import { RAFirebaseOptions } from "providers/RAFirebaseOptions";

export interface IFirebaseWrapper {
  init(firebaseConfig: {}, options: RAFirebaseOptions): void;
  db(): firestore.Firestore;
  serverTimestamp(): any;
}