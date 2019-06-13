// PARAMETERS
export namespace messageTypes {
  export interface IParamsGetList {
    pagination: {
      page: number;
      perPage: number;
    };
    sort?: {
      field: string;
      order: string;
    };
    filter?: {};
  }

  export interface IParamsGetOne {
    id: string;
  }

  export interface IParamsCreate {
    data: {};
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

  export interface IParamsGetMany {
    ids: string[];
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
    filter: {};
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
}