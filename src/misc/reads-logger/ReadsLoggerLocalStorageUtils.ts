import { RAFirebaseReadsLoggerError, RAFirebaseReadsLoggerStorageKeys } from "./types";
import { RAFirebaseOptions, RAFirebaseReadsLoggingOptions } from "../../providers/RAFirebaseOptions";
import firebase from "firebase/app";
import "firebase/auth";

type ReadsKey = 'customReads' | 'sessionReads';
type GetReadsFn = (readsKey: keyof RAFirebaseReadsLoggerStorageKeys) => number;
type ResetReadsFn = (readsKey: ReadsKey) => void;
type IncrementReadsFn = (newReads: number, readsKey: ReadsKey) => void;

export default class ReadsLoggerLocalStorageUtils {
  /*
   * PRIVATE FIELDS
   */
  private storageKeys: RAFirebaseReadsLoggerStorageKeys = null;
  private get hasKeys(): boolean {
    return !!this.storageKeys;
  }
  private readonly loggerOptions: RAFirebaseReadsLoggingOptions;
  private readonly DEFAULT_PREFIX: string = 'ra-firebase-reads';
  private isInitialized: boolean = false;
  /*
   * PUBLIC LOCAL STORAGE UTILS INTERFACE
   */
  public authStateUnsubscribe: firebase.Unsubscribe;

  public get keys(): RAFirebaseReadsLoggerStorageKeys {
    return this.storageKeys;
  }

  public getReads: GetReadsFn = readsKey => {
    if (!this.hasKeys) {
      return 0;
    }
    const key = this.keys[readsKey];
    const readsFromStorage = localStorage.getItem(key);
    if (readsFromStorage === null) {
      this.setReadsInStorage(readsKey, 0);
      return 0;
    }

    return parseInt(readsFromStorage, 10);
  };

  public resetReads: ResetReadsFn = readsKey => {
    this.checkErrors();
    const lastReadsKey = readsKey === 'customReads' ?
      'lastCustomReads' : 'lastSessionReads';
    const newLastReads = this.getReads(readsKey);
    this.setReadsInStorage(lastReadsKey, newLastReads);
    this.setReadsInStorage(readsKey, 0);
  };

  public incrementReads: IncrementReadsFn = (newReads, readsKey) => {
    this.checkErrors();
    const oldReads: number = this.getReads(readsKey);
    const incrementedReads = oldReads + newReads;
    this.setReadsInStorage(readsKey, incrementedReads);
  };

  /*
   * Init
   *
   * Should be called before any action in
   */
  public async init() {
    if (this.isInitialized) {
      throw new RAFirebaseReadsLoggerError('Storage utils already initialized.');
    }
    this.isInitialized = await this.startUserSubscription();
    return this.isInitialized;
  }
  /*
   * Class will be only imported in ReadsLogger file
   * and constructor will be only called in ReadsLogger.init()
   */
  constructor(
    private readonly options: RAFirebaseOptions
  ) {
    this.loggerOptions = this.options.lazyLoading.firebaseReadsLogging;
  }
  /*
   * Initial subscription for user id to save counters for user
   */
  private async startUserSubscription(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const firebaseAuth = this.options.app.auth() || firebase.app().auth();
      this.authStateUnsubscribe = firebaseAuth.onAuthStateChanged(
        userSnapshot => {
          if (userSnapshot.uid) {
            this.storageKeys = this.getLocalStorageKeys(userSnapshot.uid);
            resolve(true);
          }
        },
        error => reject(error)
      );
    });
  }
  /*
   * INTERNAL UTILS
   */
  private setReadsInStorage(
    key: keyof RAFirebaseReadsLoggerStorageKeys,
    reads: number
  ): void {
    localStorage.setItem(this.keys[key], String(reads));
  }

  private getLocalStorageKeys(
    userId: string
  ): RAFirebaseReadsLoggerStorageKeys {
    const customPrefix = this.loggerOptions &&
      this.loggerOptions.localStoragePrefix;
    const prefix = customPrefix || this.DEFAULT_PREFIX;

    return {
      customReads: `${prefix}-${userId}-custom-reads`,
      lastCustomReads: `${prefix}-${userId}-last-custom-reads`,
      sessionReads: `${prefix}-${userId}-session-reads`,
      lastSessionReads: `${prefix}-${userId}-last-session-reads`
    };
  }

  private checkErrors() {
    this.checkInitError();
    this.checkKeysError();
  }

  private checkKeysError() {
    if (!this.hasKeys) {
      throw new RAFirebaseReadsLoggerError('Cannot read local storage keys.');
    }
  }

  private checkInitError() {
    if (!this.isInitialized) {
      throw new RAFirebaseReadsLoggerError('Storage utils not initialized.');
    }
  }
}
