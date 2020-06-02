import { log, messageTypes, parseFireStoreDocument } from "../../../misc";
import { CollectionReference, DocumentSnapshot, OrderByDirection, Query } from "@firebase/firestore-types";
import { IResource, ResourceManager } from "../ResourceManager";
import { isReadsLoggingEnabled, RAFirebaseOptions } from "../../RAFirebaseOptions";
import ReadsLogger from '../../../misc/reads-logger';

interface ParamsToQueryOptions {
  filters?: boolean;
  sort?: boolean;
  pagination?: boolean;
}

const defaultParamsToQueryOptions = {
  filters: true,
  sort: true,
  pagination: true
};

export class FirebaseLazyLoadingClient {

  constructor(
    private readonly options: RAFirebaseOptions,
    private readonly rm: ResourceManager,
    private readonly readsLogger: ReadsLogger
  ) {}

  public async apiGetList(
    resourceName: string,
    reactAdminParams: messageTypes.IParamsGetList
  ): Promise<messageTypes.IResponseGetList> {
    const r = await this.tryGetResource(resourceName);
    const params = this.getFullParamsForQuery(reactAdminParams);

    log("apiGetListLazy", { resourceName, params });

    const query = await this.paramsToQuery(
      r.collection,
      params,
      resourceName
    );

    const snapshots = await query.get();

    if (snapshots.docs.length === 0) {
      log("apiGetListLazy", { message: 'There are not records for given query' });
      return { data: [], total: 0 };
    }

    this.incrementFirebaseReadsCounter(snapshots.docs.length);

    const data = snapshots.docs.map(doc => parseFireStoreDocument(doc));
    const nextPageCursor = snapshots.docs[snapshots.docs.length - 1];
    // After fetching documents save queryCursor for next page
    this.setQueryCursor(
      nextPageCursor,
      this.getNextPageParams(params),
      resourceName
    );
    // Hardcoded to allow next pages, as we don't have total number of items
    let total = 100000;

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
      total = ((page - 1) * perPage) + data.length;
      log("apiGetListLazy", { message: 'It\'s last page of collection.' });
    }

