import { RAFirebaseOptions } from 'providers/options';

type LogFn = (...args) => void;

const disabledLogFn: LogFn = () => null;

const isEnabled: () => boolean =
  () => !!localStorage.getItem('LOGGING_ENABLED');

const logTitle = '🔥r-a-f: ';

const getLogFn: (level: keyof Console) => LogFn = level =>
  isEnabled() ? console[level].bind(console, logTitle) : disabledLogFn;

export const log = getLogFn('log');
export const logWarn = getLogFn('warn');
export const logError = getLogFn('error');

export function checkLogging(config: {}, options: RAFirebaseOptions) {
  const logSignalDeprecated = config && config['debug'];
  const logSignal = options.logging;
  if (logSignalDeprecated || logSignal) {
    localStorage.setItem('LOGGING_ENABLED', 'true');
  } else {
    localStorage.removeItem('LOGGING_ENABLED');
  }
}
