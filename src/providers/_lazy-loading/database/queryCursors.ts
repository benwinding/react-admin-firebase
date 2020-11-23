import {
  CollectionReference,
  DocumentReference,
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
): Promise<DocumentSnapshot | false> {
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
  queryBase: Query,
  params: messageTypes.IParamsGetList,
  resourceName: string
) {
  const { page, perPage } = params.pagination;

  let lastQueryCursor: DocumentSnapshot | false = false;
  let currentPage = page - 1;

  const currentPageParams = {
    ...params,
    pagination: {
      ...params.pagination,
    },
  };
  while (!lastQueryCursor && currentPage > 1) {
    currentPage--;
    currentPageParams.pagination.page = currentPage;
    console.log('getting query cursor currentPage=', currentPage);
    lastQueryCursor = await getQueryCursor(
      collection,
      currentPageParams,
      resourceName
    );
  }
  const limit = (page - currentPage) * perPage;
  const isFirst = currentPage === 1;
  // console.log('query cursor', {currentPage, lastQueryCursor, limit, isFirst});

  function getQuery() {
    if (isFirst) {
      return queryBase.limit(limit);
    } else {
      return queryBase.startAt(lastQueryCursor).limit(limit);
    }
  }
  const newQuery = getQuery();
  const snapshots = await newQuery.get();
  // this.incrementFirebaseReadsCounter(snapshots.docs.length);
  const lastDocIndex = snapshots.docs.length - 1;
  const lastDocRef = snapshots.docs[lastDocIndex];
  // console.log('findLastQueryCursor', { limit, isFirst, lastDocRef });
  return lastDocRef;
}
