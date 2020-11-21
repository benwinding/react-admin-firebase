import { FireClient } from "providers/database/FireClient";
import { log } from "../../misc";
import * as ra from "../../misc/react-admin-models";
import { DeleteManySoft } from "./DeleteMany.Soft";

type DocumentRef = firebase.firestore.DocumentReference<any>;

export async function DeleteMany(
  resourceName: string,
  params: ra.DeleteManyParams,
  client: FireClient
): Promise<ra.DeleteManyResult> {
  const { options, rm, fireWrapper } = client;
  if (options.softDelete) {
    return DeleteManySoft(resourceName, params, client);
  }
  const r = await rm.TryGetResource(resourceName);
  log("DeleteMany", { resourceName, resource: r, params });
  const returnData: ra.Identifier[] = [];
  const batch = fireWrapper.db().batch();
  for (const id of params.ids) {
    const idStr = id + '';
    const docToDelete = r.collection.doc(idStr) as DocumentRef;
    batch.delete(docToDelete);
    returnData.push(id);
  }
  try {
    await batch.commit();
  } catch (error) {
    throw new Error(error)
  }
  return { data: returnData };
}
