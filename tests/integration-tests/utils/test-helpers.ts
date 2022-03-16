import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

import { IFirebaseWrapper } from "../../../src/providers/database/firebase/IFirebaseWrapper";
import { FirebaseWrapperStub } from "./FirebaseWrapperStub";
import { RAFirebaseOptions } from "../../../src/providers/options";
import { FireClient } from "../../../src/providers/database/FireClient";
import { IFirestoreLogger } from '../../../src/misc';
import { FireApp, FireStore } from '../../../src/misc/firebase-models';

function makeSafeId(projectId: string): string {
  return projectId.split(' ').join('').toLowerCase();
}

export class BlankLogger implements IFirestoreLogger {
  logDocument = (count: number) => () => null;
  SetEnabled = (isEnabled: boolean) => null;
  ResetCount = (shouldReset: boolean) => null;
}

export async function MakeMockClient(options: RAFirebaseOptions = {}) {
  const randomProjectId = Math.random().toString(32).slice(2, 10);
  const fire = await initFireWrapper(randomProjectId, options);
  return new FireClient(fire, options, new BlankLogger);
}

export async function initFireWrapper(projectId: string, rafOptions: RAFirebaseOptions = {}): Promise<IFirebaseWrapper> {
  const safeId = makeSafeId(projectId);
  const testOptions = { projectId: safeId, firestore: { host: 'localhost', port: 8080 }};
  const enivornment = await initializeTestEnvironment(testOptions);
  const context = enivornment.unauthenticatedContext();
  const fire: IFirebaseWrapper = new FirebaseWrapperStub(
    // Slight (inconseqential) mismatch between test API and actual API
    context.firestore() as FireStore,
    context as FireApp,
    rafOptions,
  );
  return fire;
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function createDoc(
  db: FireStore,
  collectionName: string,
  docName: string,
  obj: {}
): Promise<void> {
  await db.collection(collectionName).doc(docName).set(obj);
}

export async function getDocsFromCollection(
  db: FireStore,
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
