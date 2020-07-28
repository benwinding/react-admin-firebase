import { log, logError, logWarn } from '../../../misc';

const readsLoggerConsoleLog = (...args) =>
  log('FirebaseReadsLoggerLog', ...args);
const readsLoggerConsoleWarn = (...args) =>
  logWarn('FirebaseReadsLoggerWarn', ...args);
const readsLoggerConsoleError = (...args) =>
  logError('FirebaseReadsLoggerError', ...args);

export const readsLoggerConsole: Partial<Console> = {
  log: readsLoggerConsoleLog,
  warn: readsLoggerConsoleWarn,
  error: readsLoggerConsoleError
};
