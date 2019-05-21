// UTILS

export function log(description: string, obj?: {}) {
  if (ISDEBUG) {
    console.log(description, obj);
  }
}

var ISDEBUG = false;

export function EnableLogging() {
  ISDEBUG = true;
}