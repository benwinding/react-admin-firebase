import { FireStoreCollectionRef, FireStoreQuery } from './firebase-models';
import { ParsedRefDoc } from './internal.models';
// Firebase types
import { GetListParams } from './react-admin-models';

// PARAMETERS
export namespace messageTypes {
  export type IParamsGetList = GetListParams;

  export type CollectionQueryType = (
    arg0: FireStoreCollectionRef
  ) => FireStoreQuery;

  export interface IParamsGetOne {
    id: string;
  }

  export interface IParamsCreate {
    data: {
      id?: string;
      [key: string]: any;
    };
  }

  export interface IParamsUpdate {
    id: string;
    data: { id: string };
    previousData: {};
  }

  export interface IParamsUpdateMany {
    ids: string[];
    data: {
      id: string;
    };
  }

  export interface IParamsDelete {
    id: string;
    previousData: {};
  }

  export interface IParamsDeleteMany {
    ids: string[];
  }

  export type IdMaybeRef = string | any;
  export interface IParamsGetMany {
    ids: (string | ParsedRefDoc)[];
  }

  export interface IParamsGetManyReference {
    target: string;
    id: string;
    pagination: {
      page: number;
      perPage: number;
    };
    sort: {
      field: string;
      order: string;
    };
    filter?: {
      collectionQuery?: CollectionQueryType;
      [fieldName: string]: any;
    };
  }

  // RESPONSES

  export interface IResponseGetList {
    data: Array<{}>;
    total: number;
  }

  export interface IResponseGetOne {
    data: {};
  }

  export interface IResponseCreate {
    data: {};
  }

  export interface IResponseUpdate {
    data: { id: string };
  }

  export interface IResponseUpdateMany {
    data: Array<{}>;
  }

  export interface IResponseDelete {
    data: {};
  }

  export interface IResponseDeleteMany {
    data: Array<{}>;
  }

  export interface IResponseGetMany {
    data: Array<{}>;
  }

  export interface IResponseGetManyReference {
    data: Array<{}>;
    total: number;
  }

  export interface HttpErrorType {
    status: number;
    message: string;
    json?: any;
  }

  export type IResponseAny =
    | IResponseGetList
    | IResponseGetOne
    | IResponseCreate
    | IResponseUpdate
    | IResponseUpdateMany
    | IResponseDelete
    | IResponseDeleteMany
    | HttpErrorType;
}
