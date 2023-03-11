import { doc, updateDoc } from 'firebase/firestore';
import { log, logError } from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database';

export async function DeleteSoft<T extends ra.Record>(
  resourceName: string,
  params: ra.DeleteParams,
  client: FireClient
): Promise<ra.DeleteResult<T>> {
  const { rm } = client;
  const id = params.id + '';
  const r = await rm.TryGetResource(resourceName);
  log('DeleteSoft', { resourceName, resource: r, params });
  const docObj = { deleted: true };
  await client.addUpdatedByFields(docObj);

  updateDoc(doc(r.collection, id), docObj).catch((error) => {
    logError('DeleteSoft error', { error });
  });

  return {
    data: params.previousData as T,
  };
}
