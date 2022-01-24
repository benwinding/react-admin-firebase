import * as firebase from '@firebase/testing';

import { IFirebaseWrapper } from "../../../src/providers/database/firebase/IFirebaseWrapper";
import { FirebaseWrapperStub } from "./FirebaseWrapperStub";
import { RAFirebaseOptions } from "../../../src/providers/options";
import { FireClient } from "../../../src/providers/database/FireClient";
import { IFirestoreLogger } from '../../../src/misc';
import { FireStore } from '../../../src/misc/firebase-models';

function makeSafeId(projectId: string): string {
  return projectId.split(' ').join('').toLowerCase();
}

export class BlankLogger  implements IFirestoreLogger {
  logDocument = (count: number) => () => null;
  SetEnabled = (isEnabled: boolean) => null;
  ResetCount = (shouldReset: boolean) => null;
}

export function MakeMockClient(options: RAFirebaseOptions = {}) {
  const randomProjectId = Math.random().toString(32).slice(2,10);
  const fire = initFireWrapper(randomProjectId, options);
  return new FireClient(fire, options, new BlankLogger);
}

export function initFireWrapper(projectId: string, rafOptions: RAFirebaseOptions = {}): IFirebaseWrapper {
  const safeId = makeSafeId(projectId);
  const testOptions = { projectId: safeId };
  const app = firebase.initializeTestApp(testOptions);
  const fire: IFirebaseWrapper = new FirebaseWrapperStub(
    app.firestore(),
    app,
    rafOptions,
  );
  return fire;
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function clearDb(projectId: string) {
  const safeId = makeSafeId(projectId);
  const testOptions = { projectId: safeId };
  return firebase.clearFirestoreData(testOptions);
}

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
