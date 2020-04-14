import "firebase/auth";
import { RAFirebaseOptions } from "./RAFirebaseOptions";
export declare function AuthProvider(firebaseConfig: {}, options: RAFirebaseOptions): {
    login: (params: any) => Promise<unknown>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<unknown>;
    checkError: (error: any) => Promise<string>;
    getPermissions: () => Promise<any>;
    getJWTAuthTime: () => Promise<any>;
    getJWTExpirationTime: () => Promise<any>;
    getJWTSignInProvider: () => Promise<any>;
    getJWTClaims: () => Promise<any>;
    getJWTToken: () => Promise<any>;
};
