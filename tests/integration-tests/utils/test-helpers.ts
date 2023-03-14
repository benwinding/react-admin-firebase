import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { RAFirebaseOptions } from '../../../src';
import { IFirestoreLogger } from '../../../src/misc';
import { FireStore } from '../../../src/misc/firebase-models';
import { FireClient, IFirebaseWrapper } from '../../../src/providers/database';
import { FirebaseWrapperStub } from './FirebaseWrapperStub';

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
  return new FireClient(fire, options, new BlankLogger());
}

export async function initFireWrapper(
  projectId: string,
  rafOptions: RAFirebaseOptions = {}
): Promise<IFirebaseWrapper> {
  const safeId = makeSafeId(projectId);
  const testOptions = {
    projectId: safeId,
    firestore: { host: 'localhost', port: 8080 },
  };
  const environment = await initializeTestEnvironment(testOptions);
  const context = environment.unauthenticatedContext();
  return new FirebaseWrapperStub(
    // Slight (inconsequential) mismatch between test API and actual API
    context.firestore(),
    context.storage(),
    rafOptions
  );
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function createDoc(
  db: FireStore,
  collectionName: string,
  docName: string,
  obj: {}
): Promise<void> {
  await setDoc(doc(collection(db, collectionName), docName), obj);
}

export async function getDocsFromCollection(
  db: FireStore | firebase.firestore.Firestore,
  collectionName: string
): Promise<any[]> {
  const allDocs = await getDocs(collection(db as FireStore, collectionName));
  return Promise.all(
    allDocs.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    }))
  );
}
