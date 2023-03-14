import { deleteDoc, doc } from 'firebase/firestore';
import { log } from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database/FireClient';
import { DeleteSoft } from './Delete.Soft';

export async function Delete<T extends ra.Record>(
  resourceName: string,
  params: ra.DeleteParams,
  client: FireClient
): Promise<ra.DeleteResult<T>> {
  const { rm, options } = client;
  if (options.softDelete) {
    return DeleteSoft(resourceName, params, client);
  }
  const r = await rm.TryGetResource(resourceName);
  log('apiDelete', { resourceName, resource: r, params });
  try {
    const id = params.id + '';

    await deleteDoc(doc(r.collection, id));
  } catch (error) {
    throw new Error(error as any);
  }
  return {
    data: params.previousData as T,
  };
}
