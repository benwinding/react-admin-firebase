import { RAFirebaseOptions } from "providers/RAFirebaseOptions";
import { FirebaseFirestore } from "@firebase/firestore-types";
import { FirebaseAuth } from "@firebase/auth-types";

export interface IFirebaseWrapper {
  init(firebaseConfig: {}, options: RAFirebaseOptions): void;
  db(): firestore.Firestore;
  storage(): firebase.storage.Storage;
  auth(): FirebaseAuth;
  serverTimestamp(): any;
}