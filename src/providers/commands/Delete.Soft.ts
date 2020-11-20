import { FireClient } from "providers/database/FireClient";
import { log, logError } from "../../misc";
import * as ra from "../../misc/react-admin-models";

export async function DeleteSoft<T extends ra.Record>(
  resourceName: string,
  params: ra.DeleteParams,
  client: FireClient
): Promise<ra.DeleteResult<T>> {
  const { rm } = client;
  const id = params.id + "";
  const r = await rm.TryGetResource(resourceName);
  log("DeleteSoft", { resourceName, resource: r, params });
  const docObj = { deleted: true };
  await client.addUpdatedByFields(docObj);
  r.collection
    .doc(id)
    .update(docObj)
    .catch((error) => {
      logError("DeleteSoft error", { error });
    });
  return {
    data: params.previousData as T,
  };
}
