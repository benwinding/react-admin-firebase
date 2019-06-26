import { IFirebaseWrapper } from '../../../src/providers/database/firebase/IFirebaseWrapper';
import { RAFirebaseOptions } from '../../../src/providers/RAFirebaseOptions';
import { firestore } from 'firebase';

import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { FirebaseAuth } from '@firebase/auth-types';

export class FirebaseWrapperStub implements IFirebaseWrapper {
  private firestore: firestore.Firestore;
  private app: any;

  constructor() {}
  public init(firebaseConfig: {}, options: RAFirebaseOptions): void {
    if (!firebase.apps.length) {
      this.app = firebase.initializeApp(firebaseConfig);
    } else {
      this.app = firebase.app();
    }
    this.firestore = this.app.firestore();
  }
  public db(): firestore.Firestore {
    return this.firestore;
  }
  public auth(): FirebaseAuth {
    return this.app.auth();
  }
  public serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }
}
