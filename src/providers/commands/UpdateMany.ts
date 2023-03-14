import { doc, updateDoc } from 'firebase/firestore';
import { log } from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database';

export async function UpdateMany(
  resourceName: string,
  params: ra.UpdateManyParams,
  client: FireClient
): Promise<ra.UpdateManyResult> {
  const { rm } = client;
  log('UpdateMany', { resourceName, params });
  delete params.data.id;
  const r = await rm.TryGetResource(resourceName);
  log('UpdateMany', { resourceName, resource: r, params });
  const ids = params.ids;
  const returnData = await Promise.all(
    ids.map(async (id) => {
      const idStr = id + '';
      const data = await client.parseDataAndUpload(r, idStr, params.data);
      const docObj = { ...data };
      client.checkRemoveIdField(docObj, idStr);
      await client.addUpdatedByFields(docObj);
      const docObjTransformed = client.transformToDb(
        resourceName,
        docObj,
        idStr
      );
      await updateDoc(doc(r.collection, idStr), docObjTransformed);
      return {
        ...data,
        id: idStr,
      };
    })
  );
  return {
    data: returnData,
  };
}
