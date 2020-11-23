import {
  CollectionReference,
  DocumentSnapshot,
  OrderByDirection,
  Query,
} from '@firebase/firestore-types';
import { RAFirebaseOptions } from 'providers/options';
import { messageTypes } from '../../../misc';
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

export async function paramsToQuery<TParams extends messageTypes.IParamsGetList>(
  collection: CollectionReference,
  params: TParams,
  resourceName: string,
  options: ParamsToQueryOptions = defaultParamsToQueryOptions
): Promise<Query> {
  const filtersStepQuery = options.filters
    ? filtersToQuery(collection, params.filter)
    : collection;

  const sortStepQuery = options.sort
    ? sortToQuery(filtersStepQuery, params.sort)
    : filtersStepQuery;

  return options.pagination
    ? paginationToQuery(sortStepQuery, params, collection, resourceName)
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
  resourceName: string
): Promise<Query> {
  const { page, perPage } = params.pagination;
  if (page === 1) {
    query = query.limit(perPage);
  } else {
    let queryCursor = await getQueryCursor(
      collection,
      params,
      resourceName
    );
    if (!queryCursor) {
      queryCursor = await findLastQueryCursor(
        collection,
        query,
        params,
        resourceName
      );
    }
    query = query.startAfter(queryCursor).limit(perPage);
  }

  return query;
}


export function getFullParamsForQuery<TParams extends messageTypes.IParamsGetList>(
  reactAdminParams: TParams,
  softdeleteEnabled: boolean
): TParams {
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
