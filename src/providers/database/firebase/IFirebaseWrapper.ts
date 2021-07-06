import { RAFirebaseOptions } from "../../options";
import { FirebaseAuth } from "@firebase/auth-types";
import firebase from "firebase";

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
  GetUserLogin(): Promise<firebase.User>;
}
