import { IResource, ResourceManager } from "./ResourceManager";
import { RAFirebaseOptions } from "../RAFirebaseOptions";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { messageTypes } from "../../misc";
import * as ra from "../../misc/react-admin-models";
import * as q from "../queries";
import * as c from "../commands";
import { FireClient } from "./FireClient";

export class FirebaseClient {
  public rm: ResourceManager;
  private client: FireClient;

  constructor(
    public fireWrapper: IFirebaseWrapper,
    public options: RAFirebaseOptions
  ) {
    this.rm = new ResourceManager(this.fireWrapper, this.options);
    this.client = new FireClient(fireWrapper, options);
  }

  public async apiGetList<T extends ra.Record>(
    resourceName: string,
    params: ra.GetListParams
  ): Promise<ra.GetListResult<T>> {
    return q.GetList<T>(resourceName, params, this.client);
  }
  public async apiGetOne<T extends ra.Record>(
    resourceName: string,
    params: ra.GetOneParams
  ): Promise<ra.GetOneResult<T>> {
    return q.GetOne<T>(resourceName, params, this.client);
  }
  public async apiCreate<T extends ra.Record>(
    resourceName: string,
    params: ra.CreateParams
  ): Promise<ra.CreateResult<T>> {
    return c.Create<T>(resourceName, params, this.client);
  }
  public async apiUpdate<T extends ra.Record>(
    resourceName: string,
    params: ra.UpdateParams
  ): Promise<ra.UpdateResult<T>> {
    return c.Update<T>(resourceName, params, this.client);
  }
  public async apiUpdateMany(
    resourceName: string,
    params: ra.UpdateManyParams
  ): Promise<ra.UpdateManyResult> {
    return c.UpdateMany(resourceName, params, this.client);
  }
  public async apiSoftDelete(
    resourceName: string,
    params: ra.DeleteParams
  ): Promise<ra.DeleteResult> {
    return c.DeleteSoft(resourceName, params, this.client);
  }
  public async apiSoftDeleteMany(
    resourceName: string,
    params: ra.DeleteManyParams
  ): Promise<ra.DeleteManyResult> {
    return c.DeleteManySoft(resourceName, params, this.client);
  }
  public async apiDelete<T extends ra.Record>(
    resourceName: string,
    params: ra.DeleteParams
  ): Promise<ra.DeleteResult<T>> {
    return c.Delete<T>(resourceName, params, this.client);
  }
  public async apiDeleteMany(
    resourceName: string,
    params: ra.DeleteManyParams
  ): Promise<ra.DeleteManyResult> {
    return c.DeleteMany(resourceName, params, this.client);
  }
  public async apiGetMany<T extends ra.Record>(
    resourceName: string,
    params: ra.GetManyParams
  ): Promise<ra.GetManyResult<T>> {
    return q.GetMany<T>(resourceName, params, this.client);
  }
  public async apiGetManyReference<T extends ra.Record>(
    resourceName: string,
    params: ra.GetManyReferenceParams
  ): Promise<ra.GetManyReferenceResult<T>> {
    return q.GetManyReference<T>(resourceName, params, this.client);
  }
  public async TryGetResource(
    resourceName: string,
    refresh?: "REFRESH",
    collectionQuery?: messageTypes.CollectionQueryType
  ): Promise<IResource> {
    return this.rm.TryGetResource(resourceName, refresh, collectionQuery);
  }
}
