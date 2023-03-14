import { doc, getDoc } from 'firebase/firestore';
import { log, recursivelyMapStorageUrls } from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database/FireClient';

export async function GetMany<T extends ra.Record>(
  resourceName: string,
  params: ra.GetManyParams,
  client: FireClient
): Promise<ra.GetManyResult<T>> {
  const { rm, options, fireWrapper } = client;
  const r = await rm.TryGetResource(resourceName);
  const ids = params.ids;
  log('GetMany', { resourceName, resource: r, params, ids });
  const matchDocSnaps = await Promise.all(
    ids.map((idObj) => {
      if (typeof idObj === 'string') {
        return getDoc(doc(r.collection, idObj));
      }
      // Will get and resolve reference documents into the current doc
      return getDoc(doc(r.collection, (idObj as any)['___refid']));
    })
  );
  client.flogger.logDocument(ids.length)();
  const matches = matchDocSnaps.map(
    (snap) => ({ ...snap.data(), id: snap.id } as T)
  );
  const permittedData = options.softDelete
    ? matches.filter((row) => !row['deleted'])
    : matches;
  if (options.relativeFilePaths) {
    const data = await Promise.all(
      permittedData.map((d) => recursivelyMapStorageUrls(fireWrapper, d))
    );
    return {
      data,
    };
  }

  return {
    data: permittedData,
  };
}
