import {
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  QueryConstraint,
  startAfter,
  startAt,
} from 'firebase/firestore';
import { ref } from 'firebase/storage';
import {
  FireStoreCollectionRef,
  FireStoreDocumentSnapshot,
  FireStoreQuery,
} from 'misc/firebase-models';
import { IFirestoreLogger, messageTypes } from '../../misc';

export function setQueryCursor(
  document: FireStoreDocumentSnapshot,
  params: messageTypes.IParamsGetList,
  resourceName: string
) {
  const key = btoa(JSON.stringify({ ...params, resourceName }));
  localStorage.setItem(key, document.id);

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
  collection: FireStoreCollectionRef,
  params: messageTypes.IParamsGetList,
  resourceName: string,
  flogger: IFirestoreLogger
): Promise<FireStoreDocumentSnapshot | false> {
  const key = btoa(JSON.stringify({ ...params, resourceName }));
  const docId = localStorage.getItem(key);
  if (!docId) {
    return false;
  }

  const docSnapshot = await getDoc(doc(collection, docId));
  flogger.logDocument(1)();
  if (docSnapshot.exists()) {
    return docSnapshot;
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
  collection: FireStoreCollectionRef,
  queryConstraints: QueryConstraint[],
  params: messageTypes.IParamsGetList,
  resourceName: string,
  flogger: IFirestoreLogger
) {
  const { page, perPage } = params.pagination;

  let lastQueryCursor: FireStoreDocumentSnapshot | false = false;
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
      resourceName,
      flogger
    );
  }
  const pageLimit = (page - currentPage) * perPage;
  const isFirst = currentPage === 1;

  function getQuery() {
    if (isFirst) {
      return query(collection, ...[...queryConstraints, limit(pageLimit)]);
    } else {
      return query(
        collection,
        ...[...queryConstraints, startAfter(lastQueryCursor), limit(pageLimit)]
      );
    }
  }

  const newQuery = getQuery();
  const snapshots = await getDocs(newQuery);
  const docsLength = snapshots.docs.length;
  flogger.logDocument(docsLength)();
  const lastDocIndex = docsLength - 1;
  const lastDocRef = snapshots.docs[lastDocIndex];
  return lastDocRef;
}
