import {
  CollectionReference,
  DocumentSnapshot,
  OrderByDirection,
  Query,
} from '@firebase/firestore-types';
import { messageTypes } from '../../../misc';

export function setQueryCursor(
  doc: DocumentSnapshot,
  params: messageTypes.IParamsGetList,
  resourceName: string
) {
  const key = btoa(JSON.stringify({ ...params, resourceName }));
  localStorage.setItem(key, doc.id);

  const allCursorsKey = `ra-firebase-cursor-keys_${resourceName}`;
  const localCursorKeys = localStorage.getItem(allCursorsKey);
  if (!localCursorKeys) {
    localStorage.setItem(allCursorsKey, JSON.stringify([key]));
  } else {
    const cursors: string[] = JSON.parse(localCursorKeys);
    const newCursors = cursors.concat(key);
    localStorage.setItem(allCursorsKey, JSON.stringify(newCursors));
  }
}

export async function getQueryCursor(
  collection: CollectionReference,
  params: messageTypes.IParamsGetList,
  resourceName: string
): Promise<DocumentSnapshot | boolean> {
  const key = btoa(JSON.stringify({ ...params, resourceName }));
  const docId = localStorage.getItem(key);
  if (!docId) {
    return false;
  }

  const doc = await collection.doc(docId).get();
  if (doc.exists) {
    // incrementFirebaseReadsCounter(1);
    return doc;
  }
  return false;
}

export function clearQueryCursors(resourceName: string) {
  const allCursorsKey = `ra-firebase-cursor-keys_${resourceName}`;
  const localCursorKeys = localStorage.getItem(allCursorsKey);
  if (localCursorKeys) {
    const cursors: string[] = JSON.parse(localCursorKeys);
    cursors.forEach((cursor) => localStorage.removeItem(cursor));
    localStorage.removeItem(allCursorsKey);
  }
}

export async function findLastQueryCursor(
  collection: CollectionReference,
  query: Query,
  params: messageTypes.IParamsGetList,
  resourceName: string
) {
  const { page, perPage } = params.pagination;

  let lastQueryCursor = null;
  let currentPage = page - 1;

  while (!lastQueryCursor && currentPage > 1) {
    const currentPageParams = {
      ...params,
      pagination: {
        ...params.pagination,
        page: currentPage,
      },
    };

    const currentPageQueryCursor = await getQueryCursor(
      collection,
      currentPageParams,
      resourceName
    );
    if (currentPageQueryCursor) {
      lastQueryCursor = currentPageQueryCursor;
    } else {
      currentPage--;
    }
  }
  const limit = (page - currentPage) * perPage;
  const newQuery =
    currentPage === 1
      ? query.limit(limit)
      : query.startAfter(lastQueryCursor).limit(limit);

  const snapshots = await newQuery.get();
  // this.incrementFirebaseReadsCounter(snapshots.docs.length);
  return snapshots.docs[snapshots.docs.length - 1];
}