    return { data, total };
  }

  public async apiGetManyReference(
    resourceName: string,
    reactAdminParams: messageTypes.IParamsGetManyReference
  ): Promise<messageTypes.IResponseGetManyReference> {
    const r = await this.tryGetResource(resourceName);
    log("apiGetManyReference", { resourceName, resource: r, reactAdminParams });
    const params = this.getFullParamsForQuery({
      ...reactAdminParams,
      filter: {
        ...reactAdminParams.filter,
        [reactAdminParams.target]: reactAdminParams.id
      }
    });

    const query = await this.paramsToQuery(
      r.collection,
      params,
      resourceName
    );

    const snapshots = await query.get();
    this.incrementFirebaseReadsCounter(snapshots.docs.length);
    const data = snapshots.docs.map(doc => parseFireStoreDocument(doc));
    return { data, total: data.length };
  }

  private async paramsToQuery<TParams extends messageTypes.IParamsGetList>(
    collection: CollectionReference,
    params: TParams,
    resourceName: string,
    options: ParamsToQueryOptions = defaultParamsToQueryOptions
  ): Promise<Query> {

    const filtersStepQuery = options.filters ?
      this.filtersToQuery(collection, params.filter) : collection;

    const sortStepQuery = options.sort ?
      this.sortToQuery(filtersStepQuery, params.sort) : filtersStepQuery;

    return options.pagination ?
      this.paginationToQuery(
        sortStepQuery,
        params,
        collection,
        resourceName
      ) : sortStepQuery;
  }

  private filtersToQuery(query: Query, filters: { [fieldName: string]: any }): Query {
    Object.keys(filters).forEach(fieldName => {
      query = query.where(fieldName, '==', filters[fieldName]);
    });
    return query;
  }

  private sortToQuery(query: Query, sort: { field: string, order: string }): Query {
    if (sort != null && sort.field !== 'id') {
      const { field, order } = sort;
      const parsedOrder = order.toLocaleLowerCase() as OrderByDirection;
      query = query.orderBy(field, parsedOrder);
    }
    return query;
  }

  private async paginationToQuery<TParams extends messageTypes.IParamsGetList>(
    query: Query,
    params: TParams,
    collection: CollectionReference,
    resourceName: string
  ): Promise<Query> {
    const { page, perPage } = params.pagination;
    if (page === 1) {
      query = query.limit(perPage);
    } else {
      let queryCursor = await this.getQueryCursor(collection, params, resourceName);
      if (!queryCursor) {
        queryCursor = await this.findLastQueryCursor(collection, query, params, resourceName);
      }
      query = query.startAfter(queryCursor).limit(perPage);
    }

    return query;
  }

  private getFullParamsForQuery<TParams extends messageTypes.IParamsGetList>(
    reactAdminParams: TParams
  ): TParams {
    return {
      ...reactAdminParams,
      filter: this.options.softDelete ? {
        deleted: false,
        ...reactAdminParams.filter
      } : reactAdminParams.filter
    };
  }

  private getNextPageParams<TParams extends messageTypes.IParamsGetList>(
    params: TParams
  ): TParams {
    return {
      ...params,
      pagination: {
        ...params.pagination,
        page: params.pagination.page + 1
      }
    };
  }

  private async checkIfOnLastPage<TParams extends messageTypes.IParamsGetList>(
    collection: CollectionReference,
    params: TParams,
    resourceName: string,
    nextPageCursor: DocumentSnapshot
  ): Promise<boolean> {
    const query = await this.paramsToQuery(
      collection,
      params,
      resourceName,
      { filters: true, sort: true }
    );
    const nextElementSnapshot = await query
      .startAfter(nextPageCursor)
      .limit(1)
      .get();

    if (!nextElementSnapshot.empty) {
      this.incrementFirebaseReadsCounter(1);
    }

    return nextElementSnapshot.empty;
  }

  private setQueryCursor(doc: DocumentSnapshot, params: messageTypes.IParamsGetList, resourceName: string) {
    const key = btoa(JSON.stringify({ ...params, resourceName }));
    localStorage.setItem(key, doc.id);

    const allCursorsKey = `ra-firebase-cursor-keys_${resourceName}`;
    const localCursorKeys = localStorage.getItem(allCursorsKey);
    if (!localCursorKeys) {
      localStorage.setItem(allCursorsKey, JSON.stringify([key]));
    } else {
      const cursors: string[] = JSON.parse(localCursorKeys);
      const newCursors = cursors.concat(key);
      localStorage.setItem(allCursorsKey, JSON.stringify(newCursors));
    }
  }

  private async getQueryCursor(
    collection: CollectionReference,
    params: messageTypes.IParamsGetList,
    resourceName: string
  ): Promise<DocumentSnapshot | boolean> {
    const key = btoa(JSON.stringify({ ...params, resourceName }));
    const docId = localStorage.getItem(key);
    if (!docId) {
      return false;
    }

    const doc = await collection.doc(docId).get();
    if (doc.exists) {
      this.incrementFirebaseReadsCounter(1);
      return doc;
    }
    return false;
  }

  public clearQueryCursors(resourceName: string) {
    const allCursorsKey = `ra-firebase-cursor-keys_${resourceName}`;
    const localCursorKeys = localStorage.getItem(allCursorsKey);
    if (localCursorKeys) {
      const cursors: string[] = JSON.parse(localCursorKeys);
      cursors.forEach(cursor => localStorage.removeItem(cursor));
      localStorage.removeItem(allCursorsKey);
    }
  }

  private async findLastQueryCursor(
    collection: CollectionReference,
    query: Query,
    params: messageTypes.IParamsGetList,
    resourceName: string
  ) {
    const { page, perPage } = params.pagination;

    let lastQueryCursor = null;
    let currentPage = page - 1;

    while(!lastQueryCursor && currentPage > 1) {
      const currentPageParams = {
        ...params,
        pagination: {
          ...params.pagination,
          page: currentPage
        }
      };

      const currentPageQueryCursor = await this.getQueryCursor(collection, currentPageParams, resourceName);
      if (currentPageQueryCursor) {
        lastQueryCursor = currentPageQueryCursor;
      } else {
        currentPage--;
      }
    }
    const limit = (page - currentPage) * perPage;
    const newQuery = currentPage === 1 ?
      query.limit(limit) : query.startAfter(lastQueryCursor).limit(limit);

    const snapshots = await newQuery.get();
    this.incrementFirebaseReadsCounter(snapshots.docs.length);
    return snapshots.docs[snapshots.docs.length - 1];
  }

  private async tryGetResource(
    resourceName: string,
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    return this.rm.TryGetResourcePromise(resourceName, collectionQuery);
  }

  public incrementFirebaseReadsCounter(newReads: number) {
    if (isReadsLoggingEnabled(this.options)) {
      this.readsLogger.incrementAll(newReads);
    }
  }
}
