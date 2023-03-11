import { doc } from 'firebase/firestore';
import { log } from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database';
import { DeleteManySoft } from './DeleteMany.Soft';

export async function DeleteMany(
  resourceName: string,
  params: ra.DeleteManyParams,
  client: FireClient
): Promise<ra.DeleteManyResult> {
  const { options, rm, fireWrapper } = client;
  if (options.softDelete) {
    return DeleteManySoft(resourceName, params, client);
  }
  const r = await rm.TryGetResource(resourceName);
  log('DeleteMany', { resourceName, resource: r, params });
  const returnData: ra.Identifier[] = [];
  const batch = fireWrapper.dbCreateBatch();
  for (const id of params.ids) {
    const idStr = id + '';
    const docToDelete = doc(r.collection, idStr);
    batch.delete(docToDelete);
    returnData.push(id);
  }

  try {
    await batch.commit();
  } catch (error) {
    throw new Error(error as any);
  }
  return { data: returnData };
}
