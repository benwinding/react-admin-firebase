import {
  filterArray,
  log,
  recursivelyMapStorageUrls,
  sortArray,
} from '../../misc';
import * as ra from '../../misc/react-admin-models';
import { FireClient } from '../database/FireClient';

export async function GetManyReference<T extends ra.Record>(
  resourceName: string,
  params: ra.GetManyReferenceParams,
  client: FireClient
): Promise<ra.GetManyReferenceResult<T>> {
  const { rm, options, fireWrapper } = client;
  log('GetManyReference', { resourceName, params });
  const filterSafe = params.filter || {};
  const collectionQuery = filterSafe.collectionQuery;
  const r = await rm.TryGetResource(resourceName, 'REFRESH', collectionQuery);
  delete filterSafe.collectionQuery;
  log('apiGetManyReference', { resourceName, resource: r, params });
  const data = r.list;
  const targetField = params.target;
  const targetValue = params.id;
  let softDeleted = data;
  if (options.softDelete) {
    softDeleted = data.filter((doc) => !doc['deleted']);
  }
  const filteredData = filterArray(softDeleted, filterSafe);
  const targetIdFilter: Record<string, ra.Identifier> = {};
  targetIdFilter[targetField] = targetValue;
  const permittedData = filterArray(filteredData, targetIdFilter);
  if (params.sort != null) {
    const { field, order } = params.sort;
    if (order === 'ASC') {
      sortArray(permittedData, field, 'asc');
    } else {
      sortArray(permittedData, field, 'desc');
    }
  }
  const pageStart = (params.pagination.page - 1) * params.pagination.perPage;
  const pageEnd = pageStart + params.pagination.perPage;
  const dataPage = permittedData.slice(pageStart, pageEnd) as T[];
  const total = permittedData.length;

  if (options.relativeFilePaths) {
    const fetchedData = await Promise.all(
      permittedData.map((doc) => recursivelyMapStorageUrls(fireWrapper, doc))
    );
    return { data: fetchedData, total };
  }

  return { data: dataPage, total };
}
