import { FireClient } from "../database/FireClient";
import { log } from "../../misc";
import * as ra from "../../misc/react-admin-models";

export async function Update<T extends ra.Record>(
  resourceName: string,
  params: ra.UpdateParams,
  client: FireClient
): Promise<ra.UpdateResult<T>> {
  const { rm } = client;
  log("Update", { resourceName, params });
  const id = params.id + "";
  delete params.data.id;
  const r = await rm.TryGetResource(resourceName);
  log("Update", { resourceName, resource: r, params });
  const data = await client.parseDataAndUpload(r, id, params.data);
  const docObj = { ...data };
  client.checkRemoveIdField(docObj, id);
  await client.addUpdatedByFields(docObj);
  const docObjTransformed = client.transformToDb(resourceName, docObj, id);
  await r.collection.doc(id).update(docObjTransformed);
  return {
    data: {
      ...data,
      id: id,
    },
  };
}
