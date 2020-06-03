import * as functions from './core/functions';
import { loggerTypes } from './utils/logger-helpers';

export { default as FirebaseReadsLogger } from './core/ReadsLogger';
export type FiReLogger = loggerTypes.ReadsLogger;
export default functions;
