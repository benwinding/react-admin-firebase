import { IFirebaseWrapper } from '../../../src/providers/database/firebase/IFirebaseWrapper';
import { RAFirebaseOptions } from '../../../src/providers/options';
import * as firebaseRoot from 'firebase';
import * as firebase from "@firebase/testing";

export class FirebaseWrapperStub implements IFirebaseWrapper {
  private firestore: firebaseRoot.default.firestore.Firestore = null as any;
  private app = null as any;
  options: RAFirebaseOptions = null as any;
  GetApp() {
    return this.app;
  }

  constructor() {}

  async GetUserLogin(): Promise<firebaseRoot.default.User> {
    return { uid: "alice", email: 'alice@test.com' } as any;
  }

  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
    this.options = options;
    this.app = options.app;
    this.firestore = this.app.firestore();
  }
  public db(): firebaseRoot.default.firestore.Firestore {
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
  public OnUserLogout(callBack: (u: firebaseRoot.default.User | null) => void): void {

  }
}
