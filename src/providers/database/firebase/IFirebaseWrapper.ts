import { RAFirebaseOptions } from "providers/RAFirebaseOptions";
import { FirebaseFirestore } from "@firebase/firestore-types";
import { FirebaseAuth } from "@firebase/auth-types";

export interface IFirebaseWrapper {
  init(firebaseConfig: {}, options: RAFirebaseOptions): void;
  db(): FirebaseFirestore;
  auth(): FirebaseAuth;
  serverTimestamp(): any;
}