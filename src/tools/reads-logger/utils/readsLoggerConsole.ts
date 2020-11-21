import { log, logError, logWarn } from '../../../misc';

const readsLoggerConsoleLog = (...args: any) =>
  log('FirebaseReadsLoggerLog', ...args);
const readsLoggerConsoleWarn = (...args: any) =>
  logWarn('FirebaseReadsLoggerWarn', ...args);
const readsLoggerConsoleError = (...args: any) =>
  logError('FirebaseReadsLoggerError', ...args);

export const readsLoggerConsole: Pick<Console, 'log' | 'warn' | 'error'> = {
  log: readsLoggerConsoleLog,
  warn: readsLoggerConsoleWarn,
  error: readsLoggerConsoleError,
};
