import { doc, getDoc, setDoc } from 'firebase/firestore';
import { log } from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database/FireClient';

export async function Create<T extends ra.Record>(
  resourceName: string,
  params: ra.CreateParams,
  client: FireClient
): Promise<ra.CreateResult<T>> {
  const { rm, fireWrapper } = client;
  const r = await rm.TryGetResource(resourceName);
  log('Create', { resourceName, resource: r, params });
  const hasOverridenDocId = params.data && params.data.id;
  log('Create', { hasOverridenDocId });
  if (hasOverridenDocId) {
    const overridenId = params.data.id;
    const exists = (await getDoc(doc(r.collection, overridenId))).exists();
    if (exists) {
      throw new Error(
        `the id:"${overridenId}" already exists, please use a unique string if overriding the 'id' field`
      );
    }

    const createData = await client.parseDataAndUpload(
      r,
      overridenId,
      params.data
    );
    if (!overridenId) {
      throw new Error('id must be a valid string');
    }
    const createDocObj = { ...createData };
    client.checkRemoveIdField(createDocObj, overridenId);
    await client.addCreatedByFields(createDocObj);
    await client.addUpdatedByFields(createDocObj);
    const createDocObjTransformed = client.transformToDb(
      resourceName,
      createDocObj,
      overridenId
    );
    log('Create', { docObj: createDocObj });
    await setDoc(doc(r.collection, overridenId), createDocObjTransformed, {
      merge: false,
    });
    return {
      data: {
        ...createDocObjTransformed,
        id: overridenId,
      },
    };
  }
  const newId = fireWrapper.dbMakeNewId();
  const data = await client.parseDataAndUpload(r, newId, params.data);
  const docObj = { ...data };
  client.checkRemoveIdField(docObj, newId);
  await client.addCreatedByFields(docObj);
  await client.addUpdatedByFields(docObj);
  const docObjTransformed = client.transformToDb(resourceName, docObj, newId);
  await setDoc(doc(r.collection, newId), docObjTransformed, { merge: false });
  return {
    data: {
      ...docObjTransformed,
      id: newId,
    },
  };
}
