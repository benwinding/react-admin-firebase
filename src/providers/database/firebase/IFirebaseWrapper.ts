import { RAFirebaseOptions } from "providers/RAFirebaseOptions";
import { FirebaseFirestore } from "@firebase/firestore-types";

export interface IFirebaseWrapper {
  init(firebaseConfig: {}, options: RAFirebaseOptions): void;
  db(): FirebaseFirestore;
  serverTimestamp(): any;
}