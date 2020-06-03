import { RAFirebaseOptions } from '../../../providers/options';
import { FiReLoggerError, FiReLoggerInternalError } from '../utils/logger-errors';
import { readsLoggerConsole } from '../utils/readsLoggerConsole';
import { getFiReLoggerOptions, isReadsLoggerEnabled } from '../../../misc/options-utils';
import ReadsLoggerLocalStorageUtils from './ReadsLoggerLocalStorageUtils';
import { loggerConstants, loggerStreamHelpers, loggerTypes } from '../utils/logger-helpers';

export default class ReadsLogger implements loggerTypes.ReadsLogger {
  /*
   * CURRENT PAGE FIREBASE READS COUNTER INTERFACE
   *
   * pageReads should be used to track firebase reads for displayed page.
   * It means that resetPageReads() should be called on every navigation
   * in react-admin application
   *
   * lastPageReads will contain reads for previously displayed page
   */
  public get pageReads(): number {
    return this._pageReads;
  }
  public get lastPageReads(): number {
    return this._lastPageReads;
  }
  public resetPageReads: loggerTypes.ResetFn = () => {
    this._lastPageReads = this.pageReads;
    this._pageReads = 0;
    this.subjects.pageReads.next(this.pageReads);
    this.subjects.lastPageReads.next(this.lastPageReads);
  };
  private incrementPageReads: loggerTypes.IncrementFn = newReads => {
    this._pageReads += newReads;
    this.subjects.pageReads.next(this.pageReads);
  };
  private _lastPageReads: number = 0;
  private _pageReads: number = 0;
  /*
   * CUSTOM FIREBASE READS COUNTER INTERFACE
   *
   * customReads should be used to track user controlled
   * period of firebase reads
   * It means that resetCustomReads() should be called after
   * click on Reset Custom Counter button
   *
   * lastCustomReads will contain reads for previous custom counter
   */
  public get customReads(): number {
    return this.storage.getReads('customReads');
  }
  public get lastCustomReads(): number {
    return this.storage.getReads('lastCustomReads');
  }
  public resetCustomReads: loggerTypes.ResetFn = () => {
    this.storage.resetReads('customReads');
    this.subjects.customReads.next(this.customReads);
    this.subjects.lastCustomReads.next(this.lastCustomReads);
  };
  private incrementCustomReads: loggerTypes.IncrementFn = newReads => {
    this.storage.incrementReads(newReads, 'customReads');
    this.subjects.customReads.next(this.customReads);
  };
  /*
   * USER SESSION FIREBASE READS COUNTER INTERFACE
   *
   * sessionReads should be used to track all firebase reads
   * in user session.
   * It means that resetSessionReads() should be called on every logout from
   * react-admin application
   *
   * lastSessionReads will contain reads for previous user session
   */
  public get sessionReads(): number {
    return this.storage.getReads('sessionReads');
  }
  public get lastSessionReads(): number {
    return this.storage.getReads('lastSessionReads');
  }
  private resetSessionReads: loggerTypes.ResetFn = () => {
    this.subjects.sessionReads.next(this.sessionReads);
    this.subjects.lastSessionReads.next(this.lastSessionReads);
  };
  private incrementSessionReads: loggerTypes.IncrementFn = newReads => {
    this.storage.incrementReads(newReads, 'sessionReads');
    this.subjects.sessionReads.next(this.sessionReads);
  };
  /*
   * INCREMENT ALL COUNTERS
   */
  public incrementAll: loggerTypes.IncrementFn = newReads => {
    this.incrementPageReads(newReads);
    this.incrementCustomReads(newReads);
    this.incrementSessionReads(newReads);
  };
  /*
   * STREAMS
   */
  private subjects: loggerTypes.CounterSubjects =
    loggerStreamHelpers.createSubjects();
  public get counters$(): loggerTypes.CounterStreams {
    return loggerStreamHelpers.getStreams(this.subjects);
  }
  private emitAllCurrentValues = (
    readsKeys: loggerTypes.CounterEmitOptions
  ) => {
    Object.keys(readsKeys)
      .filter(key => Boolean(readsKeys[key]))
      .forEach(key => {
        this.subjects[key].next(this[key]);
      });
  };
  private unsubscribeAllStreams = () => {
    Object.keys(loggerConstants.EMIT_OPTIONS_ALL)
      .forEach(key => {
        this.subjects[key].unsubscribe();
      });
  };

