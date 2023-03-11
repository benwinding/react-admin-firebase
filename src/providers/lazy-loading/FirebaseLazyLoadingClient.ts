import { getCountFromServer, getDocs } from 'firebase/firestore';
import {
  log,
  messageTypes,
  parseFireStoreDocument,
  recursivelyMapStorageUrls,
} from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient, IResource, ResourceManager } from '../database';
import { RAFirebaseOptions } from '../options';
import {
  getFullParamsForQuery,
  getNextPageParams,
  paramsToQuery,
} from './paramsToQuery';
import { setQueryCursor } from './queryCursors';

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

    const { noPagination, withPagination } = await paramsToQuery(
      r.collection,
      params,
      resourceName,
      this.client.flogger
    );

    const snapshots = await getDocs(withPagination);

    const resultsCount = snapshots.docs.length;
    if (!resultsCount) {
      log('apiGetListLazy', {
        message: 'There are not records for given query',
      });
      return { data: [], total: 0 };
    }
    this.client.flogger.logDocument(resultsCount)();

    // tslint:disable-next-line
    const data = snapshots.docs.map((d) => parseFireStoreDocument<T>(d));

    const nextPageCursor = snapshots.docs[snapshots.docs.length - 1];
    // After fetching documents save queryCursor for next page
    setQueryCursor(nextPageCursor, getNextPageParams(params), resourceName);
    // Hardcoded to allow next pages, as we don't have total number of items

    let total = await getCountFromServer(noPagination);

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
        total: total.data().count,
      };
    }

    log('apiGetListLazy result', {
      docs: data,
      resource: r,
      collectionPath: r.collection.path,
    });

    return { data, total: total.data().count };
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

    const { withPagination } = await paramsToQuery(
      r.collection,
      params,
      resourceName,
      this.client.flogger
    );

    const snapshots = await getDocs(withPagination);
    const resultsCount = snapshots.docs.length;
    this.client.flogger.logDocument(resultsCount)();
    const data = snapshots.docs.map(parseFireStoreDocument);
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

  private async tryGetResource(
    resourceName: string,
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    return this.rm.TryGetResourcePromise(resourceName, collectionQuery);
  }
}
