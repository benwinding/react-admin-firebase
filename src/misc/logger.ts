import { RAFirebaseOptions } from "providers/RAFirebaseOptions";

// UTILS

export class SimpleLogger {
  private title = '🔥r-a-f: ';

  public get log() {
    if (ISDEBUG) {
      return (...any) => {};
    }
    const boundLogFn: (...any) => void = console.log.bind(
      console,
      this.title
    );
    return boundLogFn;
  }

  public get warn() {
    if (ISDEBUG) {
      return (...any) => {};
    }
    const boundLogFn: (...any) => void = console.warn.bind(
      console,
      this.title
    );
    return boundLogFn;
  }

  public get error() {
    if (ISDEBUG) {
      return (...any) => {};
    }
    const boundLogFn: (...any) => void = console.error.bind(
      console,
      this.title
    );
    return boundLogFn;
  }
}

// tslint:disable-next-line: no-var-keyword
var ISDEBUG = false;

export function CheckLogging(config: {}, options: RAFirebaseOptions) {
  if ((config && config['debug']) || options.logging) {
    ISDEBUG = true;
  }
}

const logger = new SimpleLogger()

export const log = logger.log;
export const logWarn = logger.warn;
export const logError = logger.error;
