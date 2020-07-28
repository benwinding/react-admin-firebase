import { FirebaseFirestore } from '@firebase/firestore-types';
import * as firebase from '@firebase/testing';

import { IFirebaseWrapper } from '../../../src/providers/database/firebase/IFirebaseWrapper';
import { FirebaseWrapperStub } from './FirebaseWrapperStub';
import { RAFirebaseOptions } from '../../../src/providers/options';

function makeSafeId(projectId: string): string {
  return projectId.split(' ').join('').toLowerCase();
}

export function initFireWrapper(
  projectId: string,
  rafOptions: RAFirebaseOptions = {}
): IFirebaseWrapper {
  const safeId = makeSafeId(projectId);
  const testOptions = { projectId: safeId };
  const fire: IFirebaseWrapper = new FirebaseWrapperStub();
  const app = firebase.initializeTestApp(testOptions);
  fire.init({}, { app: app, ...rafOptions });
  return fire;
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function clearDb(projectId: string) {
  const safeId = makeSafeId(projectId);
  const testOptions = { projectId: safeId };
  return firebase.clearFirestoreData(testOptions);
}

export async function createDoc(
  db: FirebaseFirestore,
  collectionName: string,
  docName: string,
  obj: {}
): Promise<void> {
  await db.collection(collectionName).doc(docName).set(obj);
}

export async function getDocsFromCollection(
  db: FirebaseFirestore,
  collectionName: string
): Promise<any[]> {
  const allDocs = await db.collection(collectionName).get();
  const docsData = await Promise.all(
    allDocs.docs.map((doc) =>
      ({
        ...doc.data(),
        id: doc.id
      }))
  );
  return docsData;
}
