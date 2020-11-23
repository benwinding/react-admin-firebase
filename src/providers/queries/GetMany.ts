import { FireClient } from "../database/FireClient";
import { log, recursivelyMapStorageUrls } from "../../misc";
import * as ra from "../../misc/react-admin-models";

export async function GetMany<T extends ra.Record>(
  resourceName: string,
  params: ra.GetManyParams,
  client: FireClient
): Promise<ra.GetManyResult<T>> {
  const { rm, options, fireWrapper } = client;
  const r = await rm.TryGetResource(resourceName);
  log("GetMany", { resourceName, resource: r, params });
  const ids = params.ids;
  const matchDocSnaps = await Promise.all(
    ids.map((id) => r.collection.doc(id + "").get())
  );
  const matches = matchDocSnaps.map((snap) => {
    return { ...snap.data(), id: snap.id } as T;
  });
  const permittedData = options.softDelete
    ? matches.filter((row) => !row["deleted"])
    : matches;
  if (options.relativeFilePaths) {
    const data = await Promise.all(
      permittedData.map((doc) => recursivelyMapStorageUrls(fireWrapper, doc))
    );
    return {
      data,
    };
  }

  return {
    data: permittedData,
  };
}
