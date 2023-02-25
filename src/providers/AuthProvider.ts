import { log, logger, logWarn, retrieveStatusTxt } from '../misc';
import { FireUser } from '../misc/firebase-models';
import {
  AuthProvider as RaAuthProvider,
  UserIdentity,
} from '../misc/react-admin-models';
import { messageTypes } from './../misc/messageTypes';
import { IFirebaseWrapper } from './database';
import { FirebaseWrapper } from './database/firebase/FirebaseWrapper';
import { RAFirebaseOptions } from './options';

class AuthClient {
  private fireWrapper: IFirebaseWrapper;

  constructor(firebaseConfig: {}, optionsInput?: RAFirebaseOptions) {
    const options = optionsInput || {};
    log('Auth Client: initializing...', { firebaseConfig, options });
    this.fireWrapper = new FirebaseWrapper(options, firebaseConfig);
    options.persistence && this.setPersistence(options.persistence);
  }

  setPersistence(persistenceInput: 'session' | 'local' | 'none') {
    return this.fireWrapper.authSetPersistence(persistenceInput);
  }

  public async HandleAuthLogin(params: { username: string; password: string }) {
    const { username, password } = params;

    if (username && password) {
      try {
        const user = await this.fireWrapper.authSigninEmailPassword(
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
    return this.fireWrapper.authSignOut();
  }

  public HandleAuthError(errorHttp: messageTypes.HttpErrorType) {
    log('HandleAuthLogin: invalid credentials', { errorHttp });
    const status = !!errorHttp && errorHttp.status;
    const statusTxt = retrieveStatusTxt(status);
    if (statusTxt === 'ok') {
      log('API is actually authenticated');
      return Promise.resolve();
    }
    logWarn('Received authentication error from API');
    return Promise.reject();
  }

  public async HandleAuthCheck(): Promise<any> {
    return this.getUserLogin();
  }

  public getUserLogin(): Promise<FireUser> {
    return this.fireWrapper.authGetUserLoggedIn();
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
        fullName: `${displayName ?? ''}`,
        avatar: `${photoURL ?? ''}`,
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
      log('HandleGetJWTToken: no user is logged in or tokenResult error', {
        e,
      });
      return null;
    }
  }
}

export function AuthProvider(
  firebaseConfig: {},
  options: RAFirebaseOptions
): ReactAdminFirebaseAuthProvider {
  VerifyAuthProviderArgs(firebaseConfig, options);
  logger.SetEnabled(!!options?.logging);
  const auth = new AuthClient(firebaseConfig, options);

  const provider: ReactAdminFirebaseAuthProvider = {
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

export type ReactAdminFirebaseAuthProvider = RaAuthProvider & {
  // Custom Functions
  getAuthUser: () => Promise<FireUser>;
  getJWTAuthTime: () => Promise<string | null>;
  getJWTExpirationTime: () => Promise<string | null>;
  getJWTSignInProvider: () => Promise<string | null>;
  getJWTClaims: () => Promise<{ [key: string]: any } | null>;
  getJWTToken: () => Promise<string | null>;
};

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
