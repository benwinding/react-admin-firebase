import { CollectionReference } from "@firebase/firestore-types";
import { RAFirebaseOptions } from "index";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { User } from "@firebase/auth-types";
import { messageTypes } from "../../misc/messageTypes";
export interface IResource {
    path: string;
    pathAbsolute: string;
    collection: CollectionReference;
    list: Array<{}>;
}
export declare class ResourceManager {
    private fireWrapper;
    private options;
    private resources;
    private db;
    constructor(fireWrapper: IFirebaseWrapper, options: RAFirebaseOptions);
    GetResource(relativePath: string): IResource;
    TryGetResourcePromise(relativePath: string, collectionQuery: messageTypes.CollectionQueryType): Promise<IResource>;
    RefreshResource(relativePath: string, collectionQuery: messageTypes.CollectionQueryType): Promise<void>;
    GetSingleDoc(relativePath: string, docId: string): Promise<{}>;
    private initPath;
    private parseFireStoreDocument;
    getUserLogin(): Promise<User>;
    private isCollectionAccessible;
    private removeResource;
    private applyQuery;
}
