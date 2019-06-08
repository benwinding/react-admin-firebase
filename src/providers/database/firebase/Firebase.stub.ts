import { IFirebase } from "./Firebase.interface";
import { FirebaseFirestore } from "@firebase/firestore-types";
const firebasemock = require('firebase-mock');
 
export class FirebaseStub implements IFirebase {
  private mockfirestore = new firebasemock.MockFirestore();

  public init(firebaseConfig: {}): void {
    throw new Error("Method not implemented.");
  }
  public db(): FirebaseFirestore {
    return this.mockfirestore;
  }
  public serverTimestamp() {
    throw new Error("Method not implemented.");
  }
}
