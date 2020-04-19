import { FirebaseFirestore } from "@firebase/firestore-types";
import * as firebase from "@firebase/testing";

import { IFirebaseWrapper } from '../../../src/providers/database/firebase/IFirebaseWrapper';
import { FirebaseWrapperStub } from './FirebaseWrapperStub';

const testOptions = {projectId: 'testing'};

export function initFireWrapper(): IFirebaseWrapper {
  const fire: IFirebaseWrapper = new FirebaseWrapperStub();
  const app = firebase.initializeTestApp(testOptions);
  fire.init({}, {app: app});
  return fire;
}

export async function clearDb() {
  return firebase.clearFirestoreData(testOptions);
}

export async function createDoc(db: FirebaseFirestore, collectionName: string, docName: string, obj: {}): Promise<void> {
  await db.collection(collectionName).doc(docName).set(obj);
}

export async function getDocsFromCollection(db: FirebaseFirestore, collectionName: string): Promise<any[]> {
  const allDocs = await db.collection(collectionName).get();
  const docsData = await Promise.all(allDocs.docs.map(doc => {
    return {
      ...doc.data(),
      id: doc.id
    }
  }));
  return docsData;
}

