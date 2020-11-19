import { DocumentReference } from "@firebase/firestore-types";
import { FireClient } from "providers/database/FireClient";
import { log } from "../../misc";
import * as ra from "../../misc/react-admin-models";

type DocumentRef = firebase.firestore.DocumentReference<any>;

export async function DeleteMany(
  resourceName: string,
  params: ra.DeleteManyParams,
  client: FireClient
): Promise<ra.DeleteManyResult> {
  const { rm, fireWrapper } = client;
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
