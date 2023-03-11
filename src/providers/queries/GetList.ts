import {
  filterArray,
  log,
  recursivelyMapStorageUrls,
  sortArray,
} from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database/FireClient';
import { FirebaseLazyLoadingClient } from '../lazy-loading/FirebaseLazyLoadingClient';

export async function GetList<T extends ra.Record>(
  resourceName: string,
  params: ra.GetListParams,
  client: FireClient
): Promise<ra.GetListResult<T>> {
  log('GetList', { resourceName, params });
  const { rm, fireWrapper, options } = client;

  if (options?.lazyLoading?.enabled) {
    const lazyClient = new FirebaseLazyLoadingClient(options, rm, client);
    return lazyClient.apiGetList<T>(resourceName, params);
  }

  const filterSafe = params.filter || {};

  const collectionQuery = filterSafe.collectionQuery;
  delete filterSafe.collectionQuery;

  const r = await rm.TryGetResource(resourceName, 'REFRESH', collectionQuery);
  const data = r.list;
  if (params.sort != null) {
    const { field, order } = params.sort;
    if (order === 'ASC') {
      sortArray(data, field, 'asc');
    } else {
      sortArray(data, field, 'desc');
    }
  }
  let softDeleted = data;
  if (options.softDelete && !Object.keys(filterSafe).includes('deleted')) {
    softDeleted = data.filter((doc) => !doc.deleted);
  }
  const filteredData = filterArray(softDeleted, filterSafe);
  const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
  const pageEnd = pageStart + params.pagination.perPage;
  const dataPage = filteredData.slice(pageStart, pageEnd) as T[];
  const total = filteredData.length;

  if (options.relativeFilePaths) {
    const fetchedData = await Promise.all(
      dataPage.map((doc) => recursivelyMapStorageUrls(fireWrapper, doc))
    );
    return {
      data: fetchedData,
      total,
    };
  }

  return {
    data: dataPage,
    total,
  };
}
