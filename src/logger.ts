// UTILS

export function log(description: string, obj?: {}) {
  if (ISDEBUG) {
    console.log(description, obj);
  }
}

// tslint:disable-next-line: no-var-keyword
var ISDEBUG = false;

export function EnableLogging() {
  ISDEBUG = true;
}