import { messageTypes } from "../misc";
import { RAFirebaseOptions } from "./RAFirebaseOptions";
import { FirebaseClient } from "./database/FirebaseClient";
export declare let fb: FirebaseClient;
export declare function DataProvider(firebaseConfig: {}, optionsInput?: RAFirebaseOptions): (type: string, resourceName: string, params: any) => Promise<messageTypes.IResponseAny>;
