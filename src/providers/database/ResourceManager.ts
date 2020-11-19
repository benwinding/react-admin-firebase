// Firebase types
import {
  CollectionReference,
  QueryDocumentSnapshot,
  FirebaseFirestore
} from "@firebase/firestore-types";
import { RAFirebaseOptions } from "../RAFirebaseOptions";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { User } from "@firebase/auth-types";
import { log, getAbsolutePath, messageTypes, logError, parseAllDatesDoc, logWarn } from "../../misc";

export interface IResource {
  path: string;
  pathAbsolute: string;
  collection: CollectionReference;
  list: Array<{} & {deleted?: boolean}>;
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

    this.fireWrapper.OnUserLogout(user => {
      this.resources = {};
    });
  }

  public async TryGetResource(
    resourceName: string,
    refresh?: "REFRESH",
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    if (refresh) {
      await this.RefreshResource(resourceName, collectionQuery);
    }
    return this.TryGetResourcePromise(resourceName, collectionQuery);
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
    collectionQuery?: messageTypes.CollectionQueryType
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
    collectionQuery: messageTypes.CollectionQueryType | undefined
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
    const result = this.parseFireStoreDocument(docSnap as any);
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
    const rootRef = this.options && this.options.rootRef;
    const absolutePath = getAbsolutePath(rootRef, relativePath);
    const hasBeenInited = !!this.resources[relativePath];
    log("resourceManager.initPath()", {
      absolutePath,
      hasBeenInited
    });
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

  private parseFireStoreDocument(doc: QueryDocumentSnapshot | undefined): {} {
    if (!doc) {
      logWarn('parseFireStoreDocument: no doc', {doc});
      return {};
    }
    const data = doc.data();
    parseAllDatesDoc(data);
    // React Admin requires an id field on every document,
    // So we can just using the firestore document id
    return { id: doc.id, ...data };
  }

  public async getUserLogin(): Promise<User> {
    return new Promise((resolve, reject) => {
      this.fireWrapper.auth().onAuthStateChanged(user => {
        if (user) {
          resolve(user);
        } else {
          reject('getUserLogin() no user logged in');
        }
      });
    });
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
