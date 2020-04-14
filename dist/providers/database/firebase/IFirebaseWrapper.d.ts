import { RAFirebaseOptions } from "providers/RAFirebaseOptions";
import { FirebaseAuth } from "@firebase/auth-types";
export interface IFirebaseWrapper {
    init(firebaseConfig: {}, options: RAFirebaseOptions): void;
    db(): firebase.firestore.Firestore;
    storage(): firebase.storage.Storage;
    auth(): FirebaseAuth;
    serverTimestamp(): any;
}
