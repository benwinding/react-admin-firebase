import { messageTypes } from './../misc/messageTypes';
import firebase from 'firebase/app';
import 'firebase/auth';
import { FirebaseAuth, User } from '@firebase/auth-types';
import { log, retrieveStatusTxt, logWarn, logger } from '../misc';
import { RAFirebaseOptions } from './options';
import { FirebaseWrapper } from './database/firebase/FirebaseWrapper';
import {
  AuthProvider as RaAuthProvider,
  UserIdentity,
} from '../misc/react-admin-models';

class AuthClient {
  private auth: FirebaseAuth;

  constructor(firebaseConfig: {}, optionsInput?: RAFirebaseOptions) {
    const options = optionsInput || {};
    log('Auth Client: initializing...', { firebaseConfig, options });
    const fireWrapper = new FirebaseWrapper();
    fireWrapper.init(firebaseConfig, options);
    this.auth = fireWrapper.auth();
    options.persistence && this.setPersistence(options.persistence);
  }

  setPersistence(persistenceInput: 'session' | 'local' | 'none') {
    let persistenceResolved: string;
    switch (persistenceInput) {
      case 'local':
        persistenceResolved = firebase.auth.Auth.Persistence.LOCAL;
        break;
      case 'none':
        persistenceResolved = firebase.auth.Auth.Persistence.NONE;
        break;
      case 'session':
      default:
        persistenceResolved = firebase.auth.Auth.Persistence.SESSION;
        break;
    }
    log('setPersistence', { persistenceInput, persistenceResolved });
    this.auth
      .setPersistence(persistenceResolved)
      .catch((error) => console.error(error));
  }

  public async HandleAuthLogin(params: { username: string; password: string }) {
    const { username, password } = params;

    if (username && password) {
      try {
        const user = await this.auth.signInWithEmailAndPassword(
          username,
          password
        );
        log('HandleAuthLogin: user sucessfully logged in', { user });
        return user;
      } catch (e) {
        log('HandleAuthLogin: invalid credentials', { params });
        throw new Error('Login error: invalid credentials');
      }
    } else {
      return this.getUserLogin();
    }
  }

  public HandleAuthLogout() {
    return this.auth.signOut();
  }

  public HandleAuthError(errorHttp: messageTypes.HttpErrorType) {
    log('HandleAuthLogin: invalid credentials', { errorHttp });
    const status = !!errorHttp && errorHttp.status;
    const statusTxt = retrieveStatusTxt(status);
    if (statusTxt === 'ok') {
      log('API is actually authenticated');
      return Promise.resolve();
    }
    logWarn('Recieved authentication error from API');
    return Promise.reject();
  }

  public async HandleAuthCheck(): Promise<void> {
    return this.getUserLogin() as any; // Prevents breaking change
  }

  public getUserLogin(): Promise<User> {
    return new Promise((resolve, reject) => {
      if (this.auth.currentUser) return resolve(this.auth.currentUser);
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
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
      log('HandleGetPermission: no user is logged in or tokenResult error', {
        e,
      });
      return null;
    }
  }

  public async HandleGetIdentity(): Promise<UserIdentity> {
    try {
      const { uid, displayName, photoURL } = await this.getUserLogin();
      const identity: UserIdentity = {
        id: uid,
        fullName: displayName + '',
        avatar: photoURL + '',
      };
      return identity;
    } catch (e) {
      log('HandleGetIdentity: no user is logged in', {
        e,
      });
      return null as any;
    }
  }

  public async HandleGetJWTAuthTime() {
    try {
      const user = await this.getUserLogin();
      // @ts-ignore
      const token = await user.getIdTokenResult();

      return token.authTime;
    } catch (e) {
      log('HandleGetJWTAuthTime: no user is logged in or tokenResult error', {
        e,
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
      log(
        'HandleGetJWTExpirationTime: no user is logged in or tokenResult error',
        {
          e,
        }
      );
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
      log(
        'HandleGetJWTSignInProvider: no user is logged in or tokenResult error',
        {
          e,
        }
      );
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
      log(
        'HandleGetJWTIssuedAtTime: no user is logged in or tokenResult error',
        {
          e,
        }
      );
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
      log(
        'HandleGetJWTToken: no user is logged in or tokenResult error',
        {
          e,
        }
      );
      return null;
    }
  }
}

export function AuthProvider(
  firebaseConfig: {},
  options: RAFirebaseOptions
): RaAuthProvider {
  VerifyAuthProviderArgs(firebaseConfig, options);
  logger.SetEnabled(!!options?.logging);
  const auth = new AuthClient(firebaseConfig, options);

  const provider: RaAuthProvider = {
    // React Admin Interface
    login: (params) => auth.HandleAuthLogin(params),
    logout: () => auth.HandleAuthLogout(),
    checkAuth: () => auth.HandleAuthCheck(),
    checkError: (error) => auth.HandleAuthError(error),
    getPermissions: () => auth.HandleGetPermissions(),
    getIdentity: () => auth.HandleGetIdentity(),
    // Custom Functions
    getAuthUser: () => auth.getUserLogin(),
    getJWTAuthTime: () => auth.HandleGetJWTAuthTime(),
    getJWTExpirationTime: () => auth.HandleGetJWTExpirationTime(),
    getJWTSignInProvider: () => auth.HandleGetJWTSignInProvider(),
    getJWTClaims: () => auth.HandleGetPermissions(),
    getJWTToken: () => auth.HandleGetJWTToken(),
  };
  return provider;
}

function VerifyAuthProviderArgs(
  firebaseConfig: {},
  options: RAFirebaseOptions
) {
  const hasNoApp = !options || !options.app;
  const hasNoConfig = !firebaseConfig;
  if (hasNoConfig && hasNoApp) {
    throw new Error(
      'Please pass the Firebase firebaseConfig object or options.app to the FirebaseAuthProvider'
    );
  }
}
