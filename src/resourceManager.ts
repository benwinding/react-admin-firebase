// Firebase types
import {
  CollectionReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
  FirebaseFirestore
} from "@firebase/firestore-types";
import { Observable } from "rxjs";
import { log } from "logger";

export interface IResource {
  path: string;
  collection: CollectionReference;
  observable: Observable<{}>;
  list: Array<{}>;
}

export class ResourceManager {
  private resources: {
    [resourceName: string]: IResource;
  } = {};

  constructor(
    private db: FirebaseFirestore
  ) {
  }

  public async initPath(path: string): Promise<void> {
    return new Promise((resolve) => {
      const hasBeenInited = this.resources[path];
      if (hasBeenInited) {
        return resolve();
      }
      const collection = this.db.collection(path);
      const observable = this.getCollectionObservable(collection);
      observable.subscribe(
        async (querySnapshot: QuerySnapshot) => {
          const newList = querySnapshot.docs.map(
            (doc: QueryDocumentSnapshot) =>
              this.parseFireStoreDocument(doc)
          );
          await this.setList(newList, path);
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
      this.resources[path] = r;
      log("initPath", { path, r, "this.resources": this.resources });
    });
  }

  public GetResource(resourceName: string): IResource {
    const resource: IResource = this.resources[resourceName];
    if (!resource) {
      throw new Error(
        `react-admin-firebase: Cant find resource: "${resourceName}"`
      );
    }
    return resource;
  }

  public async TryGetResourcePromise(resourceName: string): Promise<IResource> {
    await this.initPath(resourceName);
    const resource: IResource = this.resources[resourceName];
    if (!resource) {
      throw new Error(
        `react-admin-firebase: Cant find resource: "${resourceName}"`
      );
    }
    return resource;
  }

  private parseFireStoreDocument(
    doc: QueryDocumentSnapshot
  ): {} {
    const data = doc.data();
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value && value.toDate && value.toDate instanceof Function) {
        data[key] = value.toDate().toISOString();
      }
    });
    // React Admin requires an id field on every document,
    // So we can just using the firestore document id
    return { id: doc.id, ...data };
  }

  private async setList(
    newList: Array<{}>,
    resourceName: string
  ): Promise<void> {
    const resource = await this.TryGetResourcePromise(resourceName);
    resource.list = newList;
  }

  private getCollectionObservable(
    collection: CollectionReference
  ): Observable<QuerySnapshot> {
    const observable: Observable<
      QuerySnapshot
    > = Observable.create((observer: any) => collection.onSnapshot(observer));
    // LOGGING
    return observable;
  }
}
