import * as firebase from "firebase/app";
import "firebase/firestore";

import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  UPDATE_MANY
} from "react-admin";
import { ResourceManager, IResource } from "./resourceManager";
import { sortArray, filterArray } from "./utils";

class FirebaseClient {
  private db: firebase.firestore.Firestore;
  private app: firebase.app.App;
  private rm: ResourceManager;

  constructor(private firebaseConfig: {}) {
    this.app = firebase.initializeApp(this.firebaseConfig);
    this.db = this.app.firestore();
    this.rm = new ResourceManager(this.db);
  }

  public async apiGetList(
    resourceName: string,
    params: IParamsGetList
  ): Promise<IResponseGetList> {
    const r = await this.rm.TryGetResource(resourceName);
    const data = r.list;
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        sortArray(data, field, "asc");
      } else {
        sortArray(data, field, "desc");
      }
    }
    console.log("apiGetList", { resourceName, resource: r, params });
    let filteredData = filterArray(data, params.filter);
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = filteredData.slice(pageStart, pageEnd);
    const total = r.list.length;
    return {
      data: dataPage,
      total
    };
  }

  public async apiGetOne(
    resourceName: string,
    params: IParamsGetOne
  ): Promise<IResponseGetOne> {
    console.log("apiGetOne", { resourceName, params });
    const r = await this.rm.TryGetResource(resourceName);
    const data = r.list.filter((val: { id: string }) => val.id === params.id);
    if (data.length < 1) {
      throw new Error(
        `react-admin-firebase: for resource: "${resourceName}", couldn't find id: "${
          params.id
        }"`
      );
    }
    return { data: data.pop() };
  }

  public async apiCreate(
    resourceName: string,
    params: IParamsCreate
  ): Promise<IResponseCreate> {
    const r = await this.rm.TryGetResource(resourceName);
    console.log("apiCreate", { resourceName, resource: r, params });
    const doc = await r.collection.add(params.data);
    return {
      data: {
        ...params.data,
        id: doc.id
      }
    };
  }

  public async apiUpdate(
    resourceName: string,
    params: IParamsUpdate
  ): Promise<IResponseUpdate> {
    const id = params.id;
    delete params.data.id;
    const r = await this.rm.TryGetResource(resourceName);
    console.log("apiUpdate", { resourceName, resource: r, params });
    r.collection.doc(id).update(params.data);
    return {
      data: {
        ...params.data,
        id
      }
    };
  }

  public async apiUpdateMany(
    resourceName: string,
    params: IParamsUpdateMany
  ): Promise<IResponseUpdateMany> {
    delete params.data.id;
    const r = await this.rm.TryGetResource(resourceName);
    console.log("apiUpdateMany", { resourceName, resource: r, params });
    const returnData = [];
    for (const id of params.ids) {
      r.collection.doc(id).update(params.data);
      returnData.push({
        ...params.data,
        id
      });
    }
    return {
      data: returnData
    };
  }

  public async apiDelete(
    resourceName: string,
    params: IParamsDelete
  ): Promise<IResponseDelete> {
    const r = await this.rm.TryGetResource(resourceName);
    console.log("apiDelete", { resourceName, resource: r, params });
    r.collection.doc(params.id).delete();
    return {
      data: params.previousData
    };
  }

  public async apiDeleteMany(
    resourceName: string,
    params: IParamsDeleteMany
  ): Promise<IResponseDeleteMany> {
    const r = await this.rm.TryGetResource(resourceName);
    console.log("apiDeleteMany", { resourceName, resource: r, params });
    const returnData = [];
    const batch = this.db.batch();
    for (const id of params.ids) {
      batch.delete(r.collection.doc(id));
      returnData.push({ id });
    }
    batch.commit();
    return { data: returnData };
  }

  public async apiGetMany(
    resourceName: string,
    params: IParamsGetMany
  ): Promise<IResponseGetMany> {
    const r = await this.rm.TryGetResource(resourceName);
    console.log("apiGetMany", { resourceName, resource: r, params });
    const ids = new Set(params.ids);
    const matches = r.list.filter(item => ids.has(item["id"]));
    return {
      data: matches
    };
  }

  public async apiGetManyReference(
    resourceName: string,
    params: IParamsGetManyReference
  ): Promise<IResponseGetManyReference> {
    const r = await this.rm.TryGetResource(resourceName);
    console.log("apiGetManyReference", { resourceName, resource: r, params });
    const data = r.list;
    const targetField = params.target;
    const targetValue = params.id;
    const matches = data.filter(val => val[targetField] === targetValue);
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        sortArray(data, field, "asc");
      } else {
        sortArray(data, field, "desc");
      }
    }
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = matches.slice(pageStart, pageEnd);
    const total = matches.length;
    return { data: dataPage, total };
  }

  public async GetResource(resourceName: string): Promise<IResource> {
    return this.rm.TryGetResource(resourceName);
  }
}

export let fb: FirebaseClient;

export default function FirebaseProvider(config: {}, isDebug?: boolean) {
  fb = new FirebaseClient(config);

  async function providerApi(
    type: string,
    resourceName: string,
    params: any
  ): Promise<any> {
    switch (type) {
      case GET_MANY:
        return fb.apiGetMany(resourceName, params);
      case GET_MANY_REFERENCE:
        return fb.apiGetManyReference(resourceName, params);
      case GET_LIST:
        return fb.apiGetList(resourceName, params);
      case GET_ONE:
        return fb.apiGetOne(resourceName, params);
      case CREATE:
        return fb.apiCreate(resourceName, params);
      case UPDATE:
        return fb.apiUpdate(resourceName, params);
      case UPDATE_MANY:
        return fb.apiUpdateMany(resourceName, params);
      case DELETE:
        return fb.apiDelete(resourceName, params);
      case DELETE_MANY:
        return fb.apiDeleteMany(resourceName, params);
      default:
        return {};
    }
  }
  return providerApi;
}
