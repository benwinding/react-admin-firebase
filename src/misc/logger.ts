// UTILS

export function log(description: string, obj?: {}) {
  if (ISDEBUG) {
    console.log("react-admin-firebase: ", description, obj);
  }
}

export function logError(description: string, obj?: {}) {
  if (ISDEBUG) {
    console.error("react-admin-firebase: ", description, obj);
  }
}

// tslint:disable-next-line: no-var-keyword
var ISDEBUG = false;

export function EnableLogging() {
  ISDEBUG = true;
}