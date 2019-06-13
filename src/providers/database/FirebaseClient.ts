import { FirebaseFirestore } from "@firebase/firestore-types";
import { ResourceManager, IResource } from "./ResourceManager";
import { RAFirebaseOptions } from "index";
import { log, logError } from "../../misc/logger";
import { sortArray, filterArray } from "../../misc/arrayHelpers";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { IFirebaseClient } from "./IFirebaseClient";
import { messageTypes } from '../../misc/messageTypes'

export class FirebaseClient implements IFirebaseClient {
  private db: FirebaseFirestore;
  private rm: ResourceManager;

  constructor(
    private fireWrapper: IFirebaseWrapper,
    private options: RAFirebaseOptions
  ) {
    this.db = fireWrapper.db();
    this.rm = new ResourceManager(this.db, this.options);
  }
  public async apiGetList(resourceName: string, params: messageTypes.IParamsGetList): Promise<messageTypes.IResponseGetList> {
    log("apiGetList", { resourceName, params });
    const r = await this.tryGetResource(resourceName);
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
    const r = await this.tryGetResource(resourceName);
    log("apiGetOne", { resourceName, resource: r, params });
    const data = r.list.filter((val: {
      id: string;
    }) => val.id === params.id);
    if (data.length < 1) {
      throw new Error("react-admin-firebase: No id found matching: " + params.id);
    }
    return { data: data.pop() };
  }
  public async apiCreate(resourceName: string, params: messageTypes.IParamsCreate): Promise<messageTypes.IResponseCreate> {
    const r = await this.tryGetResource(resourceName);
    log("apiCreate", { resourceName, resource: r, params });
    const doc = await r.collection.add({
      ...params.data,
      createdate: this.fireWrapper.serverTimestamp(),
      lastupdate: this.fireWrapper.serverTimestamp()
    });
    return {
      data: {
        ...params.data,
        id: doc.id
      }
    };
  }
  public async apiUpdate(resourceName: string, params: messageTypes.IParamsUpdate): Promise<messageTypes.IResponseUpdate> {
    const id = params.id;
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdate", { resourceName, resource: r, params });
    r.collection.doc(id).update({
      ...params.data,
      lastupdate: this.fireWrapper.serverTimestamp()
    }).catch((error) => {
      logError("apiUpdate error", { error });
    });
    return {
      data: {
        ...params.data,
        id
      }
    };
  }
  public async apiUpdateMany(resourceName: string, params: messageTypes.IParamsUpdateMany): Promise<messageTypes.IResponseUpdateMany> {
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdateMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const returnData = ids.map((id) => {
      r.collection.doc(id).update({
        ...params.data,
        lastupdate: this.fireWrapper.serverTimestamp()
      }).catch((error) => {
        logError("apiUpdateMany error", { error });
      });
      return {
        ...params.data,
        id
      };
    });
    return {
      data: returnData
    };
  }
  public async apiDelete(resourceName: string, params: messageTypes.IParamsDelete): Promise<messageTypes.IResponseDelete> {
    const r = await this.tryGetResource(resourceName);
    log("apiDelete", { resourceName, resource: r, params });
    r.list = r.list.filter((doc) => doc["id"] !== params.id);
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
    const returnData = [];
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
    const r = await this.tryGetResource(resourceName);
    log("apiGetMany", { resourceName, resource: r, params });
    const ids = new Set(params.ids);
    const matches = r.list.filter((item) => ids.has(item["id"]));
    return {
      data: matches
    };
  }
  public async apiGetManyReference(
    resourceName: string,
    params: messageTypes.IParamsGetManyReference
  ): Promise<messageTypes.IResponseGetManyReference> {
    const r = await this.tryGetResource(resourceName);
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
  public GetResource(resourceName: string): IResource {
    return this.rm.GetResource(resourceName);
  }
  private tryGetResource(resourceName: string): Promise<IResource> {
    return this.rm.TryGetResourcePromise(resourceName);
  }
}
