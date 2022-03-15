import {
  log,
  messageTypes,
  parseFireStoreDocument,
  recursivelyMapStorageUrls,
} from '../../misc';
import { IResource, ResourceManager } from '../database/ResourceManager';
import { RAFirebaseOptions } from '../options';
import * as ra from '../../misc/react-admin-models';
import {
  getFullParamsForQuery,
  getNextPageParams,
  paramsToQuery,
} from './paramsToQuery';
import { clearQueryCursors, setQueryCursor } from './queryCursors';
import { FireClient } from 'providers/database';
import { FireStoreCollectionRef, FireStoreDocumentSnapshot } from 'misc/firebase-models';

export class FirebaseLazyLoadingClient {
  constructor(
    private readonly options: RAFirebaseOptions,
    private readonly rm: ResourceManager,
    private client: FireClient
  ) {}

  public async apiGetList<T extends ra.Record>(
    resourceName: string,
    reactAdminParams: ra.GetListParams
  ): Promise<ra.GetListResult<T>> {
    const r = await this.tryGetResource(resourceName);
    const params = getFullParamsForQuery(
      reactAdminParams,
      !!this.options.softDelete
    );

    log('apiGetListLazy', { resourceName, params });

    const query = await paramsToQuery(
      r.collection,
      params,
      resourceName,
      this.client.flogger
    );

    const snapshots = await query.get();

    const resultsCount = snapshots.docs.length;
    if (!resultsCount) {
      log('apiGetListLazy', {
        message: 'There are not records for given query',
      });
      return { data: [], total: 0 };
    }
    this.client.flogger.logDocument(resultsCount)();

    const data = snapshots.docs.map(doc => parseFireStoreDocument<T>(doc));
    const nextPageCursor = snapshots.docs[snapshots.docs.length - 1];
    // After fetching documents save queryCursor for next page
    setQueryCursor(nextPageCursor, getNextPageParams(params), resourceName);
    // Hardcoded to allow next pages, as we don't have total number of items
    let total = 9000;

    // Check for next pages
    // If it's last page, we can count all items and disable going to next page
    const isOnLastPage = await this.checkIfOnLastPage(
      r.collection,
      params,
      resourceName,
      nextPageCursor
    );

    if (isOnLastPage) {
      const { page, perPage } = params.pagination;
      total = (page - 1) * perPage + data.length;
      log('apiGetListLazy', { message: "It's last page of collection." });
    }

    if (this.options.relativeFilePaths) {
      const parsedData = await Promise.all(
        data.map(async (doc: any) => {
          for (let fieldName in doc) {
            doc[fieldName] = await recursivelyMapStorageUrls(
              this.client.fireWrapper,
              doc[fieldName]
            );
          }
          return doc;
        })
      );

      log('apiGetListLazy result', {
        docs: parsedData,
        resource: r,
        collectionPath: r.collection.path,
      });

      return {
        data: parsedData,
        total,
      };
    }

    log('apiGetListLazy result', {
      docs: data,
      resource: r,
      collectionPath: r.collection.path,
    });

    return { data, total };
  }

  public async apiGetManyReference(
    resourceName: string,
    reactAdminParams: messageTypes.IParamsGetManyReference
  ): Promise<messageTypes.IResponseGetManyReference> {
    const r = await this.tryGetResource(resourceName);
    log('apiGetManyReferenceLazy', {
      resourceName,
      resource: r,
      reactAdminParams,
    });
    const filterWithTarget = {
      ...reactAdminParams.filter,
      [reactAdminParams.target]: reactAdminParams.id,
    };
    const params = getFullParamsForQuery(
      {
        ...reactAdminParams,
        filter: filterWithTarget,
      },
      !!this.options.softDelete
    );

    const query = await paramsToQuery(
      r.collection,
      params,
      resourceName,
      this.client.flogger
    );

    const snapshots = await query.get();
    const resultsCount = snapshots.docs.length;
    this.client.flogger.logDocument(resultsCount)();
    const data = snapshots.docs.map(d => parseFireStoreDocument(d));
    if (this.options.relativeFilePaths) {
      const parsedData = await Promise.all(
        data.map(async (doc: any) => {
          for (let fieldName in doc) {
            doc[fieldName] = await recursivelyMapStorageUrls(
              this.client.fireWrapper,
              doc[fieldName]
            );
          }
          return doc;
        })
      );

      log('apiGetManyReferenceLazy result', {
        docs: parsedData,
        resource: r,
        collectionPath: r.collection.path,
      });

      return {
        data: parsedData,
        total: data.length,
      };
    }

    log('apiGetManyReferenceLazy result', {
      docs: data,
      resource: r,
      collectionPath: r.collection.path,
    });
    return { data, total: data.length };
  }

  private async checkIfOnLastPage<TParams extends messageTypes.IParamsGetList>(
    collection: FireStoreCollectionRef,
    params: TParams,
    resourceName: string,
    nextPageCursor: FireStoreDocumentSnapshot,
  ): Promise<boolean> {
    const query = await paramsToQuery(
      collection,
      params,
      resourceName,
      this.client.flogger,
      {
        filters: true,
        sort: true,
      }
    );
    if (!nextPageCursor) {
      throw new Error('Page cursor was empty...');
    }
    const nextElementSnapshot = await query
      .startAfter(nextPageCursor)
      .limit(1)
      .get();

    if (!nextElementSnapshot.empty) {
      // this.incrementFirebaseReadsCounter(1);
    }

    return nextElementSnapshot.empty;
  }

  public clearQueryCursors(resourceName: string) {
    clearQueryCursors(resourceName);
  }

  private async tryGetResource(
    resourceName: string,
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    return this.rm.TryGetResourcePromise(resourceName, collectionQuery);
  }
}
