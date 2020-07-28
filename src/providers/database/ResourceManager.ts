// Firebase types
import {
  CollectionReference,
  FirebaseFirestore
} from '@firebase/firestore-types';
import { RAFirebaseOptions } from '../options';
import { IFirebaseWrapper } from './firebase/IFirebaseWrapper';
import { User } from '@firebase/auth-types';
import {
  log,
  getAbsolutePath,
  messageTypes,
  parseFireStoreDocument,
  logWarn
} from '../../misc';
import { isLazyLoadingEnabled } from '../../misc/options-utils';

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
        `react-admin-firebase: Can't find resource: "${relativePath}"`
      );
    }
    return resource;
  }

  public async TryGetResourcePromise(
    relativePath: string,
    collectionQuery: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    log('resourceManager.TryGetResourcePromise', {
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
    if (isLazyLoadingEnabled(this.options)) {
      logWarn(
        'resourceManager.RefreshResource',
        { warn: 'RefreshResource is not available in lazy loading mode' }
        );
      throw new Error(
        'react-admin-firebase: RefreshResource is not available in lazy loading mode'
      );
    }

    log('resourceManager.RefreshResource', { relativePath, collectionQuery });
    await this.initPath(relativePath, collectionQuery);
    const resource = this.resources[relativePath];

    const collection = resource.collection;
    const query = this.applyQuery(collection, collectionQuery);
    const newDocs = await query.get();

    resource.list = newDocs.docs.map(parseFireStoreDocument);
    log('resourceManager.RefreshResource', {
      newDocs,
      resource,
      collectionPath: collection.path
    });
  }

  public async GetSingleDoc(relativePath: string, docId: string) {
    await this.initPath(relativePath);
    const resource = this.GetResource(relativePath);
    const docSnap = await resource.collection.doc(docId).get();
    if (!docSnap.exists) {
      throw new Error('react-admin-firebase: No id found matching: ' + docId);
    }
    const result = parseFireStoreDocument(docSnap);
    log('resourceManager.GetSingleDoc', {
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
    log('resourceManager.initPath()', {
      absolutePath,
      hasBeenInited
    });
    if (hasBeenInited) {
      log('resourceManager.initPath() has been initialized already...');
      return;
    }
    const collection = this.db.collection(absolutePath);
    const list: Array<{}> = [];
    const resource: IResource = {
      collection,
      list,
      path: relativePath,
      pathAbsolute: absolutePath
    };
    this.resources[relativePath] = resource;
    log('resourceManager.initPath() setting resource...', {
      resource,
      allResources: this.resources,
      collection: collection,
      collectionPath: collection.path
    });
  }

  public async getUserLogin(): Promise<User> {
    return new Promise((resolve, reject) => {
      this.fireWrapper.auth().onAuthStateChanged(user => {
        resolve(user);
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
    const collRef: CollectionReference = collectionQuery ?
      collectionQuery(collection) : collection;

    log('resourceManager.applyQuery() ...', {
      collection,
      collectionQuery: (collectionQuery || '-').toString(),
      collRef
    });
    return collRef;
  }
}
