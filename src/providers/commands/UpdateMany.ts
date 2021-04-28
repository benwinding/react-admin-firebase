import { FireClient } from "../database/FireClient";
import { log } from "../../misc";
import * as ra from "../../misc/react-admin-models";

export async function UpdateMany(
  resourceName: string,
  params: ra.UpdateManyParams,
  client: FireClient
): Promise<ra.UpdateManyResult> {
  const { rm } = client;
  log("UpdateMany", { resourceName, params });
  delete params.data.id;
  const r = await rm.TryGetResource(resourceName);
  log("UpdateMany", { resourceName, resource: r, params });
  const ids = params.ids;
  const returnData = await Promise.all(
    ids.map(async id => {
      const idStr = id+'';
      const data = await client.parseDataAndUpload(r, idStr, params.data);
      const docObj = { ...data };
      client.checkRemoveIdField(docObj, idStr);
      await client.addUpdatedByFields(docObj);
      await r.collection
        .doc(idStr)
        .update(docObj);
      return {
        ...data,
        id: idStr
      };
    })
  );
  return {
    data: returnData
  };
}
