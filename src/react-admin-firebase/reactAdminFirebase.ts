import * as firebase from "firebase";
import {
  CREATE,
  DELETE,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE
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

  constructor(private firebaseConfig: {}, private pathsArray: string[]) {
    this.app = firebase.initializeApp(this.firebaseConfig);
    this.db = this.app.firestore();
    this.pathsArray.forEach(inputPath => {
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
    const pageStart = (params.pagination.page-1) * params.pagination.perPage;
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
    const data = r.list.filter((val: {id:string}) => val.id === params.id);
    if (data.length < 1) {
      throw Error("No id found matching: " + params.id);
    }
    return { data: data[0] };
  }

  public getList(resourceName: string): Promise<Array<{}>> {
    return this.tryGetResource(resourceName).then(
      (resource: IResource) => resource.list
    );
  }

  public getTotal(resourceName: string): Promise<number> {
    return this.tryGetResource(resourceName).then(
      (resource: IResource) => resource.list.length
    );
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
  switch (type) {
    case GET_MANY:
    case GET_MANY_REFERENCE:
    case GET_LIST:
      return fb.apiGetList(resourceName, params);
    case GET_ONE:
      return fb.apiGetOne(resourceName, params);
    case CREATE:
    case UPDATE:
    case DELETE:
    default:
      return {};
  }
}

export function FirebaseProvider(config: {}, pathList: string[]): any {
  fb = new FirebaseClient(config, pathList);
  return providerApi;
}
