import { FireClient } from "providers/database/FireClient";
import { log, logError } from "../../misc";
import * as ra from "../../misc/react-admin-models";

export async function DeleteManySoft(
  resourceName: string,
  params: ra.DeleteManyParams,
  client: FireClient
): Promise<ra.DeleteManyResult> {
  const { rm, fireWrapper } = client;
  const r = await rm.TryGetResource(resourceName);
  log("DeleteManySoft", { resourceName, resource: r, params });
  const ids = params.ids;
  const returnData = await Promise.all(
    ids.map(async (id) => {
      const idStr = id + "";
      const docObj = { deleted: true };
      await client.addUpdatedByFields(docObj);
      r.collection
        .doc(idStr)
        .update(docObj)
        .catch((error) => {
          logError("apiSoftDeleteMany error", { error });
        });
      return idStr;
    })
  );
  return {
    data: returnData,
  };
}
