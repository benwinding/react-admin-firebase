import { IFirebaseWrapper } from '../../../src/providers/database/firebase/IFirebaseWrapper';
import { RAFirebaseOptions } from '../../../src/providers/RAFirebaseOptions';
import { firestore, User } from 'firebase';
import * as firebase from "@firebase/testing";

export class FirebaseWrapperStub implements IFirebaseWrapper {
  private firestore: firestore.Firestore = null as any;
  private app = null as any;
  options: RAFirebaseOptions = null as any;
  GetApp() {
    return this.app;
  }

  constructor() {}

  async GetUserLogin(): Promise<User> {
    return { uid: "alice", email: 'alice@test.com' } as any;
  }

  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
    this.options = options;
    this.app = options.app;
    this.firestore = this.app.firestore();
  }
  public db(): firestore.Firestore {
    return this.firestore;
  }
  public auth() {
    return this.app.auth();
  }
  storage() {
    return this.app.storage();
  }
  public serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }
  public OnUserLogout(callBack: (u: User) => any) {
    
  }
}
