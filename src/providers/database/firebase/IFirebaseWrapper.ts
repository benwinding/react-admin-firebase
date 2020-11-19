import { RAFirebaseOptions } from "providers/RAFirebaseOptions";
import { FirebaseAuth } from "@firebase/auth-types";

export type FireApp = firebase.app.App;

export interface IFirebaseWrapper {
  OnUserLogout(arg0: (user: firebase.User | null) => void): void;
  init(firebaseConfig: {}, options: RAFirebaseOptions): void;
  options: RAFirebaseOptions;
  db(): firebase.firestore.Firestore;
  storage(): firebase.storage.Storage;
  auth(): FirebaseAuth;
  serverTimestamp(): any;
  GetApp(): FireApp;
}