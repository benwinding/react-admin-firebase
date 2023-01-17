import { LoggerBase } from './logger-base';

const LOGGER_ENABLEDKEY = 'LOGGING_ENABLED';
export const logger = new LoggerBase('🔥raf:', LOGGER_ENABLEDKEY);

export const log = logger.log;
export const logError = logger.error;
export const logWarn = logger.warn;
