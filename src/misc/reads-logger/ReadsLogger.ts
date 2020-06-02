import { RAFirebaseOptions } from "../../providers/RAFirebaseOptions";
import { RAFirebaseReadsLoggerError } from "./types";
import ReadsLoggerLocalStorageUtils from "./ReadsLoggerLocalStorageUtils";
import { log, logError } from "../logger";
import { BehaviorSubject, Observable } from "rxjs";

type ResetFn = () => void;
type IncrementFn = (newReads: number) => void;

interface CounterStreams<TStreamOrSubject extends Observable<number> = Observable<number>> {
  pageReads: TStreamOrSubject;
  lastPageReads: TStreamOrSubject;
  customReads: TStreamOrSubject;
  lastCustomReads: TStreamOrSubject;
  sessionReads: TStreamOrSubject;
  lastSessionReads: TStreamOrSubject;
}

export default class ReadsLogger {
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
  public resetPageReads: ResetFn = () => {
    this._lastPageReads = this.pageReads;
    this._pageReads = 0;
    this.subjects.pageReads.next(this.pageReads);
    this.subjects.lastPageReads.next(this.lastPageReads);
  };
  public incrementPageReads: IncrementFn = newReads => {
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
  public resetCustomReads: ResetFn = () => {
    this.storage.resetReads('customReads');
    this.subjects.customReads.next(this.customReads);
    this.subjects.lastCustomReads.next(this.lastCustomReads);
  };
  public incrementCustomReads: IncrementFn = newReads => {
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
  public resetSessionReads: ResetFn = () => {
    this.storage.resetReads('sessionReads');
    this.subjects.sessionReads.next(this.sessionReads);
    this.subjects.lastSessionReads.next(this.lastSessionReads);
  };
  public incrementSessionReads: IncrementFn = newReads => {
    this.storage.incrementReads(newReads, 'sessionReads');
    this.subjects.sessionReads.next(this.sessionReads);
  };
  /*
   * INCREMENT ALL COUNTERS
   */
  public incrementAll: IncrementFn = newReads => {
    this.incrementPageReads(newReads);
    this.incrementCustomReads(newReads);
    this.incrementSessionReads(newReads);
  };
  /*
   * STREAMS
   */
  private readonly subjects: CounterStreams<BehaviorSubject<number>>;
  public get streams(): CounterStreams {
    return {
      pageReads: this.subjects.pageReads.asObservable(),
      lastPageReads: this.subjects.lastPageReads.asObservable(),
      customReads: this.subjects.customReads.asObservable(),
      lastCustomReads: this.subjects.lastCustomReads.asObservable(),
      sessionReads: this.subjects.sessionReads.asObservable(),
      lastSessionReads: this.subjects.lastSessionReads.asObservable()
    }
  }

  /*
   * Private constructor - reads logger will be singleton
   */
  private constructor(
    private storage: ReadsLoggerLocalStorageUtils
  ) {
    this.subjects = this.initCounterSubjects();
  }

  private initCounterSubjects = () => ({
    pageReads: new BehaviorSubject(this.pageReads),
    lastPageReads: new BehaviorSubject(this.lastPageReads),
    customReads: new BehaviorSubject(this.customReads),
    lastCustomReads: new BehaviorSubject(this.lastCustomReads),
    sessionReads: new BehaviorSubject(this.sessionReads),
    lastSessionReads: new BehaviorSubject(this.lastSessionReads)
  });

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

  public static initLogger(options: RAFirebaseOptions) {
    const loggingEnabled = options.lazyLoading &&
      options.lazyLoading.firebaseReadsLogging &&
      options.lazyLoading.firebaseReadsLogging.enabled;

    if (!loggingEnabled) {
      throw new RAFirebaseReadsLoggerError('Logging not enabled');
    }

    if (!ReadsLogger.__instance) {
      const storageUtils = new ReadsLoggerLocalStorageUtils(options);
      storageUtils.init()
        .then(() => {
          ReadsLogger.__instance = new ReadsLogger(storageUtils);
          log('Firebase Reads Logger Initialized!');
        })
        .catch(error => {
          logError(error.message);
        })
    }
  }

  public static getLogger(): ReadsLogger {
    if (!ReadsLogger.__instance) {
      throw new RAFirebaseReadsLoggerError('Logger Not Initialized!');
    }
    return ReadsLogger.__instance;
  }
}
