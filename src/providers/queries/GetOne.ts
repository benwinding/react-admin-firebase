import { FireClient } from "providers/database/FireClient";
import { log, recursivelyMapStorageUrls } from "../../misc";
import * as ra from "../../misc/react-admin-models";

export async function GetOne<T extends ra.Record>(
  resourceName: string,
  params: ra.GetOneParams,
  client: FireClient
): Promise<ra.GetOneResult<T>> {
  log("GetOne", { resourceName, params });
  const { rm, fireWrapper, options } = client;
  try {
    const id = params.id + "";
    const dataSingle = await rm.GetSingleDoc(resourceName, id);
    if (options.relativeFilePaths) {
      const data = await recursivelyMapStorageUrls(fireWrapper, dataSingle);
      return { data: data };
    }
    return { data: dataSingle as any };
  } catch (error) {
    throw new Error(
      "Error getting id: " + params.id + " from collection: " + resourceName
    );
  }
}
