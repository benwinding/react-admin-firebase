import {
  CollectionReference,
  OrderByDirection,
  Query,
} from '@firebase/firestore-types';
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
  collection: CollectionReference,
  params: TParams,
  resourceName: string,
  flogger: IFirestoreLogger,
  options: ParamsToQueryOptions = defaultParamsToQueryOptions
): Promise<Query> {
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
  query: Query,
  filters: { [fieldName: string]: any }
): Query {
  Object.keys(filters).forEach((fieldName) => {
    query = query.where(fieldName, '==', filters[fieldName]);
  });
  return query;
}

export function sortToQuery(
  query: Query,
  sort: { field: string; order: string }
): Query {
  if (sort != null && sort.field !== 'id') {
    const { field, order } = sort;
    const parsedOrder = order.toLocaleLowerCase() as OrderByDirection;
    query = query.orderBy(field, parsedOrder);
  }
  return query;
}

async function paginationToQuery<TParams extends messageTypes.IParamsGetList>(
  query: Query,
  params: TParams,
  collection: CollectionReference,
  resourceName: string,
  flogger: IFirestoreLogger
): Promise<Query> {
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
