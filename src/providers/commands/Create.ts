import { FireClient } from "../database/FireClient";
import { log } from "../../misc";
import * as ra from "../../misc/react-admin-models";

export async function Create<T extends ra.Record>(
  resourceName: string,
  params: ra.CreateParams,
  client: FireClient
): Promise<ra.CreateResult<T>> {
  const { rm, fireWrapper } = client;
  const r = await rm.TryGetResource(resourceName);
  log("Create", { resourceName, resource: r, params });
  const hasOverridenDocId = params.data && params.data.id;
  log("Create", { hasOverridenDocId });
  if (hasOverridenDocId) {
    const overridenId = params.data.id;
    const exists = (await r.collection.doc(overridenId).get()).exists;
    if (exists) {
      throw new Error(
        `the id:"${overridenId}" already exists, please use a unique string if overriding the 'id' field`
      );
    }
    const data = await client.parseDataAndUpload(r, overridenId, params.data);
    if (!overridenId) {
      throw new Error("id must be a valid string");
    }
    const docObj = { ...data };
    client.checkRemoveIdField(docObj, overridenId);
    await client.addCreatedByFields(docObj);
    await client.addUpdatedByFields(docObj);
    log("Create", { docObj });
    await r.collection.doc(overridenId).set(docObj, { merge: false });
    return {
      data: {
        ...data,
        id: overridenId,
      },
    };
  }
  const newId = fireWrapper.db().collection("collections").doc().id;
  const data = await client.parseDataAndUpload(r, newId, params.data);
  const docObj = { ...data };
  client.checkRemoveIdField(docObj, newId);
  await client.addCreatedByFields(docObj);
  await client.addUpdatedByFields(docObj);
  await r.collection.doc(newId).set(docObj, { merge: false });
  return {
    data: {
      ...data,
      id: newId,
    },
  };
}
