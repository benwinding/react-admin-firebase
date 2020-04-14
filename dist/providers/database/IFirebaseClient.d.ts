import { messageTypes } from '../../misc';
export interface IFirebaseClient {
    apiGetList(resourceName: string, params: messageTypes.IParamsGetList): Promise<messageTypes.IResponseGetList>;
    apiGetOne(resourceName: string, params: messageTypes.IParamsGetOne): Promise<messageTypes.IResponseGetOne>;
    apiCreate(resourceName: string, params: messageTypes.IParamsCreate): Promise<messageTypes.IResponseCreate>;
    apiUpdate(resourceName: string, params: messageTypes.IParamsUpdate): Promise<messageTypes.IResponseUpdate>;
    apiUpdateMany(resourceName: string, params: messageTypes.IParamsUpdateMany): Promise<messageTypes.IResponseUpdateMany>;
    apiDelete(resourceName: string, params: messageTypes.IParamsDelete): Promise<messageTypes.IResponseDelete>;
    apiDeleteMany(resourceName: string, params: messageTypes.IParamsDeleteMany): Promise<messageTypes.IResponseDeleteMany>;
    apiGetMany(resourceName: string, params: messageTypes.IParamsGetMany): Promise<messageTypes.IResponseGetMany>;
    apiGetManyReference(resourceName: string, params: messageTypes.IParamsGetManyReference): Promise<messageTypes.IResponseGetManyReference>;
}
