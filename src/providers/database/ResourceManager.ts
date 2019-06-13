// Firebase types
import {
  CollectionReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
  FirebaseFirestore
} from "@firebase/firestore-types";
import { Observable } from "rxjs";
import { RAFirebaseOptions } from "index";
import { log } from "../../misc/logger";

export interface IResource {
  path: string;
  pathAbsolute: string;
  collection: CollectionReference;
  observable: Observable<{}>;
  list: Array<{}>;
}

export class ResourceManager {
  private resources: {
    [resourceName: string]: IResource;
  } = {};

  constructor(
    private db: FirebaseFirestore,
    private options: RAFirebaseOptions
  ) { }

  public GetResource(relativePath: string): IResource {
    const resource: IResource = this.resources[relativePath];
    if (!resource) {
      throw new Error(
        `react-admin-firebase: Cant find resource: "${relativePath}"`
      );
    }
    return resource;
  }

  public async TryGetResourcePromise(relativePath: string): Promise<IResource> {
    await this.initPath(relativePath);
    const resource: IResource = this.resources[relativePath];
    if (!resource) {
      throw new Error(
        `react-admin-firebase: Cant find resource: "${relativePath}"`
      );
    }
    return resource;
  }

  private async initPath(relativePath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(relativePath);
    log("resourceManager.initPath:::", { absolutePath });
    return new Promise((resolve) => {
      const hasBeenInited = this.resources[relativePath];
      if (hasBeenInited) {
        return resolve();
      }
      const collection = this.db.collection(absolutePath);
      const observable = this.getCollectionObservable(collection);
      const list: Array<{}> = [];
      const resource: IResource = {
        collection: collection,
        list: list,
        observable: observable,
        path: relativePath,
        pathAbsolute: absolutePath
      };
      this.resources[relativePath] = resource;

      observable.subscribe(
        async (querySnapshot: QuerySnapshot) => {
          const newList = querySnapshot.docs.map(
            (doc: QueryDocumentSnapshot) =>
              this.parseFireStoreDocument(doc)
          );
          resource.list = newList;
          // The data has been set, so resolve the promise
          resolve();
        }
      );
      // log("initPath", { absolutePath, r, "this.resources": this.resources });
    });
  }

  private getAbsolutePath(relativePath: string): string {
    let absolutePath = relativePath;
    if (this.options.rootRef) {
      absolutePath = this.options.rootRef + "/" + relativePath;
    }
    return absolutePath;
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
