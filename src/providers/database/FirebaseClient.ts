import { FirebaseFirestore } from "@firebase/firestore-types";
import { ResourceManager, IResource } from "./ResourceManager";
import { RAFirebaseOptions } from "index";
import { log, logError } from "../../misc/logger";
import { sortArray, filterArray } from "../../misc/arrayHelpers";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { IFirebaseClient } from "./IFirebaseClient";
import { messageTypes } from '../../misc/messageTypes'
import { joinPaths } from "misc/pathHelper";

export class FirebaseClient implements IFirebaseClient {
  private db: FirebaseFirestore;
  private rm: ResourceManager;

  constructor(
    private fireWrapper: IFirebaseWrapper,
    private options: RAFirebaseOptions
  ) {
    this.db = fireWrapper.db();
    this.rm = new ResourceManager(this.fireWrapper, this.options);
  }
  public async apiGetList(resourceName: string, params: messageTypes.IParamsGetList): Promise<messageTypes.IResponseGetList> {
    log("apiGetList", { resourceName, params });
    const r = await this.tryGetResource(resourceName, 'REFRESH');
    const data = r.list;
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        sortArray(data, field, "asc");
      } else {
        sortArray(data, field, "desc");
      }
    }
    const filteredData = filterArray(data, params.filter);
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = filteredData.slice(pageStart, pageEnd);
    const total = r.list.length;
    return {
      data: dataPage,
      total
    };
  }
  public async apiGetOne(resourceName: string, params: messageTypes.IParamsGetOne): Promise<messageTypes.IResponseGetOne> {
    log("apiGetOne", { resourceName, params });
    try {
      const data = await this.rm.GetSingleDoc(resourceName, params.id);
      return { data: data };      
    } catch (error) {
      throw new Error('Error getting id: ' + params.id + ' from collection: ' + resourceName);
    }
  }
  public async apiCreate(resourceName: string, params: messageTypes.IParamsCreate): Promise<messageTypes.IResponseCreate> {
    const r = await this.tryGetResource(resourceName);
    log("apiCreate", { resourceName, resource: r, params });
    const currentUserEmail = await this.getCurrentUserEmail();
    const docObj = {
      ...params.data,
      createdate: this.fireWrapper.serverTimestamp(),
      lastupdate: this.fireWrapper.serverTimestamp(),
      createdby: currentUserEmail,
      updatedby: currentUserEmail,
    };
    const hasOverridenDocId = params.data && params.data.id;
    if (hasOverridenDocId) {
      const newDocId = params.data.id;
      if (!newDocId) {
        throw new Error('id must be a valid string');
      }
      await r.collection.doc(newDocId).set(docObj, { merge: true });
      return {
        data: {
          ...params.data,
          id: newDocId
        }
      };
    }
    const ref = await r.collection.add(docObj);
    return {
      data: {
        ...params.data,
        id: ref.id
      }
    };
  }
  public async apiUpdate(resourceName: string, params: messageTypes.IParamsUpdate): Promise<messageTypes.IResponseUpdate> {
    const id = params.id;
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdate", { resourceName, resource: r, params });
    const currentUserEmail = await this.getCurrentUserEmail();
    let data = params.data;
    if (this.options.uploadToStorage) {
      const docPath = r.collection.doc(id).path;
      data = await this.parseDataAndUpload(docPath, data);
    }
    r.collection.doc(id).update({
      ...params.data,
      lastupdate: this.fireWrapper.serverTimestamp(),
      updatedby: currentUserEmail,
    }).catch((error) => {
      logError("apiUpdate error", { error });
    });
    return {
      data: {
        ...params.data,
        id: id
      }
    };
  }
  public async apiUpdateMany(resourceName: string, params: messageTypes.IParamsUpdateMany): Promise<messageTypes.IResponseUpdateMany> {
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdateMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const currentUserEmail = await this.getCurrentUserEmail();
    const returnData = ids.map((id) => {
      r.collection.doc(id).update({
        ...params.data,
        lastupdate: this.fireWrapper.serverTimestamp(),
        updatedby: currentUserEmail,
      }).catch((error) => {
        logError("apiUpdateMany error", { error });
      });
      return {
        ...params.data,
        id: id
      };
    });
    return {
      data: returnData
    };
  }
  public async apiDelete(resourceName: string, params: messageTypes.IParamsDelete): Promise<messageTypes.IResponseDelete> {
    const r = await this.tryGetResource(resourceName);
    log("apiDelete", { resourceName, resource: r, params });
    r.collection.doc(params.id).delete().catch((error) => {
      logError("apiDelete error", { error });
    });
    return {
      data: params.previousData
    };
  }
  public async apiDeleteMany(resourceName: string, params: messageTypes.IParamsDeleteMany): Promise<messageTypes.IResponseDeleteMany> {
    const r = await this.tryGetResource(resourceName);
    log("apiDeleteMany", { resourceName, resource: r, params });
    const returnData: {id: string}[] = [];
    const batch = this.db.batch();
    for (const id of params.ids) {
      batch.delete(r.collection.doc(id));
      returnData.push({ id });
    }
    batch.commit().catch((error) => {
      logError("apiDeleteMany error", { error });
    });
    return { data: returnData };
  }
  public async apiGetMany(resourceName: string, params: messageTypes.IParamsGetMany): Promise<messageTypes.IResponseGetMany> {
    const r = await this.tryGetResource(resourceName, 'REFRESH');
    log("apiGetMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const matchDocSnaps = await Promise.all(ids.map(id => r.collection.doc(id).get()))
    const matches = matchDocSnaps.map(snap => {return {...snap.data(), id: snap.id}});
    return {
      data: matches
    };
  }
  public async apiGetManyReference(
    resourceName: string,
    params: messageTypes.IParamsGetManyReference
  ): Promise<messageTypes.IResponseGetManyReference> {
    const r = await this.tryGetResource(resourceName, 'REFRESH');
    log("apiGetManyReference", { resourceName, resource: r, params });
    const data = r.list;
    const targetField = params.target;
    const targetValue = params.id;
    const matches = data.filter((val) => val[targetField] === targetValue);
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        sortArray(data, field, "asc");
      }
      else {
        sortArray(data, field, "desc");
      }
    }
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = matches.slice(pageStart, pageEnd);
    const total = matches.length;
    return { data: dataPage, total };
  }
  private async tryGetResource(resourceName: string, refresh?: 'REFRESH'): Promise<IResource> {
    if (refresh) {
      await this.rm.RefreshResource(resourceName);
    }
    return this.rm.TryGetResourcePromise(resourceName);
  }
  private async getCurrentUserEmail() {
    const user = await this.rm.getUserLogin();
    if (user) {
      return user.email;
    } else {
      return 'annonymous user';
    }
  }
  private async parseDataAndUpload(docPath: string, data: any) {
    if (!data) {
      return data;
    }
    await Promise.all(Object.keys(data).map(async (fieldName) => {
      const val = data[fieldName];
      const hasRawFile = !!val && val.hasOwnProperty('rawFile');
      if (!hasRawFile) {
        return;
      }
      const storagePath = joinPaths(docPath, fieldName);
      const storageLink = await this.saveFile(storagePath, val.rawFile);
      data[fieldName].src = storageLink;
      delete data[fieldName].rawFile;
      // const hasRawFileArray = !!val && Array.isArray(val) && !!val.length && val[0].hasOwnProperty('rawFile');
      return hasRawFile;
    }))
    return data;
  }

  private async saveFile(storagePath, rawFile): Promise<string> {
    log('saveFile() saving file...', { storagePath, rawFile });
    const task = this.fireWrapper
      .storage()
      .ref(storagePath)
      .put(rawFile);
    try {
      const taskResult: firebase.storage.UploadTaskSnapshot = await new Promise(
        (res, rej) => task.then(res).catch(rej)
      );
      const getDownloadURL = await taskResult.ref.getDownloadURL();
      log('saveFile() saved file', {
        storagePath,
        taskResult,
        getDownloadURL
      });
      return getDownloadURL;
    } catch (storageError) {
      if (storageError.code === 'storage/unknown') {
        logError(
          'saveFile() error saving file, No bucket found! Try clicking "Get Started" in firebase -> storage',
          { storageError }
        );
      } else {
        logError('saveFile() error saving file', {
          storageError
        });
      }
    }
  }
}
