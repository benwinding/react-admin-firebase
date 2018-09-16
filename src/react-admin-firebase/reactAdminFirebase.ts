import * as firebase from "firebase";
import {
  CREATE,
  DELETE,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  UPDATE_MANY
} from "react-admin";
import { Observable } from "rxjs";

interface IResource {
  path: string;
  collection: firebase.firestore.CollectionReference;
  observable: Observable<{}>;
  list: Array<{}>;
}

class FirebaseClient {
  private db: firebase.firestore.Firestore;
  private app: firebase.app.App;
  private resources: IResource[] = [];

  constructor(private firebaseConfig: {}) {
    this.app = firebase.initializeApp(this.firebaseConfig);
    this.db = this.app.firestore();
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
              return {
                ...doc.data(),
                id: doc.id
              };
            }
          );
          this.setList(newList, path);
          // The data has been set, so resolve the promise
          resolve();
        }
      );
      const list: Array<{}> = [];
      const r: IResource = { collection, list, observable, path };
      this.resources.push(r);
    });
  }

  public async apiGetList(
    resourceName: string,
    params: IParamsGetList
  ): Promise<IResponseGetList> {
    const r = await this.tryGetResource(resourceName);
    const data = r.list;
    if (params.sort != null) {
      const { field, order } = params.sort;
      if (order === "ASC") {
        this.sortAsc(data, field);
      } else {
        this.sortDesc(data, field);
      }
    }
    const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
    const pageEnd = pageStart + params.pagination.perPage;
    const dataPage = data.slice(pageStart, pageEnd);
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
    const r = await this.tryGetResource(resourceName);
    const data = r.list.filter((val: { id: string }) => val.id === params.id);
    if (data.length < 1) {
      throw Error("No id found matching: " + params.id);
    }
    return { data: data[0] };
  }

  public async apiCreate(
    resourceName: string,
    params: IParamsCreate
  ): Promise<IResponseCreate> {
    const r = await this.tryGetResource(resourceName);
    const docRef = await r.collection.add(params.data);
    return {
      data: {
        ...params.data,
        id: docRef.id
      }
    };
  }

  public async apiUpdate(
    resourceName: string,
    params: IParamsUpdate
  ): Promise<IResponseUpdate> {
    const id = params.id;
    delete params.data.id;
    const r = await this.tryGetResource(resourceName);
    r.collection.doc(id).set(params.data);
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
    const r = await this.tryGetResource(resourceName);
    const returnData = [];
    for (const id of params.ids) {
      r.collection.doc(id).set(params.data);
      returnData.push({
        ...params.data,
        id
      });
    }
    return {
      data: returnData
    };
  }

  private sortAsc(data: Array<{}>, field: string) {
    data.sort((a: {}, b: {}) => {
      const aValue = a[field].toString().toLowerCase();
      const bValue = b[field].toString().toLowerCase();
      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }
      return 0;
    });
  }

  private sortDesc(data: Array<{}>, field: string) {
    data.sort((a: {}, b: {}) => {
      const aValue = a[field].toString().toLowerCase();
      const bValue = b[field].toString().toLowerCase();
      if (aValue > bValue) {
        return -1;
      }
      if (aValue < bValue) {
        return 1;
      }
      return 0;
    });
  }

  private setList(newList: Array<{}>, resourceName: string): Promise<any> {
    return this.tryGetResource(resourceName).then((resource: IResource) => {
      resource.list = newList;
    });
  }

  private async tryGetResource(resourceName: string) {
    const matches: IResource[] = this.resources.filter(val => {
      return val.path === resourceName;
    });
    if (matches.length < 1) {
      throw new Error("Cant find resource with id");
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
    observable.subscribe((querySnapshot: firebase.firestore.QuerySnapshot) => {
      console.log("Observable List Changed:", querySnapshot);
    });
    return observable;
  }
}

let fb: FirebaseClient;
async function providerApi(
  type: string,
  resourceName: string,
  params: any
): Promise<any> {
  await fb.initPath(resourceName);
  switch (type) {
    case GET_MANY:
    case GET_MANY_REFERENCE:
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
    default:
      return {};
  }
}

export function FirebaseProvider(config: {}): any {
  fb = new FirebaseClient(config);
  return providerApi;
}
