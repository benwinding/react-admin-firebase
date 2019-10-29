import * as firebase from "firebase/app";
import "firebase/firestore";
import get from "lodash/get";
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
import { Observable } from "rxjs";

export interface IResource {
  path: string;
  collection: firebase.firestore.CollectionReference;
  observable: Observable<{}>;
  list: Array<{}>;
}

// UTILS

function isEmptyObj(obj) {
  return JSON.stringify(obj) == "{}";
}

/**
 * Filters an array of objects with multiple criteria.
 *
 * @param  {Array}  array: the array to filter
 * @param  {Object} filters: an object with the filter criteria as the property names
 * @return {Array}
 */
function multiFilter(
  array: Array<{}>,
  filters: { [field: string]: any }
): Array<{}> {
  const filterKeys = Object.keys(filters);

  // filters all elements passing the criteria
  return array.filter(item => {
    // dynamically validate all filter criteria
    return filterKeys.every(key => {
      if (!Array.isArray(filters[key])) {
        filters[key] = [filters[key]];
      }
      // ignores an empty filter
      if (!filters[key].length) return true;
      return filters[key].includes(item[key]);
    });
  });
}

class FirebaseClient {
  private db: firebase.firestore.Firestore;
  private app: firebase.app.App;
  private resources: IResource[] = [];

  static instance = new FirebaseClient();

  static getInstance(firebaseConfig: {}) {
    const id = firebaseConfig["projectId"];
    FirebaseClient.instance.app = !firebase.apps.length
      ? firebase.initializeApp(firebaseConfig, id)
      : firebase.app(id);
    FirebaseClient.instance.db = FirebaseClient.instance.app.firestore();
    return FirebaseClient.instance;
  }

  public async initPath(inputPath: string) {
    return new Promise(resolve => {
      if (inputPath == null) {
        return;
      }
      const path = inputPath;
      const collection = this.db.collection(path);
      const observable = this.getCollectionObservable(collection);
      observable.subscribe(
        (querySnapshot: firebase.firestore.QuerySnapshot) => {
          const newList = querySnapshot.docs.map(
            (doc: firebase.firestore.QueryDocumentSnapshot) => {
              const data = doc.data();
              Object.keys(data).forEach(key => {
                const value = data[key];
                if (value === null || value === undefined) return;
                if (value.toDate && value.toDate instanceof Function) {
                  data[key] = value.toDate().toISOString();
                }
              });
              return { id: doc.id, ...data };
            }
          );
          this.setList(newList, path);
          // The data has been set, so resolve the promise
          resolve();
        }
      );
      const list: Array<{}> = [];
      const r: IResource = {
        collection,
        list,
        observable,
        path
      };
      this.resources.push(r);
    });
  }

  public async apiGetList(
    resourceName: string,
    params: IParamsGetList
  ): Promise<IResponseGetList> {
    const r = this.tryGetResource(resourceName);
    const data = r.list;
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        this.sortArray(data, field, "asc");
      } else {
        this.sortArray(data, field, "desc");
      }
    }
    let filteredData = this.filterArray(data, params.filter);
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
    const r = this.tryGetResource(resourceName);
    const data = r.list.filter((val: { id: string }) => val.id === params.id);
    if (data.length < 1) {
      throw Error("react-admin-firebase: No id found matching: " + params.id);
    }
    return { data: data[0] };
  }

  public async apiCreate(
    resourceName: string,
    params: IParamsCreate
  ): Promise<IResponseCreate> {
    const r = this.tryGetResource(resourceName);
    const newId = params.data[CREATE_WITHOUT_AUTOMATIC_ID_KEY];
    if (newId) {
      const data = {
        ...params.data
      };
      delete data[CREATE_WITHOUT_AUTOMATIC_ID_KEY];
      await r.collection.doc(newId).set(data, { merge: true });
      return {
        data: {
          id: newId
        }
      };
    }
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
    const r = this.tryGetResource(resourceName);

    await r.collection.doc(id).update(params.data);
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
    const r = this.tryGetResource(resourceName);
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
    const r = this.tryGetResource(resourceName);
    r.collection.doc(params.id).delete();
    return {
      data: params.previousData
    };
  }

  public async apiDeleteMany(
    resourceName: string,
    params: IParamsDeleteMany
  ): Promise<IResponseDeleteMany> {
    const r = this.tryGetResource(resourceName);
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
    const r = this.tryGetResource(resourceName);
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
    const r = this.tryGetResource(resourceName);
    const data = r.list;
    const targetField = params.target;
    const targetValue = params.id;
    const matches = data.filter(val => val[targetField] === targetValue);
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        this.sortArray(data, field, "asc");
      } else {
        this.sortArray(data, field, "desc");
      }
    }
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = matches.slice(pageStart, pageEnd);
    const total = matches.length;
    return { data: dataPage, total };
  }

  public GetResource(resourceName: string): IResource {
    const matches: IResource[] = this.resources.filter(val => {
      return val.path === resourceName;
    });
    if (matches.length < 1) {
      throw new Error("react-admin-firebase: Cant find resource with id");
    }
    const match: IResource = matches[0];
    return match;
  }

  private sortArray(data: Array<{}>, field: string, dir: "asc" | "desc") {
    data.sort((a: {}, b: {}) => {
      try {
        const aValue = get(a, field) ? get(a, field).toString() : "";
        console.log(aValue);

        const bValue = get(b, field) ? get(b, field).toString() : "";
        console.log(bValue);
        if (aValue > bValue) {
          return dir === "asc" ? 1 : -1;
        }
        if (aValue < bValue) {
          return dir === "asc" ? -1 : 1;
        }
      } catch (error) {
        console.log(error);
      }
      return 0;
    });
  }

  private filterArray(data: Array<{}>, filterFields: { [field: string]: any }) {
    if (isEmptyObj(filterFields)) return data;
    return multiFilter(data, filterFields);
  }

  private setList(newList: Array<{}>, resourceName: string) {
    const resource = this.tryGetResource(resourceName);
    resource.list = newList;
  }

  private tryGetResource(resourceName: string) {
    const matches: IResource[] = this.resources.filter(val => {
      return val.path === resourceName;
    });
    if (matches.length < 1) {
      throw new Error("react-admin-firebase: Cant find resource with id");
    }
    const match: IResource = matches[0];
    return match;
  }

  private getCollectionObservable(
    collection: firebase.firestore.CollectionReference
  ): Observable<any> {
    const observable: any = Observable.create((observer: any) =>
      collection.onSnapshot(observer)
    );
    // LOGGING
    // observable.subscribe((querySnapshot: firebase.firestore.QuerySnapshot) => {
    //   console.log("react-admin-firebase: Observable List Changed:", querySnapshot);
    // });
    return observable;
  }
}

export let fb: FirebaseClient;
export const CREATE_WITHOUT_AUTOMATIC_ID_KEY =
  "CREATE_WITHOUT_AUTOMATIC_ID_KEY";

export default function FirebaseProvider(config: {}): any {
  fb = FirebaseClient.getInstance(config);
  async function providerApi(
    type: string,
    resourceName: string,
    params: any
  ): Promise<any> {
    await fb.initPath(resourceName);
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
