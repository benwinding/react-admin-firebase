export interface RAFirebaseOptions {
  rootRef?: string;
  app?: any;
  logging?: boolean;
  watch?: string[];
  dontwatch?: string[];
  overrideDefaultId?: boolean;
  disableMeta?: boolean;
  dontAddIdFieldToDoc?: boolean;
  persistence?: 'session' | 'local' | 'none';
  softDelete?: boolean;
  associateUsersById?: boolean;
  metaFieldCasing?: 'lower' | 'camel' | 'snake' | 'pascal' | 'kebab';
  lazyLoading?: RAFLazyLoadingOptions;
}

export interface RAFLazyLoadingOptions {
  enabled: boolean;
  firebaseReadsLogging?: RAFirebaseReadsLoggingOptions;
}

export interface RAFirebaseReadsLoggingOptions {
  enabled: boolean;
  /**
   * Prefix for local storage keys for firebase reads logger
   * If not provided or if firebaseReadsLogging is boolean value,
   * it will be default value ('ra-firebase-reads')
   */
  localStoragePrefix?: string;
}

export const isLazyLoadingEnabled =
  (options: RAFirebaseOptions) => options &&
    options.lazyLoading &&
    options.lazyLoading.enabled;

export const isReadsLoggingEnabled =
  (options: RAFirebaseOptions) => options &&
    options.lazyLoading &&
    options.lazyLoading.enabled &&
    options.lazyLoading.firebaseReadsLogging &&
    options.lazyLoading.firebaseReadsLogging.enabled;
