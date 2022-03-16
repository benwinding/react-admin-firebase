import { FireClient } from '../database/FireClient';
import { log, recursivelyMapStorageUrls } from '../../misc';
import * as ra from '../../misc/react-admin-models';

export async function GetMany<T extends ra.Record>(
  resourceName: string,
  params: ra.GetManyParams,
  client: FireClient
): Promise<ra.GetManyResult<T>> {
  const { rm, options, fireWrapper } = client;
  const r = await rm.TryGetResource(resourceName);
  const ids = params.ids;
  log("GetMany", { resourceName, resource: r, params, ids });
  const matchDocSnaps = await Promise.all(
    ids.map(idObj => {
      if (typeof idObj === 'string') {
        return r.collection.doc(idObj).get()
      }
      // Will get and resolve reference documents into the current doc
      return r.collection.doc((idObj as any)['___refid']).get()
    })
  );
  client.flogger.logDocument(ids.length)();
  const matches = matchDocSnaps.map((snap) => {
    return { ...snap.data(), id: snap.id } as T;
  });
  const permittedData = options.softDelete
    ? matches.filter((row) => !row['deleted'])
    : matches;
  if (options.relativeFilePaths) {
    const data = await Promise.all(
      permittedData.map((doc) => recursivelyMapStorageUrls(fireWrapper, doc))
    );
    return {
      data,
    };
  }

  return {
    data: permittedData,
  };
}
