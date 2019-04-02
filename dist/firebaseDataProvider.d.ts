import * as firebase from "firebase/app";
import "firebase/firestore";
import { Observable } from "rxjs";
export interface IResource {
    path: string;
    collection: firebase.firestore.CollectionReference;
    observable: Observable<{}>;
    list: Array<{}>;
}
declare class FirebaseClient {
    private db;
    private app;
    private resources;
    constructor(firebaseConfig: {});
    private parseFireStoreDocument;
    initPath(path: string): Promise<void>;
    apiGetList(resourceName: string, params: IParamsGetList): Promise<IResponseGetList>;
    apiGetOne(resourceName: string, params: IParamsGetOne): Promise<IResponseGetOne>;
    apiCreate(resourceName: string, params: IParamsCreate): Promise<IResponseCreate>;
    apiUpdate(resourceName: string, params: IParamsUpdate): Promise<IResponseUpdate>;
    apiUpdateMany(resourceName: string, params: IParamsUpdateMany): Promise<IResponseUpdateMany>;
    apiDelete(resourceName: string, params: IParamsDelete): Promise<IResponseDelete>;
    apiDeleteMany(resourceName: string, params: IParamsDeleteMany): Promise<IResponseDeleteMany>;
    apiGetMany(resourceName: string, params: IParamsGetMany): Promise<IResponseGetMany>;
    apiGetManyReference(resourceName: string, params: IParamsGetManyReference): Promise<IResponseGetManyReference>;
    GetResource(resourceName: string): IResource;
    private sortArray;
    private filterArray;
    private setList;
    private tryGetResource;
    private getCollectionObservable;
}
export declare let fb: FirebaseClient;
export default function FirebaseProvider(config: {}): (type: string, resourceName: string, params: any) => Promise<any>;
export {};
