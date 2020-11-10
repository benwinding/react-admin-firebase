import * as ra from '../../misc/react-admin-models';

export interface IFirebaseClient {
  apiGetList<T>(
    resourceName: string,
    params: ra.GetListParams
  ): Promise<ra.GetListResult<T>>;
  apiGetOne<T>(
    resourceName: string,
    params: ra.GetOneParams
  ): Promise<ra.GetOneResult<T>>;
  apiCreate<T>(
    resourceName: string,
    params: ra.CreateParams
  ): Promise<ra.CreateResult<T>>;
  apiUpdate<T>(
    resourceName: string,
    params: ra.UpdateParams
  ): Promise<ra.UpdateResult<T>>;
  apiUpdateMany(
    resourceName: string,
    params: ra.UpdateManyParams
  ): Promise<ra.UpdateManyResult>;
  apiDelete<T extends ra.Record>(
    resourceName: string,
    params: ra.DeleteParams
  ): Promise<ra.DeleteResult<T>>;
  apiDeleteMany(
    resourceName: string,
    params: ra.DeleteManyParams
  ): Promise<ra.DeleteManyResult>;
  apiGetMany<T extends ra.Record>(
    resourceName: string,
    params: ra.GetManyParams
  ): Promise<ra.GetManyResult<T>>;
  apiGetManyReference<T>(
    resourceName: string,
    params: ra.GetManyReferenceParams
  ): Promise<ra.GetManyReferenceResult<T>>;
}