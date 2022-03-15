import { FireStoreQueryDocumentSnapshot, FireStoreDocumentSnapshot } from "./firebase-models";
import { logWarn } from "./logger";
import { translateDocFromFirestore } from "./translate-from-firestore";
import * as ra from './react-admin-models';

export function parseFireStoreDocument<T extends ra.Record>(doc: FireStoreQueryDocumentSnapshot | FireStoreDocumentSnapshot | undefined): T {
  if (!doc) {
    logWarn('parseFireStoreDocument: no doc', { doc });
    return {} as T;
  }
  const data = doc.data();
  const result = translateDocFromFirestore(data);
  const dataParsed = result.parsedDoc;
  // React Admin requires an id field on every document,
  // So we can just using the firestore document id
  return { id: doc.id, ...dataParsed } as T;
}
