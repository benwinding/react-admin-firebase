import { doc, updateDoc } from 'firebase/firestore';
import { log, logError } from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database';

export async function DeleteManySoft(
  resourceName: string,
  params: ra.DeleteManyParams,
  client: FireClient
): Promise<ra.DeleteManyResult> {
  const { rm } = client;
  const r = await rm.TryGetResource(resourceName);
  log('DeleteManySoft', { resourceName, resource: r, params });
  const ids = params.ids;
  const returnData = await Promise.all(
    ids.map(async (id) => {
      const idStr = id + '';
      const docObj = { deleted: true };
      await client.addUpdatedByFields(docObj);
      updateDoc(doc(r.collection, idStr), docObj).catch((error) => {
        logError('apiSoftDeleteMany error', { error });
      });
      return idStr;
    })
  );
  return {
    data: returnData,
  };
}
