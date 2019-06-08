import { IFirebase } from "./Firebase.interface";

export class FirebaseStub implements IFirebase {
  constructor() { }

  public init(firebaseConfig: {}): void {
    throw new Error("Method not implemented.");
  }
  public db(): import("firebase").firestore.Firestore {
    throw new Error("Method not implemented.");
  }
  public serverTimestamp() {
    throw new Error("Method not implemented.");
  }
}
