import { FiReLoggerInternalError } from '../utils/logger-errors';
import { RAFirebaseOptions } from '../../../providers/options';
import firebase from 'firebase/app';
import 'firebase/auth';
import { getFiReLoggerOptions } from '../../../misc/options-utils';
import FiReLoggerOptions from '../options';
import { readsLoggerConsole } from '../utils/readsLoggerConsole';

type ReadsKey = 'customReads' | 'sessionReads';
type GetReadsFn = (readsKey: keyof FiReLoggerStorageKeys) => number;
type ResetReadsFn = (readsKey: ReadsKey) => void;
type IncrementReadsFn = (newReads: number, readsKey: ReadsKey) => void;
type CheckUserStateFn = (snapshot: firebase.User | null) => boolean;

interface FiReLoggerStorageKeys {
  customReads: string;
  lastCustomReads: string;
  sessionReads: string;
  lastSessionReads: string;
}

export default class ReadsLoggerLocalStorageUtils {
  /*
   * PRIVATE FIELDS
   */
  private storageKeys: FiReLoggerStorageKeys = null;
  private get hasKeys(): boolean {
    return Boolean(this.storageKeys);
  }
  private readonly loggerOptions: FiReLoggerOptions;
  private readonly DEFAULT_PREFIX: string = 'ra-firebase-reads';
  private isInitialized: boolean = false;
  private currentUserId: string = null;
  private emitSessionReadsStreams: () => void = null;
  private authStateUnsubscribe: firebase.Unsubscribe;
  /*
   * PUBLIC LOCAL STORAGE UTILS INTERFACE
   */
  public get keys(): FiReLoggerStorageKeys {
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
  public async init(sessionStreamEmitCallback: () => void) {
    if (this.isInitialized) {
      throw new FiReLoggerInternalError('Storage utils already initialized!');
    }

    this.emitSessionReadsStreams = sessionStreamEmitCallback;

    return this.isInitialized = await this.startUserSubscription();
  }
  /*
   * Clean
   */
  public clean = () => this.authStateUnsubscribe();
  /*
   * Class will be only imported in ReadsLogger file
   * and constructor will be only called in ReadsLogger.init()
   */
  constructor(
    private readonly options: RAFirebaseOptions
  ) {
    this.loggerOptions = getFiReLoggerOptions(this.options);
  }
  /*
   * Initial subscription for user id to save counters for user
   */
  private async startUserSubscription(): Promise<boolean> {
    const isLoggedOut: CheckUserStateFn = snapshot =>
      !snapshot && this.currentUserId !== null && this.hasKeys;

    const userChanged: CheckUserStateFn = snapshot =>
      snapshot && snapshot.uid && this.currentUserId !== snapshot.uid;

    return new Promise((resolve, reject) => {
      const firebaseAuth = this.options.app.auth() || firebase.app().auth();
      this.authStateUnsubscribe = firebaseAuth.onAuthStateChanged(
        userSnapshot => {
          if (isLoggedOut(userSnapshot)) {
            this.resetSessionReads();
            this.currentUserId = null;
            this.storageKeys = null;
          } else if (userChanged(userSnapshot)) {
            this.currentUserId = userSnapshot.uid;
            this.storageKeys = this.getLocalStorageKeys();
            resolve(true);
          }
        },
        reject
      );
    });
  }
  private resetSessionReads() {
    this.resetReads('sessionReads');
    if (this.emitSessionReadsStreams) {
      this.emitSessionReadsStreams();
    }
  }
  /*
   * INTERNAL UTILS
   */
  private setReadsInStorage(
    key: keyof FiReLoggerStorageKeys,
    reads: number
  ): void {
    localStorage.setItem(this.keys[key], String(reads));
  }

  private getLocalStorageKeys(): FiReLoggerStorageKeys {
    const customPrefix = this.loggerOptions &&
      this.loggerOptions.storagePrefix;
    const prefix = customPrefix || this.DEFAULT_PREFIX;
    const userId = this.currentUserId;

    readsLoggerConsole.log({
      action: 'get local storage keys for reads for current user',
      reason: 'get new user snapshot from firebase auth',
      userId,
      prefix
    });

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
      throw new FiReLoggerInternalError('Cannot read local storage keys.');
    }
  }

  private checkInitError() {
    if (!this.isInitialized) {
      throw new FiReLoggerInternalError('Storage utils not initialized.');
    }
  }
}
