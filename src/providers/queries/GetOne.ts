import { log, translateDocFromFirestore } from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database/FireClient';

export async function GetOne<T extends ra.Record>(
  resourceName: string,
  params: ra.GetOneParams,
  client: FireClient
): Promise<ra.GetOneResult<T>> {
  log('GetOne', { resourceName, params });
  const { rm } = client;
  try {
    const id = params.id + '';
    const dataSingle = await rm.GetSingleDoc(resourceName, id);
    client.flogger.logDocument(1)();
    return { data: dataSingle as T };
  } catch (error) {
    throw new Error(
      'Error getting id: ' + params.id + ' from collection: ' + resourceName
    );
  }
}
