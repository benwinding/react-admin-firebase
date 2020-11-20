import { FireClient } from "providers/database/FireClient";
import { log } from "../../misc";
import * as ra from "../../misc/react-admin-models";

export async function Delete<T extends ra.Record>(
  resourceName: string,
  params: ra.DeleteParams,
  client: FireClient
): Promise<ra.DeleteResult<T>> {
  const { rm, options } = client;
  const r = await rm.TryGetResource(resourceName);
  log("apiDelete", { resourceName, resource: r, params });
  try {
    const id = params.id + "";
    await r.collection.doc(id).delete();
  } catch (error) {
    throw new Error(error);
  }
  return {
    data: params.previousData as T,
  };
}
