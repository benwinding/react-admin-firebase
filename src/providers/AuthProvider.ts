// import * as firebase from "firebase";
import { FirebaseAuth } from "@firebase/auth-types";
import { log, CheckLogging } from "../misc/logger";
import { RAFirebaseOptions } from "./RAFirebaseOptions";
import { FirebaseWrapper } from "./database/firebase/FirebaseWrapper";

class AuthClient {
  private auth: FirebaseAuth;

  constructor(firebaseConfig: {}, optionsInput?: RAFirebaseOptions) {
    const options = optionsInput || {};
    log("Auth Client: initializing...", {firebaseConfig, options});
    const fireWrapper = new FirebaseWrapper();
    fireWrapper.init(firebaseConfig, options);
    this.auth = fireWrapper.auth();
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
        return user
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

  public HandleAuthError(error) {
    log("HandleAuthLogin: invalid credentials", { error });
    return Promise.reject("Login error: invalid credentials");
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
      })
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

function VerifyAuthProviderArgs(firebaseConfig: {}, options: RAFirebaseOptions) {
  const hasNoApp = !options || !options.app;
  const hasNoConfig = !firebaseConfig;
  if (hasNoConfig && hasNoApp) {
    throw new Error(
      "Please pass the Firebase firebaseConfig object or options.app to the FirebaseAuthProvider"
    );
  }
}
