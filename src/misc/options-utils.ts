import { RAFirebaseOptions } from '../providers/options';
import LazyLoadingOptions from '../providers/_lazy-loading/options';
import FiReLoggerOptions from '../tools/reads-logger/options';

type GetOptionsFn<T> = (options: RAFirebaseOptions) => T;

export const getLazyLoadingOptions: GetOptionsFn<LazyLoadingOptions> =
    options => options && options.lazyLoading as any;

export const getFiReLoggerOptions: GetOptionsFn<FiReLoggerOptions> =
  options => options && options.firebaseReadsLogger as any;

export const isLazyLoadingEnabled: GetOptionsFn<boolean> = options => {
  const opt = getLazyLoadingOptions(options);
  return !!opt && opt.enabled;
}
export const isReadsLoggerEnabled: GetOptionsFn<boolean> = options => {
  const opt = getFiReLoggerOptions(options);
  return !!opt && opt.enabled;
}
