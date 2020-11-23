import { FireClient } from '../database/FireClient';
import { log, recursivelyMapStorageUrls } from '../../misc';
import * as ra from '../../misc/react-admin-models';

export async function GetOne<T extends ra.Record>(
  resourceName: string,
  params: ra.GetOneParams,
  client: FireClient
): Promise<ra.GetOneResult<T>> {
  log('GetOne', { resourceName, params });
  const { rm, fireWrapper } = client;
  try {
    const id = params.id + '';
    const dataSingle = await rm.GetSingleDoc(resourceName, id);
    client.flogger.logDocument(1)();
    const data = await recursivelyMapStorageUrls(fireWrapper, dataSingle);
    return { data: data };
  } catch (error) {
    throw new Error(
      'Error getting id: ' + params.id + ' from collection: ' + resourceName
    );
  }
}
