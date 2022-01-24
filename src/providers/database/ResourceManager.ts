import { RAFirebaseOptions } from '../options';
import { IFirebaseWrapper } from './firebase/IFirebaseWrapper';
import {
  log,
  getAbsolutePath,
  messageTypes,
  parseAllDatesDoc,
  logWarn,
  IFirestoreLogger,
} from '../../misc';
import { FireStoreCollectionRef, FireStoreDocumentSnapshot, FireStoreQueryDocumentSnapshot } from 'misc/firebase-models';

export interface IResource {
  path: string;
  pathAbsolute: string;
  collection: FireStoreCollectionRef;
  list: Array<{} & { deleted?: boolean }>;
}

export class ResourceManager {
  private resources: Record<string, IResource> = {};

  constructor(
    private fireWrapper: IFirebaseWrapper,
    private options: RAFirebaseOptions,
    private flogger: IFirestoreLogger
  ) {
    this.fireWrapper.OnUserLogout(() => {
      this.resources = {};
    });
  }

  public async TryGetResource(
    resourceName: string,
    refresh?: 'REFRESH',
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
        `react-admin-firebase: Can't find resource: "${relativePath}"`
      );
    }
    return resource;
  }

  public async TryGetResourcePromise(
    relativePath: string,
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    log('resourceManager.TryGetResourcePromise', {
      relativePath,
      collectionQuery,
    });
    await this.initPath(relativePath);

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
    if (this.options?.lazyLoading?.enabled) {
      logWarn('resourceManager.RefreshResource', {
        warn: 'RefreshResource is not available in lazy loading mode',
      });
      throw new Error(
        'react-admin-firebase: RefreshResource is not available in lazy loading mode'
      );
    }

    log('resourceManager.RefreshResource', { relativePath, collectionQuery });
    await this.initPath(relativePath);
    const resource = this.resources[relativePath];

    const collection = resource.collection;
    const query = this.applyQuery(collection, collectionQuery);
    const newDocs = await query.get();

    resource.list = newDocs.docs.map((doc) => this.parseFireStoreDocument(doc));
    const count = newDocs.docs.length;
    this.flogger.logDocument(count)();
    log('resourceManager.RefreshResource', {
      newDocs,
      resource,
      collectionPath: collection.path,
    });
  }

  public async GetSingleDoc(relativePath: string, docId: string) {
    await this.initPath(relativePath);
    const resource = this.GetResource(relativePath);
    this.flogger.logDocument(1)();
    const docSnap = await resource.collection.doc(docId).get();
    if (!docSnap.exists) {
      throw new Error('react-admin-firebase: No id found matching: ' + docId);
    }
    const result = this.parseFireStoreDocument(docSnap);
    log('resourceManager.GetSingleDoc', {
      relativePath,
      resource,
      docId,
      docSnap,
      result,
    });
    return result;
  }

  private async initPath(relativePath: string): Promise<void> {
    const rootRef = this.options && this.options.rootRef;
    const absolutePath = getAbsolutePath(rootRef, relativePath);
    const hasBeenInited = !!this.resources[relativePath];
    log('resourceManager.initPath()', {
      absolutePath,
      hasBeenInited,
    });
    if (hasBeenInited) {
      log('resourceManager.initPath() has been initialized already...');
      return;
    }
    const collection = this.fireWrapper.dbGetCollection(absolutePath);
    const list: Array<{}> = [];
    const resource: IResource = {
      collection,
      list,
      path: relativePath,
      pathAbsolute: absolutePath,
    };
    this.resources[relativePath] = resource;
    log('resourceManager.initPath() setting resource...', {
      resource,
      allResources: this.resources,
      collection: collection,
      collectionPath: collection.path,
    });
  }

  private parseFireStoreDocument(doc: FireStoreQueryDocumentSnapshot | FireStoreDocumentSnapshot | undefined): {} {
    if (!doc) {
      logWarn('parseFireStoreDocument: no doc', { doc });
      return {};
    }
    const data = doc.data();
    parseAllDatesDoc(data);
    // React Admin requires an id field on every document,
    // So we can just using the firestore document id
    return { id: doc.id, ...data };
  }

  public async getUserIdentifier(): Promise<string> {
    const identifier = this.options.associateUsersById
      ? await this.getCurrentUserId()
      : await this.getCurrentUserEmail();
    return identifier;
  }

  private async getCurrentUserEmail() {
    const user = await this.fireWrapper.authGetUserLoggedIn();
    if (user) {
      return user.email as string;
    } else {
      return 'annonymous user';
    }
  }
  private async getCurrentUserId() {
    const user = await this.fireWrapper.authGetUserLoggedIn();
    if (user) {
      return user.uid;
    } else {
      return 'annonymous user';
    }
  }

  private applyQuery(
    collection: FireStoreCollectionRef,
    collectionQuery?: messageTypes.CollectionQueryType
  ): FireStoreCollectionRef {
    const collRef = collectionQuery ? collectionQuery(collection) : collection;

    log('resourceManager.applyQuery() ...', {
      collection,
      collectionQuery: (collectionQuery || '-').toString(),
      collRef,
    });
    return collRef;
  }
}
