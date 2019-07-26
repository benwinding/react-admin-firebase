// Firebase types
import {
  CollectionReference,
  QueryDocumentSnapshot,
  FirebaseFirestore
} from "@firebase/firestore-types";
import { RAFirebaseOptions } from "index";
import { log } from "../../misc/logger";
import { getAbsolutePath } from "../../misc/pathHelper";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { User } from "@firebase/auth-types";

export interface IResource {
  path: string;
  pathAbsolute: string;
  collection: CollectionReference;
  list: Array<{}>;
}

export class ResourceManager {
  private resources: {
    [resourceName: string]: IResource;
  } = {};

  private db: FirebaseFirestore;

  constructor(
    private fireWrapper: IFirebaseWrapper,
    private options: RAFirebaseOptions
  ) {
    this.db = fireWrapper.db();
  }

  public GetResource(relativePath: string): IResource {
    const resource: IResource = this.resources[relativePath];
    if (!resource) {
      throw new Error(
        `react-admin-firebase: Cant find resource: "${relativePath}"`
      );
    }
    return resource;
  }

  public async TryGetResourcePromise(
    relativePath: string,
    filter?: { [key: string]: string }
  ): Promise<IResource> {
    await this.initPath(relativePath, filter);

    const resource: IResource = this.resources[relativePath];
    if (!resource) {
      throw new Error(
        `react-admin-firebase: Cant find resource: "${relativePath}"`
      );
    }
    return resource;
  }

  public async RefreshResource(
    relativePath: string,
    filter?: { [key: string]: string }
  ) {
    await this.initPath(relativePath, filter);
    const resource = this.resources[relativePath];
    log("resourceManager.RefreshResource", { relativePath });

    const collection = resource.collection;
    const query = this.addFilterToCollection(collection, filter);

    const newDocs = await query.get();

    resource.list = newDocs.docs.map(doc => this.parseFireStoreDocument(doc));
  }

  public async GetSingleDoc(relativePath: string, docId: string) {
    await this.initPath(relativePath);
    const resource = this.resources[relativePath];
    const res = await resource.collection.doc(docId).get();
    if (!res.exists) {
      throw new Error("react-admin-firebase: No id found matching: " + docId);
    }
    const result = this.parseFireStoreDocument(res);
    return result;
  }

  private async initPath(
    relativePath: string,
    filter?: { [key: string]: string }
  ): Promise<void> {
    const absolutePath = getAbsolutePath(this.options.rootRef, relativePath);
    log("resourceManager.initPath:::", { absolutePath });
    const isAccessible = await this.isCollectionAccessible(
      absolutePath,
      filter
    );

    const hasBeenInited = this.resources[relativePath];
    if (!isAccessible) {
      if (hasBeenInited) {
        this.removeResource(relativePath);
      }
      return;
    }
    if (hasBeenInited) {
      return;
    }
    const collection = this.db.collection(absolutePath);
    const list: Array<{}> = [];
    const resource: IResource = {
      collection: collection,
      list: list,
      path: relativePath,
      pathAbsolute: absolutePath
    };
    this.resources[relativePath] = resource;
  }

  private parseFireStoreDocument(doc: QueryDocumentSnapshot): {} {
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

  public async getUserLogin(): Promise<User> {
    return new Promise((resolve, reject) => {
      this.fireWrapper.auth().onAuthStateChanged(user => {
        resolve(user);
      });
    });
  }

  private async isCollectionAccessible(
    absolutePath: string,
    filter?: { [key: string]: string }
  ): Promise<boolean> {
    try {
      const collection = this.db.collection(absolutePath);
      const query = this.addFilterToCollection(collection, filter);

      /**
        TODO: Before, a single document read check was done, I'm not sure if this relates to the same security rules as GET and LIST can have seperated rules
       */
      await query.get();
    } catch (error) {
      return false;
    }
    return true;
  }

  private removeResource(resourceName: string) {
    delete this.resources[resourceName];
  }

  private addFilterToCollection(
    collection: CollectionReference,
    filter: { [key: string]: string }
  ) {
    if (!filter) return collection;

    let query;

    Object.keys(filter).forEach(key => {
      if (query) {
        query = query.where(key, "==", filter[key]);
      } else {
        query = collection.where(key, "==", filter[key]);
      }
    });

    return query;
  }
}
