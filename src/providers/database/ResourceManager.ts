// Firebase types
import {
  CollectionReference,
  QueryDocumentSnapshot,
  FirebaseFirestore
} from "@firebase/firestore-types";
import { RAFirebaseOptions } from "../RAFirebaseOptions";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { User } from "@firebase/auth-types";
import { log, getAbsolutePath, messageTypes, logError } from "../../misc";

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
    collectionQuery: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    log("resourceManager.TryGetResourcePromise", {
      relativePath,
      collectionQuery
    });
    await this.initPath(relativePath, collectionQuery);

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
    collectionQuery: messageTypes.CollectionQueryType
  ) {
    log("resourceManager.RefreshResource", { relativePath, collectionQuery });
    await this.initPath(relativePath, collectionQuery);
    const resource = this.resources[relativePath];

    const collection = resource.collection;
    const query = this.applyQuery(collection, collectionQuery);
    const newDocs = await query.get();

    resource.list = newDocs.docs.map(doc => this.parseFireStoreDocument(doc));
    log("resourceManager.RefreshResource", {
      newDocs,
      resource,
      collectionPath: collection.path
    });
  }

  public async GetSingleDoc(relativePath: string, docId: string) {
    await this.initPath(relativePath);
    const resource = this.resources[relativePath];
    const docSnap = await resource.collection.doc(docId).get();
    if (!docSnap.exists) {
      throw new Error("react-admin-firebase: No id found matching: " + docId);
    }
    const result = this.parseFireStoreDocument(docSnap);
    log("resourceManager.GetSingleDoc", {
      relativePath,
      resource,
      docId,
      docSnap,
      result
    });
    return result;
  }

  private async initPath(
    relativePath: string,
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<void> {
    const absolutePath = getAbsolutePath(this.options.rootRef, relativePath);
    const isAccessible = await this.isCollectionAccessible(
      absolutePath,
      collectionQuery
    );

    const hasBeenInited = !!this.resources[relativePath];
    log("resourceManager.initPath()", {
      absolutePath,
      isAccessible,
      hasBeenInited
    });
    if (!isAccessible && hasBeenInited) {
      log("resourceManager.initPath() not accessible, removing resource...");
      this.removeResource(relativePath);
      return;
    }
    if (hasBeenInited) {
      log("resourceManager.initPath() has been initialized already...");
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
    log("resourceManager.initPath() setting resource...", {
      resource,
      allResources: this.resources,
      collection: collection,
      collectionPath: collection.path
    });
  }

  private parseFireStoreDocument(doc: QueryDocumentSnapshot): {} {
    const data = doc.data();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value && value.toDate && value.toDate instanceof Function) {
        data[key] = value.toDate();
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
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<boolean> {
    try {
      const collection = this.db.collection(absolutePath);
      const query = this.applyQuery(collection, collectionQuery);

      await query.limit(1).get();
    } catch (error) {
      return false;
    }
    return true;
  }

  private removeResource(resourceName: string) {
    delete this.resources[resourceName];
  }

  private applyQuery(
    collection: CollectionReference,
    collectionQuery?: messageTypes.CollectionQueryType
  ): CollectionReference {
    let collref: CollectionReference;
    if (collectionQuery) {
      collref = collectionQuery(collection);
    } else {
      collref = collection;
    }
    log("resourceManager.applyQuery() ...", {
      collection,
      collectionQuery: (collectionQuery || "-").toString(),
      collref
    });
    return collref;
  }
}
