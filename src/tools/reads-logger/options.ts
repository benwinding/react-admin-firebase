export default interface FiReLoggerOptions {
  enabled: boolean;
  getLoggerAsyncOptions?: GetLoggerAsyncOptions;
  /**
   * Prefix for local storage keys for firebase reads logger
   * If not provided or if firebaseReadsLogging is boolean value,
   * it will be default value ('ra-firebase-reads')
   */
  storagePrefix?: string;
}

export interface GetLoggerAsyncOptions {
  /**
   * Limit of consecutive retries of getting
   * running FirebaseReadsLogger instance
   * @default 5
   */
  retryLimit?: number;
  /**
   * Timeout in seconds, after which the library
   * will try to get running FirebaseReadsLogger
   * instance again
   * @default 2
   */
  retryTimeout?: number;
}
