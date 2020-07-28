import { RAFirebaseOptions } from '../providers/options';
import LazyLoadingOptions from '../providers/_lazy-loading/options';
import FiReLoggerOptions from '../tools/reads-logger/options';

type GetOptionsFn<T> = (options: RAFirebaseOptions) => T;

export const getLazyLoadingOptions: GetOptionsFn<LazyLoadingOptions> =
    options => options && options.lazyLoading;

export const getFiReLoggerOptions: GetOptionsFn<FiReLoggerOptions> =
  options => options && options.firebaseReadsLogger;

export const isLazyLoadingEnabled: GetOptionsFn<boolean> =
  options => getLazyLoadingOptions(options) &&
    getLazyLoadingOptions(options).enabled;

export const isReadsLoggerEnabled: GetOptionsFn<boolean> =
  options => getFiReLoggerOptions(options) &&
    getFiReLoggerOptions(options).enabled;
