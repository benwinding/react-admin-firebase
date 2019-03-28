import * as firebase from "firebase/app";
import "firebase/firestore";

// in src/authProvider.js
import { AUTH_LOGIN } from "react-admin";

export default async (type, params) => {
  console.log('firebaseAuthProvider: ', {type, params});
  if (type === AUTH_LOGIN) {
    const { username, password } = params;
    const authUser = await firebase
      .auth()
      .signInWithEmailAndPassword(username, password);
    if (!authUser) {
      throw new Error("Login error: invalid credentials");
    }
  }
};
