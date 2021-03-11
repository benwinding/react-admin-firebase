import { IFirebaseWrapper } from '../../../src/providers/database/firebase/IFirebaseWrapper';
import { RAFirebaseOptions } from '../../../src/providers/options';
import firebase from 'firebase';

export class FirebaseWrapperStub implements IFirebaseWrapper {
  private firestore: firebase.firestore.Firestore = null as any;
  private app = null as any;
  options: RAFirebaseOptions = null as any;
  GetApp() {
    return this.app;
  }

  constructor() {}

  async GetUserLogin(): Promise<firebase.User> {
    return { uid: "alice", email: 'alice@test.com' } as any;
  }

  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
    this.options = options;
    this.app = options.app;
    this.firestore = this.app.firestore();
  }
  public db(): firebase.firestore.Firestore {
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
  public OnUserLogout(callBack: (u: firebase.User) => any) {

  }
}