  private async init(): Promise<void> {
    await this.storage.init(this.resetSessionReads);
    this.emitAllCurrentValues(loggerConstants.EMIT_OPTIONS_FROM_STORAGE);
  }
  /*
   * Private constructor - reads logger will be singleton
   */
  private constructor(
    private storage: ReadsLoggerLocalStorageUtils
  ) {}

  /*
   * Statics
   *
   * private __instance - ReadsLogger singleton instance
   *
   * ReadsLogger.initLogger(options) - initializing ReadsLogger singleton
   * instance
   *
   * ReadsLogger.getLogger() - get ReadsLogger singleton instance
   */
  private static __instance: ReadsLogger = null;
  private static __isInitialized: boolean = false;
  private static __options: RAFirebaseOptions = null;
  private static get __hasInstance(): boolean {
    return Boolean(ReadsLogger.__instance);
  }
  private static get __hasRunningInstance(): boolean {
    return ReadsLogger.__hasInstance && this.__isInitialized;
  }

  public static initLogger(options: RAFirebaseOptions): void {
    if (!isReadsLoggerEnabled(options)) {
      readsLoggerConsole.error({
        message: 'Logging not enabled'
      });
      return readsLoggerConsole.warn({
        message: 'FirebaseReadsLogger cannot be initialized, if logging is not enabled'
      });
    }
    // initLogger should be called just once, on application init
    // If it's called again and ReadsLogger singleton instance already
    // exists, warning will be displayed in console
    if (ReadsLogger.__hasRunningInstance) {
      return readsLoggerConsole.warn({
        message: 'FirebaseReadsLogger Already Initialized!',
        suggestion: 'Use getFirebaseReadsLogger() instead'
      });
    }
    ReadsLogger.__options = options;
    ReadsLogger.__instance = new ReadsLogger(
      new ReadsLoggerLocalStorageUtils(options)
    );

    readsLoggerConsole.log({
      message: 'FirebaseReadsLogger instance Created!'
    });

    ReadsLogger.__instance.init()
      .then(this.__handleInitLoggerSuccess)
      .catch(this.__handleInitLoggerError);
  }

  private static __handleInitLoggerSuccess = () => {
    ReadsLogger.__isInitialized = true;
    readsLoggerConsole.log({
      message: 'FirebaseReadsLogger Initialized!'
    });
  };

  private static __handleInitLoggerError = (
    { message }: FiReLoggerInternalError
  ) => {
    readsLoggerConsole.error({ message });
    readsLoggerConsole.warn({
      message: `Because of FirebaseReadsLogger initialization error, created,
          but not initiated instance will be removed`
    });
    ReadsLogger.__instance = null;
    ReadsLogger.__isInitialized = false;
  };

  public static getLogger(): ReadsLogger | false {
    return ReadsLogger.__hasInstance ? ReadsLogger.__instance : false;
  }

  public static async getRunningLoggerAsync(
    options?: RAFirebaseOptions
  ): Promise<loggerTypes.ReadsLogger | false> {
    options = options || ReadsLogger.__options;
    const {
      getLoggerAsyncOptions: {
        retryLimit,
        retryTimeout
      } = loggerConstants.DEFAULT_GET_LOGGER_ASYNC_OPTIONS
    } = getFiReLoggerOptions(options);

    const getLogger: loggerTypes.GetLoggerAsyncFn = async retryCount =>
      new Promise((resolve, reject) => {
        if (ReadsLogger.__hasRunningInstance) {
          resolve(ReadsLogger.__instance);
        }

        if (retryCount >= retryLimit) {
          reject(new FiReLoggerError('Cannot get FirebaseReadsLogger'));
        }

        const timeout = retryTimeout * 1000;
        const resolveRecursive = () => resolve(getLogger(++retryCount));
        setTimeout(resolveRecursive, timeout);
      });

    try {
      return await getLogger(0);
    } catch (e) {
      readsLoggerConsole.error({ message: e.message });
      readsLoggerConsole.warn({
        message: `getRunningLoggerAsync failed after ${retryLimit} retries.
          (${retryLimit * retryTimeout} seconds). Make sure if
          FirebaseReadsLogger was initialized`
      });
      return false;
    }
  }

  public static destroyLogger(): void {
    ReadsLogger.__instance.storage.clean();
    ReadsLogger.__instance.storage = null;
    ReadsLogger.__instance.unsubscribeAllStreams();
    ReadsLogger.__instance = null;
    ReadsLogger.__isInitialized = false;
  }
}
