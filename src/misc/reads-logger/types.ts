export interface RAFirebaseReadsLoggerStorageKeys {
  customReads: string;
  lastCustomReads: string;
  sessionReads: string;
  lastSessionReads: string;
}

export class RAFirebaseReadsLoggerError extends ReferenceError {
  constructor(message: string) {
    super(`RAFirebaseReadsLoggerError: ${message}`);
  }
}
