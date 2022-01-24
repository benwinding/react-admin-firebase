import { FireStoreDocumentSnapshot, FireStoreQueryDocumentSnapshot } from './firebase-models';
import { parseAllDatesDoc } from './timestamp-parser';

export const parseFireStoreDocument = (doc: FireStoreQueryDocumentSnapshot) => {
  const data = doc.data();
  parseAllDatesDoc(data);
  // React Admin requires an id field on every document,
  // So we can just using the firestore document id
  return { id: doc.id, ...data };
};
