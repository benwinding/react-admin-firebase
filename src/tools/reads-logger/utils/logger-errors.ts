export class FiReLoggerInternalError extends Error {
  constructor(message: string) {
    super(`FiReLoggerInternalError: ${message}`);
  }
}

export class FiReLoggerError extends Error {
  constructor(message: string) {
    super(`FiReLoggerError: ${message}`);
  }
}
