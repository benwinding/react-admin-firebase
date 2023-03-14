import {
  FireStoreDocumentSnapshot,
  FireStoreQueryDocumentSnapshot,
} from './firebase-models';
import { logWarn } from './logger';
import * as ra from './react-admin-models';
import {
  applyRefDocs,
  translateDocFromFirestore,
} from './translate-from-firestore';

export function parseFireStoreDocument<T extends ra.Record>(
  doc: FireStoreQueryDocumentSnapshot | FireStoreDocumentSnapshot | undefined
): T {
  if (!doc) {
    logWarn('parseFireStoreDocument: no doc', { doc });
    return {} as T;
  }
  const data = doc.data();
  const result = translateDocFromFirestore(data);
  const dataWithRefs = applyRefDocs(result.parsedDoc, result.refdocs);
  // React Admin requires an id field on every document,
  // So we can just use the firestore document id
  return { id: doc.id, ...dataWithRefs } as T;
}
