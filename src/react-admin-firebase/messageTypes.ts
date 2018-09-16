interface IParamsGetList {
  pagination: {
    page: number,
    perPage: number    
  },
  sort?: {
    field: string,
    order: string
  }
  filter?: {}
}

interface IParamsGetOne {
  id: string
}

interface IParamsCreate {
  data: {}
}

interface IParamsUpdate {
  id: string,
  data: { id:string },
  previousData: {},
}

interface IParamsUpdateMany {
  ids: string[],
  data: {}
}

interface IParamsDelete {
  id: string,
  previousData: {},
}

interface IParamsDeleteMany {
  ids: string[],
}

interface IParamsGetMany {
  ids: string[],
}    

interface IParamsGetManyReference {
  pagination: {
    page: number,
    perPage: number    
  },
  sort: {
    field: string,
    order: string
  }
  filter: {}
}    




interface IResponseGetList {
  data: Array<{}>,
  total: number
}

interface IResponseGetOne {
  data: {}
}

interface IResponseCreate {
  data: {}
}

interface IResponseUpdate {
  data: {}  
}

interface IResponseUpdateMany {
  data: Array<{}>
}

interface IResponseDelete {
  data: {}
}

interface IResponseDeleteMany {
  data: Array<{}>
}

interface IResponseGetMany {
  data: Array<{}>
}    

interface IResponseGetManyReference {
  data: Array<{}>,
  total: number
}    


