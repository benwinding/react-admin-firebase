import { FirebaseFirestore } from "@firebase/firestore-types";
import { ResourceManager, IResource } from "./ResourceManager";
import { RAFirebaseOptions } from "../RAFirebaseOptions";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { IFirebaseClient } from "./IFirebaseClient";
import {
  filterArray,
  joinPaths,
  log,
  logError,
  messageTypes,
  sortArray
} from "../../misc";

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

  public async apiGetList(
    resourceName: string,
    params: messageTypes.IParamsGetList
  ): Promise<messageTypes.IResponseGetList> {
    log("apiGetList", { resourceName, params });

    const collectionQuery = params.filter.collectionQuery;
    delete params.filter.collectionQuery;

    const r = await this.tryGetResource(
      resourceName,
      "REFRESH",
      collectionQuery
    );
    const data = r.list;
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        sortArray(data, field, "asc");
      } else {
        sortArray(data, field, "desc");
      }
    }
    // @ts-ignore
    const filteredData = filterArray(data, params.filter);
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = filteredData.slice(pageStart, pageEnd);
    const total = filteredData.length;
    return {
      data: dataPage,
      total
    };
  }
  public async apiGetOne(
    resourceName: string,
    params: messageTypes.IParamsGetOne
  ): Promise<messageTypes.IResponseGetOne> {
    log("apiGetOne", { resourceName, params });
    try {
      const data = await this.rm.GetSingleDoc(resourceName, params.id);
      return { data: data };
    } catch (error) {
      throw new Error(
        "Error getting id: " + params.id + " from collection: " + resourceName
      );
    }
  }
  public async apiCreate(
    resourceName: string,
    params: messageTypes.IParamsCreate
  ): Promise<messageTypes.IResponseCreate> {
    const r = await this.tryGetResource(resourceName);
    log("apiCreate", { resourceName, resource: r, params });
    const hasOverridenDocId = params.data && params.data.id;
    log("apiCreate", { hasOverridenDocId });
    if (hasOverridenDocId) {
      const overridenId = params.data.id;
      const exists = (await r.collection.doc(overridenId).get()).exists;
      if (exists) {
        throw new Error(
          `the id:"${overridenId}" already exists, please use a unique string if overriding the 'id' field`
        );
      }
      const data = await this.parseDataAndUpload(r, overridenId, params.data);
      if (!overridenId) {
        throw new Error("id must be a valid string");
      }
      const docObj = { ...data };
      this.checkRemoveIdField(docObj);
      await this.addCreatedByFields(docObj);
      await this.addUpdatedByFields(docObj);
      log("apiCreate", { docObj });
      await r.collection.doc(overridenId).set(docObj, { merge: false });
      return {
        data: {
          ...data,
          id: overridenId
        }
      };
    }
    const newId = this.db.collection("collections").doc().id;
    const data = await this.parseDataAndUpload(r, newId, params.data);
    const docObj = { ...data };
    this.checkRemoveIdField(docObj);
    await this.addCreatedByFields(docObj);
    await this.addUpdatedByFields(docObj);
    await r.collection.doc(newId).set(docObj, { merge: false });
    return {
      data: {
        ...data,
        id: newId
      }
    };
  }
  public async apiUpdate(
    resourceName: string,
    params: messageTypes.IParamsUpdate
  ): Promise<messageTypes.IResponseUpdate> {
    const id = params.id;
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdate", { resourceName, resource: r, params });
    const data = await this.parseDataAndUpload(r, id, params.data);
    const docObj = { ...data };
    this.checkRemoveIdField(docObj);
    await this.addUpdatedByFields(docObj);
    r.collection
      .doc(id)
      .update(docObj)
      .catch(error => {
        logError("apiUpdate error", { error });
      });
    return {
      data: {
        ...data,
        id: id
      }
    };
  }
  public async apiUpdateMany(
    resourceName: string,
    params: messageTypes.IParamsUpdateMany
  ): Promise<messageTypes.IResponseUpdateMany> {
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdateMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const returnData = await Promise.all(
      ids.map(async id => {
        const data = await this.parseDataAndUpload(r, id, params.data);
        const docObj = { ...data };
        this.checkRemoveIdField(docObj);
        await this.addUpdatedByFields(docObj);
        r.collection
          .doc(id)
          .update(docObj)
          .catch(error => {
            logError("apiUpdateMany error", { error });
          });
        return {
          ...data,
          id: id
        };
      })
    );
    return {
      data: returnData
    };
  }
  public async apiSoftDelete(
    resourceName: string,
    params: messageTypes.IParamsUpdate
  ): Promise<messageTypes.IResponseUpdate> {
    const id = params.id;
    const r = await this.tryGetResource(resourceName);
    log("apiSoftDelete", { resourceName, resource: r, params });
    const docObj = { deleted: true };
    await this.addUpdatedByFields(docObj);
    r.collection
      .doc(id)
      .update(docObj)
      .catch(error => {
        logError("apiSoftDelete error", { error });
      });
    return {
      data: {
        ...params.previousData,
        id: id
      },
    };
  }
  public async apiSoftDeleteMany(
    resourceName: string,
    params: messageTypes.IParamsUpdateMany
  ): Promise<messageTypes.IResponseUpdateMany> {
    const r = await this.tryGetResource(resourceName);
    log("apiSoftDeleteMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const returnData = await Promise.all(
      ids.map(async id => {
        const docObj = { deleted: true };
        await this.addUpdatedByFields(docObj);
        r.collection
          .doc(id)
          .update(docObj)
          .catch(error => {
            logError("apiSoftDeleteMany error", { error });
          });
        return {
          ...params.data,
          id: id
        };
      })
    );
    return {
      data: returnData
    };
  }
  public async apiDelete(
    resourceName: string,
    params: messageTypes.IParamsDelete
  ): Promise<messageTypes.IResponseDelete> {
    const r = await this.tryGetResource(resourceName);
    log("apiDelete", { resourceName, resource: r, params });
    r.collection
      .doc(params.id)
      .delete()
      .catch(error => {
        logError("apiDelete error", { error });
      });
    return {
      data: params.previousData
    };
  }
  public async apiDeleteMany(
    resourceName: string,
    params: messageTypes.IParamsDeleteMany
  ): Promise<messageTypes.IResponseDeleteMany> {
    const r = await this.tryGetResource(resourceName);
    log("apiDeleteMany", { resourceName, resource: r, params });
    const returnData: { id: string }[] = [];
    const batch = this.db.batch();
    for (const id of params.ids) {
      batch.delete(r.collection.doc(id));
      returnData.push({ id });
    }
    batch.commit().catch(error => {
      logError("apiDeleteMany error", { error });
    });
    return { data: returnData };
  }
  public async apiGetMany(
    resourceName: string,
    params: messageTypes.IParamsGetMany
  ): Promise<messageTypes.IResponseGetMany> {
    const r = await this.tryGetResource(resourceName, "REFRESH");
    log("apiGetMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const matchDocSnaps = await Promise.all(
      ids.map(id => r.collection.doc(id).get())
    );
    const matches = matchDocSnaps.map(snap => {
      return { ...snap.data(), id: snap.id };
    });
    const permittedData = this.options.softDelete ? matches.filter(row => !row['deleted']) : matches;
    return {
      data: permittedData
    };
  }
  public async apiGetManyReference(
    resourceName: string,
    params: messageTypes.IParamsGetManyReference
  ): Promise<messageTypes.IResponseGetManyReference> {
    const r = await this.tryGetResource(resourceName, "REFRESH");
    log("apiGetManyReference", { resourceName, resource: r, params });
    const data = r.list;
    const targetField = params.target;
    const targetValue = params.id;
    const matches = data.filter(val => val[targetField] === targetValue);
    const permittedData = this.options.softDelete ? matches.filter(row => !row['deleted']) : matches;
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        sortArray(permittedData, field, "asc");
      } else {
        sortArray(permittedData, field, "desc");
      }
    }
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = permittedData.slice(pageStart, pageEnd);
    const total = permittedData.length;
    return { data: dataPage, total };
  }
  private async tryGetResource(
    resourceName: string,
    refresh?: "REFRESH",
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    if (refresh) {
      await this.rm.RefreshResource(resourceName, collectionQuery);
    }
    return this.rm.TryGetResourcePromise(resourceName, collectionQuery);
  }
  private async getCurrentUserEmail() {
    const user = await this.rm.getUserLogin();
    if (user) {
      return user.email;
    } else {
      return "annonymous user";
    }
  }
  private async getCurrentUserId() {
    const user = await this.rm.getUserLogin();
    if (user) {
      return user.uid;
    } else {
      return "annonymous user";
    }
  }

  private async parseDataAndUpload(r: IResource, id: string, data: any) {
    if (!data) {
      return data;
    }
    const docPath = r.collection.doc(id).path;

    await Promise.all(
      Object.keys(data).map(async fieldName => {
        const val = data[fieldName];
        const isArray = Array.isArray(val);
        if (isArray) {
          await Promise.all(
            (val as []).map((arrayObj, index) => {
              if (!!val[index] && val[index].hasOwnProperty("rawFile")) {
                return Promise.all([
                  this.parseDataField(val[index], docPath, fieldName + index)
                ]);
              } else {
                return Promise.all(
                  Object.keys(arrayObj).map(arrayObjFieldName => {
                    const arrayObjVal = arrayObj[arrayObjFieldName];
                    return this.parseDataField(
                      arrayObjVal,
                      docPath,
                      fieldName + arrayObjFieldName + index
                    );
                  })
                );
              }
            })
          );
        }
        await this.parseDataField(val, docPath, fieldName);
      })
    );
    return data;
  }

  private checkRemoveIdField(obj: any) {
    if (this.options.dontAddIdFieldToDoc) {
      delete obj.id
    }
  }

  private async addCreatedByFields(obj: any) {
    if (this.options.disableMeta) {
      return;
    }
    const currentUserIdentifier = this.options.associateUsersById ? await this.getCurrentUserId() : await this.getCurrentUserEmail();
    switch (this.options.metaFieldCasing) {
      case 'camel':
        obj.createDate = this.fireWrapper.serverTimestamp();
        obj.createdBy = currentUserIdentifier;
        break;
      case 'snake':
        obj.create_date = this.fireWrapper.serverTimestamp();
        obj.created_by = currentUserIdentifier;
        break;
      case 'pascal':
        obj.CreateDate = this.fireWrapper.serverTimestamp();
        obj.CreatedBy = currentUserIdentifier;
        break;
      case 'kebab':
        obj['create-date'] = this.fireWrapper.serverTimestamp();
        obj['created-by'] = currentUserIdentifier;
        break;
      default:
        obj.createdate = this.fireWrapper.serverTimestamp();
        obj.createdby = currentUserIdentifier;
        break;
    }
  }

  private async addUpdatedByFields(obj: any) {
    if (this.options.disableMeta) {
      return;
    }
    const currentUserIdentifier = this.options.associateUsersById ? await this.getCurrentUserId() : await this.getCurrentUserEmail();
    switch (this.options.metaFieldCasing) {
      case 'camel':
        obj.lastUpdate = this.fireWrapper.serverTimestamp();
        obj.updatedBy = currentUserIdentifier;
        break;
      case 'snake':
        obj.last_update = this.fireWrapper.serverTimestamp();
        obj.updated_by = currentUserIdentifier;
        break;
      case 'pascal':
        obj.LastUpdate = this.fireWrapper.serverTimestamp();
        obj.UpdatedBy = currentUserIdentifier;
        break;
      case 'kebab':
        obj['last-update'] = this.fireWrapper.serverTimestamp();
        obj['updated-by'] = currentUserIdentifier;
        break;
      default:
        obj.lastupdate = this.fireWrapper.serverTimestamp();
        obj.updatedby = currentUserIdentifier;
        break;
    }
  }

  private async parseDataField(ref: any, docPath: string, fieldPath: string) {
    const hasRawFile = !!ref && ref.hasOwnProperty("rawFile");
    if (!hasRawFile) {
      return;
    }
    ref.src = await this.uploadAndGetLink(ref.rawFile, docPath, fieldPath);
    delete ref.rawFile;
  }

  private async uploadAndGetLink(
    rawFile: any,
    docPath: string,
    fieldPath: string
  ): Promise<string> {
    const storagePath = joinPaths(docPath, fieldPath);
    const storageLink = await this.saveFile(storagePath, rawFile);
    return storageLink;
  }

  private async saveFile(storagePath: string, rawFile: any): Promise<string> {
    log("saveFile() saving file...", { storagePath, rawFile });
    const task = this.fireWrapper
      .storage()
      .ref(storagePath)
      .put(rawFile);
    try {
      const taskResult: firebase.storage.UploadTaskSnapshot = await new Promise(
        (res, rej) => task.then(res).catch(rej)
      );
      const getDownloadURL = await taskResult.ref.getDownloadURL();
      log("saveFile() saved file", {
        storagePath,
        taskResult,
        getDownloadURL
      });
      return getDownloadURL;
    } catch (storageError) {
      if (storageError.code === "storage/unknown") {
        logError(
          'saveFile() error saving file, No bucket found! Try clicking "Get Started" in firebase -> storage',
          { storageError }
        );
      } else {
        logError("saveFile() error saving file", {
          storageError
        });
      }
    }
  }
}
