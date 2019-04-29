// import * as firebase from "firebase";
import * as firebaseApp from "firebase/app";
import "firebase/auth";

import { FirebaseApp } from "@firebase/app-types";
import { FirebaseAuth } from "@firebase/auth-types";

import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from "react-admin";

function log(description: string, obj?: {}) {
  if (ISDEBUG) {
    console.log("FirebaseAuthProvider: " + description, obj);
  }
}

var ISDEBUG = false;

class AuthClient {
  app: FirebaseApp;
  auth: FirebaseAuth;

  constructor(firebaseConfig: {}) {
    log("Auth Client: initializing...");
    if (!firebaseApp.apps.length) {
      this.app = firebaseApp.initializeApp(firebaseConfig);
    } else {
      this.app = firebaseApp.app();
    }
    this.auth = firebaseApp.auth();
  }

  async HandleAuthLogin(params) {
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

  async HandleAuthLogout(params) {
    await this.auth.signOut();
  }

  async HandleAuthError(params) {}

  async HandleAuthCheck(params) {
    try {
      const user = await this.getUserLogin();
      log("HandleAuthCheck: user is still logged in", { user });
    } catch (e) {
      log("HandleAuthCheck: ", { e });
      throw new Error("Auth check error: " + e);
    }
  }

  async getUserLogin() {
    return new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged(user => {
        if (user) {
          resolve(user);
        } else {
          reject("User not logged in");
        }
      });
    });
  }
}

function SetUpAuth(config: {}) {
  if (!config) {
    throw new Error(
      "Please pass the Firebase config.json object to the FirebaseAuthProvider"
    );
  }
  ISDEBUG = config["debug"];
  const auth = new AuthClient(config);

  return async function(type: string, params: {}) {
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
        default:
          throw new Error("Unhandled auth type:" + type);
      }
    }
  };
}

export default SetUpAuth;
