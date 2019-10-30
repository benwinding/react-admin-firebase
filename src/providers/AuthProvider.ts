// import * as firebase from "firebase";
import { FirebaseAuth } from "@firebase/auth-types";

import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_ERROR,
  AUTH_CHECK,
  AUTH_GET_PERMISSIONS
} from "react-admin";
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
  }

  public async HandleAuthLogout(params) {
    await this.auth.signOut();
  }

  public async HandleAuthError(params) { }

  public async HandleAuthCheck(params) {
    try {
      const user = await this.getUserLogin();
      log("HandleAuthCheck: user is still logged in", { user });
    } catch (e) {
      log("HandleAuthCheck: ", { e });
      throw new Error("Auth check error: " + e);
    }
  }

  public async getUserLogin() {
    return new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user);
        } else {
          reject("User not logged in");
        }
      });
    });
  }

  public async HandleGetCurrent() {
    try {
      const user = await this.getUserLogin();
      log("HandleGetCurrent: current user", { user });
      return user;
    } catch (e) {
      log("HandleGetCurrent: no user is logged in", { e });
      return null;
    }
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
}

export function AuthProvider(firebaseConfig: {}, options: RAFirebaseOptions) {
  VerifyAuthProviderArgs(firebaseConfig, options);
  const auth = new AuthClient(firebaseConfig, options);
  CheckLogging(firebaseConfig, options);

  return async (type: string, params: {}) => {
    log("Auth Event: ", { type, params });
    {
      switch (type) {
        case AUTH_LOGIN:
          return auth.HandleAuthLogin(params);
        case AUTH_LOGOUT:
          return auth.HandleAuthLogout(params);
        case AUTH_ERROR:
          return auth.HandleAuthError(params);
        case AUTH_CHECK:
          return auth.HandleAuthCheck(params);
        case "AUTH_GETCURRENT":
          return auth.HandleGetCurrent();
        case AUTH_GET_PERMISSIONS:
          return auth.HandleGetPermissions();
        default:
          throw new Error("Unhandled auth type:" + type);
      }
    }
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
