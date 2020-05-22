import {
  CollectionReference,
  DocumentSnapshot,
  FirebaseFirestore,
  OrderByDirection,
  Query
} from "@firebase/firestore-types";
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
  parseFireStoreDocument,
  sortArray
} from "../../misc";
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

  public async apiGetList(
    resourceName: string,
    params: messageTypes.IParamsGetList
  ): Promise<messageTypes.IResponseGetList> {
    if (this.options.lazyLoading) {
      return this.apiGetListLazy(resourceName, params);
    }


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
    const dataPage = filteredData.slice(pageStart, pageEnd);
    const total = filteredData.length;
    return {
      data: dataPage,
      total
    };
  }
  private async apiGetListLazy(
    resourceName: string,
    params: messageTypes.IParamsGetList
  ): Promise<messageTypes.IResponseGetList> {
    const r = await this.tryGetResource(resourceName);
    log("apiGetListLazy", { resourceName, params });
    let query: Query = r.collection;

    const filters = this.options.softDelete ? {
      ...params.filter,
      deleted: false
    } : params.filter;

    query = this.filtersToQuery(query, filters);
    query = this.sortToQuery(query, params.sort);

    const { page, perPage } = params.pagination;
    const fullParams = { ...params, filter: filters };

    if (page === 1) {
      query = query.limit(perPage);
    } else {
      let queryCursor = await this.getQueryCursor(r.collection, params);
      if (!queryCursor) {
        queryCursor = await this.findLastQueryCursor(r.collection, query, fullParams);
      }
      query = query.startAfter(queryCursor).limit(perPage);
    }

    const snapshots = await query.get();

    if (snapshots.docs.length === 0) {
      log("apiGetListLazy - result", { message: 'There are not records for given query' });
      return { data: [], total: 100000 };
    }

    const data = snapshots.docs.map(doc => parseFireStoreDocument(doc));
    this.setQueryCursor(
      snapshots.docs[snapshots.docs.length - 1],
      fullParams
    );
    log("apiGetListLazy - result", { data });
    return { data, total: 100000 };
  }

  public async apiGetOne(
    resourceName: string,
    params: messageTypes.IParamsGetOne
  ): Promise<messageTypes.IResponseGetOne> {
    log("apiGetOne", { resourceName, params });
    try {
      const data = await this.rm.GetSingleDoc(resourceName, params.id);
      return { data };
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

    let newId: string;
    if (hasOverridenDocId) {
      const overriddenId = params.data.id;
      const exists = (await r.collection.doc(overriddenId).get()).exists;
      if (exists) {
        throw new Error(
          `the id:"${overriddenId}" already exists, please use a unique string if overriding the 'id' field`
        );
      }
      if (!overriddenId) {
        throw new Error("id must be a valid string");
      }
      newId = overriddenId;
    } else {
      newId = this.db.collection("collections").doc().id;
    }

    const createDoc = async (id) => {
      const data = await this.parseDataAndUpload(r, id, params.data);
      const docObj = { ...data };
      this.checkRemoveIdField(docObj);
      await this.addCreatedByFields(docObj);
      await this.addUpdatedByFields(docObj);
      log("apiCreate", { docObj });
      await r.collection.doc(id).set(docObj, { merge: false });
      return {
        data: {
          ...data,
          id
        }
      };
    };

    return createDoc(newId);
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
        await r.collection
          .doc(id)
          .update(docObj);
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
    try {
      await r.collection
        .doc(params.id)
        .delete()
    } catch (error) {
      throw new Error(error)
    }
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
    try {
      await batch.commit();
    } catch (error) {
      throw new Error(error)
    }
    return { data: returnData };
  }
  public async apiGetMany(
    resourceName: string,
    params: messageTypes.IParamsGetMany
  ): Promise<messageTypes.IResponseGetMany> {
    const r = await this.tryGetResource(resourceName);
    log("apiGetMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const matchDocSnaps = await Promise.all(
      ids.map(id => r.collection.doc(id).get())
    );
    const matches = matchDocSnaps.map(snap => parseFireStoreDocument(snap));
    const permittedData = this.options.softDelete ? matches.filter(row => !row['deleted']) : matches;
    return {
      data: permittedData
    };
  }

  public async apiGetManyReference(
    resourceName: string,
    params: messageTypes.IParamsGetManyReference
  ): Promise<messageTypes.IResponseGetManyReference> {
    if (this.options.lazyLoading) {
      return this.apiGetManyReferenceLazy(resourceName, params);
    }

    const r = await this.tryGetResource(resourceName, "REFRESH");
    log("apiGetManyReference", { resourceName, resource: r, params });
    const data = r.list;
    const targetField = params.target;
    const targetValue = params.id;
    const filterSafe = params.filter || {};
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
    const dataPage = permittedData.slice(pageStart, pageEnd);
    const total = permittedData.length;
    return { data: dataPage, total };
  }

  private async apiGetManyReferenceLazy(
    resourceName: string,
    params: messageTypes.IParamsGetManyReference
  ): Promise<messageTypes.IResponseGetManyReference> {
    const r = await this.tryGetResource(resourceName);
    log("apiGetManyReference", { resourceName, resource: r, params });
    let query: Query = r.collection;
    const queryFilters = this.options.softDelete ? {
      ...params.filter,
      [params.target]: params.id,
      deleted: false
    } : {
      ...params.filter,
      [params.target]: params.id
    };
    query = this.filtersToQuery(query, queryFilters);
    query = this.sortToQuery(query, params.sort);

    const snapshots = await query.get();
    const data = snapshots.docs.map(doc => parseFireStoreDocument(doc));
    return { data, total: data.length };
  }


  private filtersToQuery(query: Query, filters: { [fieldName: string]: any }): Query {
    Object.keys(filters).forEach(fieldName => {
      query = query.where(fieldName, '==', filters[fieldName]);
    });
    return query;
  }

  private sortToQuery(query: Query, sort: { field: string, order: string }): Query {
    if (sort != null && sort.field !== 'id') {
      const { field, order } = sort;
      const parsedOrder = order.toLocaleLowerCase() as OrderByDirection;
      query = query.orderBy(field, parsedOrder);
    }
    return query;
  }

  private setQueryCursor(doc: DocumentSnapshot, params: messageTypes.IParamsGetList) {
    const key = btoa(JSON.stringify(params));
    localStorage.setItem(key, doc.id);

    const localCursorKeys = localStorage.getItem('ra-firebase-cursor-keys');
    if (!localCursorKeys) {
      localStorage.setItem('ra-firebase-cursor-keys', JSON.stringify([key]));
    } else {
      const cursors: string[] = JSON.parse(localCursorKeys);
      const newCursors = cursors.concat(key);
      localStorage.setItem('ra-firebase-cursor-keys', JSON.stringify(newCursors));
    }
  }

  private async getQueryCursor(collection: CollectionReference, params: messageTypes.IParamsGetList): Promise<DocumentSnapshot | boolean> {
    const key = btoa(JSON.stringify(params));
    const docId = localStorage.getItem(key);
    if (!docId) {
      return false;
    }

    const doc = await collection.doc(docId).get();
    return doc.exists && doc;
  }

  private clearQueryCursors() {
    const localCursorKeys = localStorage.getItem('ra-firebase-cursor-keys');
    if (localCursorKeys) {
      const cursors: string[] = JSON.parse(localCursorKeys);
      cursors.forEach(cursor => localStorage.removeItem(cursor));
      localStorage.removeItem('ra-firebase-cursor-keys');
    }
  }

  private async findLastQueryCursor(collection: CollectionReference, query: Query, params: messageTypes.IParamsGetList) {
    const { page, perPage } = params.pagination;
    const previousPage = page - 1;

    for (let i = previousPage; i > 1; i--) {
      const currentPageParams = {
        ...params,
        pagination: {
          ...params.pagination,
          page: i
        }
      };

      const currentPageQueryCursor = await this.getQueryCursor(collection, currentPageParams);
      if (currentPageQueryCursor) {
        return currentPageQueryCursor;
      }
    }
    const limit = previousPage * perPage;
    const newQuery = query.limit(limit);
    const snapshots = await newQuery.get();
    return snapshots.docs[snapshots.docs.length - 1];
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
        const link = await this.uploadAndGetLink(u.rawFile, docPath, u.fieldSlashesPath);
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
    fieldPath: string
  ): Promise<string> {
    const storagePath = joinPaths(docPath, fieldPath);
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
