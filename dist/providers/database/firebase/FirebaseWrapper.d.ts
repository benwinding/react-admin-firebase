import { IFirebaseWrapper } from "./IFirebaseWrapper";
import { RAFirebaseOptions } from "providers/RAFirebaseOptions";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
export declare class FirebaseWrapper implements IFirebaseWrapper {
    private firestore;
    private app;
    constructor();
    init(firebaseConfig: {}, options: RAFirebaseOptions): void;
    db(): firebase.firestore.Firestore;
    serverTimestamp(): Date;
    auth(): any;
    storage(): firebase.storage.Storage;
}
