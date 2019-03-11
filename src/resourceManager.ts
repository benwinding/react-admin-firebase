import { Observable, Subscription } from "rxjs";

export interface IResource {
  path: string;
  collection: firebase.firestore.CollectionReference;
  observable: Observable<{}>;
  subscription: Subscription;
  list: Array<{}>;
}

export class ResourceManager {
  private resourcesRoot: {
    [resourceName: string]: IResource;
  } = {};
  private resourcesNested: {
    [resourceName: string]: IResource;
  } = {};

  constructor(private db: firebase.firestore.Firestore) {}

  public async TryGetResource(resourceName: string): Promise<IResource> {
    const isNested = this.IsNested(resourceName);
    if (isNested) {
      return this.TryGetNestedResource(resourceName);
    } else {
      return this.TryGetRootResource(resourceName);
    }
  }

  private async TryGetRootResource(resourceName: string): Promise<IResource> {
    const firebasePath = resourceName;
    const resource: IResource = this.resourcesRoot[firebasePath];
    if (resource) {
      return resource;
    }
    await this.InitResource(firebasePath);
    const resourceAfterinit: IResource = this.resourcesRoot[firebasePath];
    if (resourceAfterinit) {
      return resourceAfterinit;
    }
    throw new Error(
      `react-admin-firebase: the resource "${resourceName}" could not be inited`
    );    
  }

  private IsNested(resourceName: string): boolean {
    return resourceName.includes("*");
  }

  private async TryGetNestedResource(resourceName: string): Promise<IResource> {
    const firebasePath = this.getFirebasePath(resourceName, window.location.hash);
    const resource: IResource = this.resourcesNested[firebasePath];
    if (resource) {
      return resource;
    }
    await this.InitNestedResource(firebasePath);
    const resourceAfterinit: IResource = this.resourcesNested[firebasePath];
    if (resourceAfterinit) {
      return resourceAfterinit;
    }
    throw new Error(
      `react-admin-firebase: the nested resource "${firebasePath}" could not be inited`
    );
  }

  private async InitResource(resourceName: string): Promise<void> {
    return new Promise(resolve => {
      const path = resourceName;
      const collection = this.db.collection(path);
      const observable = this.getCollectionObservable(collection);
      const subscription = observable.subscribe(
        (querySnapshot: firebase.firestore.QuerySnapshot) => {
          const newList = querySnapshot.docs.map(
            (doc: firebase.firestore.QueryDocumentSnapshot) =>
              this.parseFireStoreDocument(doc)
          );
          this.resourcesRoot[path].list = newList;
          // The data has been set, so resolve the promise
          resolve();
        }
      );
      const list: Array<{}> = [];
      const r: IResource = {
        collection,
        list,
        observable,
        path: path,
        subscription: subscription
      };
      this.resourcesRoot[path] = r;
      console.log("initPath", {
        path: path,
        r,
        "this.resourcesRoot": this.resourcesRoot
      });
    });
  }

  private async InitNestedResource(firebasePath: string): Promise<void> {
    return new Promise(resolve => {
      const path = firebasePath;
      const collection = this.db.collection(path);
      const observable = this.getCollectionObservable(collection);
      const subscription = observable.subscribe(
        (querySnapshot: firebase.firestore.QuerySnapshot) => {
          const newList = querySnapshot.docs.map(
            (doc: firebase.firestore.QueryDocumentSnapshot) =>
              this.parseFireStoreDocument(doc)
          );
          this.resourcesNested[path].list = newList;
          // The data has been set, so resolve the promise
          resolve();
        }
      );
      const list: Array<{}> = [];
      const r: IResource = {
        collection,
        list,
        observable,
        path: path,
        subscription: subscription
      };
      this.resourcesNested[path] = r;
      console.log("initPath", {
        path: path,
        r,
        "this.resourcesNested": this.resourcesNested
      });
    });
  }

  private parseFireStoreDocument(
    doc: firebase.firestore.QueryDocumentSnapshot
  ): { id: string } {
    const data = doc.data();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value && value.toDate && value.toDate instanceof Function) {
        data[key] = value.toDate().toISOString();
      }
    });
    // React Admin requires an id field on every document,
    // So we can just using the firestore document id
    return { id: doc.id, ...data };
  }

  private getFirebasePath(resourceName: string, locationHash: string) {
    return this.getNestedPath(resourceName, locationHash).join("/");
  }

  private getReactAdminPath(resourceName: string, locationHash: string) {
    return this.getNestedPath(resourceName, locationHash).join("");
  }

  private getNestedPath(resourceName: string, locationHash: string): string[] {
    const resourcePaths = resourceName.split("*");
    const hashParts = locationHash.split("/");
    if (hashParts.length < 2) {
      return;
    }
    const resourcePathFull = hashParts[1];
    const resourceId1 = resourcePathFull.match("posts(.*)sub")[1];
    return [resourcePaths[0], resourceId1, resourcePaths[1]];
  }

  private getCollectionObservable(
    collection: firebase.firestore.CollectionReference
  ): Observable<firebase.firestore.QuerySnapshot> {
    const observable: Observable<
      firebase.firestore.QuerySnapshot
    > = Observable.create((observer: any) => collection.onSnapshot(observer));
    // LOGGING
    return observable;
  }
}
