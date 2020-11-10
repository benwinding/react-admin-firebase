import { FirebaseFirestore } from "@firebase/firestore-types";
import { IResource, ResourceManager } from "./ResourceManager";
import { RAFirebaseOptions } from "../RAFirebaseOptions";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { IFirebaseClient } from "./IFirebaseClient";
import {
  filterArray,
  joinPaths,
  log,
  logError,
  messageTypes,
  parseDocGetAllUploads,
  recursivelyMapStorageUrls,
  sortArray
} from "../../misc";
import * as ra from '../../misc/react-admin-models';
import { set } from "lodash";

export class FirebaseClient implements IFirebaseClient {
  private db: FirebaseFirestore;
  private rm: ResourceManager;

  constructor(
    private fireWrapper: IFirebaseWrapper,
    public options: RAFirebaseOptions
  ) {
    this.db = fireWrapper.db();
    this.rm = new ResourceManager(this.fireWrapper, this.options);
  }

  public async apiGetList<T>(
    resourceName: string,
    params: ra.GetListParams
  ): Promise<ra.GetListResult<T>> {
    log("apiGetList", { resourceName, params });

    const filterSafe = params.filter || {};

    const collectionQuery = filterSafe.collectionQuery;
    delete filterSafe.collectionQuery;

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
    let softDeleted = data;
    if (this.options.softDelete && !Object.keys(filterSafe).includes('deleted')) {
      softDeleted = data.filter(doc => !doc['deleted'])
    }
    const filteredData = filterArray(softDeleted, filterSafe);
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = filteredData.slice(pageStart, pageEnd) as T[];
    const total = filteredData.length;

    if (this.options.relativeFilePaths) {
      const data = await Promise.all(
        dataPage.map((doc) => recursivelyMapStorageUrls(this.fireWrapper, doc))
      );
      return {
        data,
        total
      };
    }

    return {
      data: dataPage,
      total
    };
  }
  public async apiGetOne<T>(
    resourceName: string,
    params: ra.GetOneParams
  ): Promise<ra.GetOneResult<T>> {
    log("apiGetOne", { resourceName, params });
    try {
      const id = params.id + '';
      const dataSingle = await this.rm.GetSingleDoc(resourceName, id);
      const data = await recursivelyMapStorageUrls(this.fireWrapper, dataSingle);
      return { data: data };
    } catch (error) {
      throw new Error(
        "Error getting id: " + params.id + " from collection: " + resourceName
      );
    }
  }
  public async apiCreate<T>(
    resourceName: string,
    params: ra.CreateParams
  ): Promise<ra.CreateResult<T>> {
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
  public async apiUpdate<T>(
    resourceName: string,
    params: ra.UpdateParams
  ): Promise<ra.UpdateResult<T>> {
    const id = params.id+'';
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
    params: ra.UpdateManyParams
  ): Promise<ra.UpdateManyResult> {
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdateMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const returnData = await Promise.all(
      ids.map(async id => {
        const idStr = id+'';
        const data = await this.parseDataAndUpload(r, idStr, params.data);
        const docObj = { ...data };
        this.checkRemoveIdField(docObj);
        await this.addUpdatedByFields(docObj);
        await r.collection
          .doc(idStr)
          .update(docObj);
        return {
          ...data,
          id: idStr
        };
      })
    );
    return {
      data: returnData
    };
  }
  public async apiSoftDelete(
    resourceName: string,
    params: ra.DeleteParams
  ): Promise<ra.DeleteResult> {
    const id = params.id+'';
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
    params: ra.DeleteManyParams
  ): Promise<ra.DeleteManyResult> {
    const r = await this.tryGetResource(resourceName);
    log("apiSoftDeleteMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const returnData = await Promise.all(
      ids.map(async id => {
        const idStr = id+'';
        const docObj = { deleted: true };
        await this.addUpdatedByFields(docObj);
        r.collection
          .doc(idStr)
          .update(docObj)
          .catch(error => {
            logError("apiSoftDeleteMany error", { error });
          });
        return idStr;
      })
    );
    return {
      data: returnData
    };
  }
  public async apiDelete<T extends ra.Record>(
    resourceName: string,
    params: ra.DeleteParams
  ): Promise<ra.DeleteResult<T>> {
    const r = await this.tryGetResource(resourceName);
    log("apiDelete", { resourceName, resource: r, params });
    try {
      const id = params.id+'';
      await r.collection
        .doc(id)
        .delete()
    } catch (error) {
      throw new Error(error)
    }
    return {
      data: params.previousData as T
    };
  }
  public async apiDeleteMany(
    resourceName: string,
    params: ra.DeleteManyParams
  ): Promise<ra.DeleteManyResult> {
    const r = await this.tryGetResource(resourceName);
    log("apiDeleteMany", { resourceName, resource: r, params });
    const returnData: ra.Identifier[] = [];
    const batch = this.db.batch();
    for (const id of params.ids) {
      const idStr = id + '';
      batch.delete(r.collection.doc(idStr));
      returnData.push(id);
    }
    try {
      await batch.commit();
    } catch (error) {
      throw new Error(error)
    }
    return { data: returnData };
  }
  public async apiGetMany<T extends ra.Record>(
    resourceName: string,
    params: ra.GetManyParams
  ): Promise<ra.GetManyResult<T>> {
    // No refresh here, it was probably bug, as in this method,
    // we are getting docs by ids
    const r = await this.tryGetResource(resourceName);
    log("apiGetMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const matchDocSnaps = await Promise.all(
      ids.map(id => r.collection.doc(id+'').get())
    );
    const matches = matchDocSnaps.map(snap => {
      return { ...snap.data(), id: snap.id } as T;
    });
    const permittedData = this.options.softDelete ? matches.filter(row => !row['deleted']): matches;
    if (this.options.relativeFilePaths) {
      const data = await Promise.all(
        permittedData.map((doc) =>
          recursivelyMapStorageUrls(this.fireWrapper, doc)
        )
      );
      return {
        data
      };
    }

    return {
      data: permittedData
    };
  }
  public async apiGetManyReference<T>(
    resourceName: string,
    params: ra.GetManyReferenceParams
  ): Promise<ra.GetManyReferenceResult<T>> {
    const filterSafe = params.filter || {};
    const collectionQuery = filterSafe.collectionQuery;
    delete filterSafe.collectionQuery;

    const r = await this.tryGetResource(
      resourceName,
      "REFRESH",
      collectionQuery
    );
    log("apiGetManyReference", { resourceName, resource: r, params });
    const data = r.list;
    const targetField = params.target;
    const targetValue = params.id;
    let softDeleted = data;
    if (this.options.softDelete) {
      softDeleted = data.filter(doc => !doc['deleted'])
    }
    const filteredData = filterArray(softDeleted, filterSafe);
    const targetIdFilter = {};
    targetIdFilter[targetField] = targetValue;
    const permittedData = filterArray(filteredData, targetIdFilter);
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
    const dataPage = permittedData.slice(pageStart, pageEnd) as T[];
    const total = permittedData.length;

    if (this.options.relativeFilePaths) {
      const data = await Promise.all(
        permittedData.map((doc) =>
          recursivelyMapStorageUrls(this.fireWrapper, doc)
        )
      );
      return { data, total };
    }

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

    const uploads = parseDocGetAllUploads(data);
    await Promise.all(
      uploads.map(async (u) => {
        const link = await this.uploadAndGetLink(u.rawFile, docPath, u.fieldSlashesPath, this.options.useFileNamesInStorage);
        set(data, u.fieldDotsPath + '.src', link);
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

  private async uploadAndGetLink(
    rawFile: any,
    docPath: string,
    fieldPath: string,
    useFileName: boolean
  ): Promise<string> {
    const storagePath = useFileName ? 
      joinPaths(docPath, fieldPath, rawFile.name) : 
      joinPaths(docPath, fieldPath);
    return await this.saveFile(storagePath, rawFile);
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
      return this.options.relativeFilePaths ? storagePath : getDownloadURL;
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
