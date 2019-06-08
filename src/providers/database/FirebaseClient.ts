import { FirebaseFirestore } from "@firebase/firestore-types";
import { ResourceManager, IResource } from "./ResourceManager";
import { RAFirebaseOptions } from "index";
import { log } from "console";
import { sortArray, filterArray } from "misc/arrayHelpers";
import { logError } from "misc/logger";
import { IFirebase } from "./firebase/Firebase.interface";

export class FirebaseClient {
  private db: FirebaseFirestore;
  private rm: ResourceManager;

  constructor(
    private firebase: IFirebase,
    private options: RAFirebaseOptions
  ) {
    this.db = firebase.db();
    this.rm = new ResourceManager(this.db, this.options);
  }
  public async apiGetList(resourceName: string, params: IParamsGetList): Promise<IResponseGetList> {
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
  public async apiGetOne(resourceName: string, params: IParamsGetOne): Promise<IResponseGetOne> {
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
  public async apiCreate(resourceName: string, params: IParamsCreate): Promise<IResponseCreate> {
    const r = await this.tryGetResource(resourceName);
    log("apiCreate", { resourceName, resource: r, params });
    const doc = await r.collection.add({
      ...params.data,
      createdate: this.firebase.serverTimestamp(),
      lastupdate: this.firebase.serverTimestamp()
    });
    return {
      data: {
        ...params.data,
        id: doc.id
      }
    };
  }
  public async apiUpdate(resourceName: string, params: IParamsUpdate): Promise<IResponseUpdate> {
    const id = params.id;
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdate", { resourceName, resource: r, params });
    r.collection.doc(id).update({
      ...params.data,
      lastupdate: this.firebase.serverTimestamp()
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
  public async apiUpdateMany(resourceName: string, params: IParamsUpdateMany): Promise<IResponseUpdateMany> {
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    log("apiUpdateMany", { resourceName, resource: r, params });
    const ids = params.ids;
    const returnData = ids.map((id) => {
      r.collection.doc(id).update({
        ...params.data,
        lastupdate: this.firebase.serverTimestamp()
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
  public async apiDelete(resourceName: string, params: IParamsDelete): Promise<IResponseDelete> {
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
  public async apiDeleteMany(resourceName: string, params: IParamsDeleteMany): Promise<IResponseDeleteMany> {
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
  public async apiGetMany(resourceName: string, params: IParamsGetMany): Promise<IResponseGetMany> {
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
    params: IParamsGetManyReference
  ): Promise<IResponseGetManyReference> {
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
