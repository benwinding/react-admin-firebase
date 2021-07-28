import { RAFirebaseOptions } from "../../options";
import { FirebaseAuth } from "@firebase/auth-types";

export type FireApp = firebase.default.app.App;

export interface IFirebaseWrapper {
  OnUserLogout(arg0: (user: firebase.default.User | null) => void): void;
  init(firebaseConfig: {}, options: RAFirebaseOptions): void;
  options: RAFirebaseOptions;
  db(): firebase.default.firestore.Firestore;
  storage(): firebase.default.storage.Storage;
  auth(): FirebaseAuth;
  serverTimestamp(): any;
  GetApp(): FireApp;
  GetUserLogin(): Promise<firebase.default.User>;
}
