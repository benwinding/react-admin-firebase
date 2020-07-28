import { RAFirebaseOptions } from '../../../providers/options';
import ReadsLogger from './ReadsLogger';
import { loggerTypes } from '../utils/logger-helpers';

type InitLoggerFn = (options: RAFirebaseOptions) => void;
type GetLoggerFn = () => loggerTypes.ReadsLogger | false;
type GetLoggerAsyncFn = (options?: RAFirebaseOptions) =>
  Promise<loggerTypes.ReadsLogger | false>;
type DestroyLoggerAsyncFn = () => void;

export const initFiReLogger: InitLoggerFn = options =>
  ReadsLogger.initLogger(options);

export const getFiReLogger: GetLoggerFn = () => ReadsLogger.getLogger();

export const getFiReLoggerAsync: GetLoggerAsyncFn = async (
  options?: RAFirebaseOptions
) => ReadsLogger.getRunningLoggerAsync(options);

export const destroyFiReLogger: DestroyLoggerAsyncFn =
  () => ReadsLogger.destroyLogger();

