import { FireStoreCollectionRef, FireStoreQuery, FireStoreQueryOrder } from 'misc/firebase-models';
import { IFirestoreLogger, messageTypes } from '../../misc';
import { findLastQueryCursor, getQueryCursor } from './queryCursors';

interface ParamsToQueryOptions {
  filters?: boolean;
  sort?: boolean;
  pagination?: boolean;
}

const defaultParamsToQueryOptions = {
  filters: true,
  sort: true,
  pagination: true,
};

export async function paramsToQuery<
  TParams extends messageTypes.IParamsGetList
>(
  collection: FireStoreCollectionRef,
  params: TParams,
  resourceName: string,
  flogger: IFirestoreLogger,
  options: ParamsToQueryOptions = defaultParamsToQueryOptions
): Promise<FireStoreQuery> {
  const filtersStepQuery = options.filters
    ? filtersToQuery(collection, params.filter)
    : collection;

  const sortStepQuery = options.sort
    ? sortToQuery(filtersStepQuery, params.sort)
    : filtersStepQuery;

  return options.pagination
    ? paginationToQuery(
        sortStepQuery,
        params,
        collection,
        resourceName,
        flogger
      )
    : sortStepQuery;
}

export function filtersToQuery(
  query: FireStoreQuery,
  filters: { [fieldName: string]: any }
): FireStoreQuery {
  const res = Object.entries(filters).reduce((acc,[fieldName, fieldValue]) => {
    const opStr = fieldValue && Array.isArray(fieldValue) ? 'in' : '==';
    return acc.where(fieldName, opStr, fieldValue);
  }, query);
  return res;
}

export function sortToQuery(
  query: FireStoreQuery,
  sort: { field: string; order: string }
): FireStoreQuery {
  if (sort != null && sort.field !== 'id') {
    const { field, order } = sort;
    const parsedOrder = order.toLocaleLowerCase() as FireStoreQueryOrder;
    return query.orderBy(field, parsedOrder);
  }
  return query;
}

async function paginationToQuery<TParams extends messageTypes.IParamsGetList>(
  query: FireStoreQuery,
  params: TParams,
  collection: FireStoreCollectionRef,
  resourceName: string,
  flogger: IFirestoreLogger
): Promise<FireStoreQuery> {
  const { page, perPage } = params.pagination;
  if (page === 1) {
    query = query.limit(perPage);
  } else {
    let queryCursor = await getQueryCursor(
      collection,
      params,
      resourceName,
      flogger
    );
    if (!queryCursor) {
      queryCursor = await findLastQueryCursor(
        collection,
        query,
        params,
        resourceName,
        flogger
      );
    }
    query = query.startAfter(queryCursor).limit(perPage);
  }

  return query;
}

export function getFullParamsForQuery<
  TParams extends messageTypes.IParamsGetList
>(reactAdminParams: TParams, softdeleteEnabled: boolean): TParams {
  return {
    ...reactAdminParams,
    filter: softdeleteEnabled
      ? {
          deleted: false,
          ...reactAdminParams.filter,
        }
      : reactAdminParams.filter,
  };
}

export function getNextPageParams<TParams extends messageTypes.IParamsGetList>(
  params: TParams
): TParams {
  return {
    ...params,
    pagination: {
      ...params.pagination,
      page: params.pagination.page + 1,
    },
  };
}
