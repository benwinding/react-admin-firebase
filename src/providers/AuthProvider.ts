// import * as firebase from "firebase";
import * as firebaseApp from "firebase/app";
import "firebase/auth";

import { FirebaseApp } from "@firebase/app-types";
import { FirebaseAuth } from "@firebase/auth-types";

import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from "react-admin";
import { log, EnableLogging } from "../misc/logger";
import { RAFirebaseOptions } from "./RAFirebaseOptions";

class AuthClient {
  private app: FirebaseApp;
  private auth: FirebaseAuth;

  constructor(firebaseConfig: {}, options: RAFirebaseOptions) {
    log("Auth Client: initializing...", {firebaseConfig, options});
    if (firebaseConfig) {
      this.initFirebaseApp(firebaseConfig)
    } else if (options.app) {
      this.app = options.app;
    } else {
      throw new Error('No firebaseConfig or options.app found, cannot access firebase');
    }
    this.auth = this.app.auth();
  }

  private initFirebaseApp(firebaseConfig: {}) {
    if (!firebaseApp.apps.length) {
      this.app = firebaseApp.initializeApp(firebaseConfig);
    } else {
      this.app = firebaseApp.app();
    }
  }

  public async HandleAuthLogin(params) {
    const { username, password } = params;

    try {
      const user = await this.auth.signInWithEmailAndPassword(
        username,
        password
      );
      log("HandleAuthLogin: user sucessfully logged in", { user });
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
    } catch (e) {
      log("HandleGetCurrent: no user is logged in", { e });
      return null;
    }
  }
}

export function AuthProvider(firebaseConfig: {}, options: RAFirebaseOptions) {
  const hasNoApp = !options || !options.app;
  const hasNoConfig = !firebaseConfig;
  if (hasNoConfig && hasNoApp) {
    throw new Error(
      "Please pass the Firebase firebaseConfig object or options.app to the FirebaseAuthProvider"
    );
  }
  const auth = new AuthClient(firebaseConfig, options);
  if (firebaseConfig["debug"] || options.logging) {
    EnableLogging();
  }

  return async (type: string, params: {}) => {
    log("Auth Event: ", { type, params });
    {
      switch (type) {
        case AUTH_LOGIN:
          await auth.HandleAuthLogin(params);
        case AUTH_LOGOUT:
          await auth.HandleAuthLogout(params);
        case AUTH_ERROR:
          await auth.HandleAuthError(params);
        case AUTH_CHECK:
          await auth.HandleAuthCheck(params);
        case "AUTH_GETCURRENT":
          await auth.HandleGetCurrent();
        default:
          throw new Error("Unhandled auth type:" + type);
      }
    }
  };
}
