import { FirebaseFirestore } from "@firebase/firestore-types";

export function delayPromise(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  })
}

export async function deleteCollection(db: FirebaseFirestore, collectionName: string): Promise<void> {
  const allDocs = await db.collection(collectionName).get();
  await Promise.all(allDocs.docs.map(doc => doc.ref.delete()));
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
