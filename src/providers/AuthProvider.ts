import { messageTypes } from './../misc/messageTypes';
import firebase from "firebase/app";
import "firebase/auth";
import { FirebaseAuth } from "@firebase/auth-types";
import { log, CheckLogging } from "../misc";
import { RAFirebaseOptions } from "./RAFirebaseOptions";
import { FirebaseWrapper } from "./database/firebase/FirebaseWrapper";

class AuthClient {
  private auth: FirebaseAuth;

  constructor(firebaseConfig: {}, optionsInput?: RAFirebaseOptions) {
    const options = optionsInput || {};
    log("Auth Client: initializing...", { firebaseConfig, options });
    const fireWrapper = new FirebaseWrapper();
    fireWrapper.init(firebaseConfig, options);
    this.auth = fireWrapper.auth();
    this.setPersistence(options.persistence);
  }

  setPersistence(persistenceInput: "session" | "local" | "none") {
    let persistenceResolved: string;
    switch (persistenceInput) {
      case "local":
        persistenceResolved = firebase.auth.Auth.Persistence.LOCAL;
        break;
      case "none":
        persistenceResolved = firebase.auth.Auth.Persistence.NONE;
        break;
      case "session":
      default:
        persistenceResolved = firebase.auth.Auth.Persistence.SESSION;
        break;
    }
    log("setPersistence", { persistenceInput, persistenceResolved });
    this.auth
      .setPersistence(persistenceResolved)
      .catch(error => console.error(error));
  }

  public async HandleAuthLogin(params) {
    const { username, password } = params;

    if (username && password) {
      try {
        const user = await this.auth.signInWithEmailAndPassword(
          username,
          password
        );
        log("HandleAuthLogin: user sucessfully logged in", { user });
        return user;
      } catch (e) {
        log("HandleAuthLogin: invalid credentials", { params });
        throw new Error("Login error: invalid credentials");
      }
    } else {
      return this.getUserLogin();
    }
  }

  public HandleAuthLogout() {
    return this.auth.signOut();
  }

  public HandleAuthError(errorHttp: messageTypes.HttpErrorType) {
    log("HandleAuthLogin: invalid credentials", { errorHttp });
    const status = !!errorHttp && errorHttp.status;
    const statusTxt = this.retrieveStatusTxt(status);
    if (statusTxt === 'ok') {
      return Promise.resolve("API is authenticated");
    }
    return Promise.reject("Recieved authentication error from API");
  }

  // From firebase SDK
  // - https://github.com/firebase/firebase-js-sdk/blob/9f109f85ad0d99f6c13e68dcb549a0b852e35a2a/packages/functions/src/api/error.ts
  private retrieveStatusTxt(status: number): 'ok' | 'unauthenticated' {
    // Make sure any successful status is OK.
    if (status >= 200 && status < 300) {
      return "ok";
    }
    switch (status) {
      case 401: // 'unauthenticated'
      case 403: // 'permission-denied'
        return 'unauthenticated'

      case 0:   // 'internal'
      case 400: // 'invalid-argument'
      case 404: // 'not-found'
      case 409: // 'aborted'
      case 429: // 'resource-exhausted'
      case 499: // 'cancelled'
      case 500: // 'internal'
      case 501: // 'unimplemented'
      case 503: // 'unavailable'
      case 504: // 'deadline-exceeded'
      default:  // ignore
        return 'ok';
    }
  }

  public HandleAuthCheck() {
    return this.getUserLogin();
  }

  public getUserLogin() {
    return new Promise((resolve, reject) => {
      if (this.auth.currentUser) return resolve(this.auth.currentUser);
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  }

  public async HandleGetPermissions() {
    try {
      const user = await this.getUserLogin();
      // @ts-ignore
      const token = await user.getIdTokenResult();

      return token.claims;
    } catch (e) {
      log("HandleGetPermission: no user is logged in or tokenResult error", {
        e
      });
      return null;
    }
  }

  public async HandleGetJWTAuthTime() {
    try {
      const user = await this.getUserLogin();
      // @ts-ignore
      const token = await user.getIdTokenResult();

      return token.authTime;
    } catch (e) {
      log("HandleGetJWTAuthTime: no user is logged in or tokenResult error", {
        e
      });
      return null;
    }
  }

  public async HandleGetJWTExpirationTime() {
    try {
      const user = await this.getUserLogin();
      // @ts-ignore
      const token = await user.getIdTokenResult();

      return token.expirationTime;
    } catch (e) {
      log("HandleGetJWTExpirationTime: no user is logged in or tokenResult error", {
        e
      });
      return null;
    }
  }

    public async HandleGetJWTSignInProvider() {
    try {
      const user = await this.getUserLogin();
      // @ts-ignore
      const token = await user.getIdTokenResult();

      return token.signInProvider;
    } catch (e) {
      log("HandleGetJWTSignInProvider: no user is logged in or tokenResult error", {
        e
      });
      return null;
    }
  }

     public async HandleGetJWTIssuedAtTime() {
    try {
      const user = await this.getUserLogin();
      // @ts-ignore
      const token = await user.getIdTokenResult();

      return token.issuedAtTime;
    } catch (e) {
      log("HandleGetJWTIssuedAtTime: no user is logged in or tokenResult error", {
        e
      });
      return null;
    }
  }

      public async HandleGetJWTToken() {
    try {
      const user = await this.getUserLogin();
      // @ts-ignore
      const token = await user.getIdTokenResult();

      return token.token;
    } catch (e) {
      log("HandleGetJWTIssuedAtTime: no user is logged in or tokenResult error", {
        e
      });
      return null;
    }
  }
}

export function AuthProvider(firebaseConfig: {}, options: RAFirebaseOptions) {
  VerifyAuthProviderArgs(firebaseConfig, options);
  const auth = new AuthClient(firebaseConfig, options);
  CheckLogging(firebaseConfig, options);

  return {
    login: params => auth.HandleAuthLogin(params),
    logout: () => auth.HandleAuthLogout(),
    checkAuth: () => auth.HandleAuthCheck(),
    checkError: error => auth.HandleAuthError(error),
    getPermissions: () => auth.HandleGetPermissions(),
    getJWTAuthTime: () => auth.HandleGetJWTAuthTime(),
    getJWTExpirationTime: () => auth.HandleGetJWTExpirationTime(),
    getJWTSignInProvider: () => auth.HandleGetJWTSignInProvider(),
    getJWTClaims: () => auth.HandleGetPermissions(),
    getJWTToken: () => auth.HandleGetJWTToken()
  };
}

function VerifyAuthProviderArgs(
  firebaseConfig: {},
  options: RAFirebaseOptions
) {
  const hasNoApp = !options || !options.app;
  const hasNoConfig = !firebaseConfig;
  if (hasNoConfig && hasNoApp) {
    throw new Error(
      "Please pass the Firebase firebaseConfig object or options.app to the FirebaseAuthProvider"
    );
  }
}
