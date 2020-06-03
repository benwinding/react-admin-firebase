import { DataProvider } from './providers/DataProvider';
import { AuthProvider } from './providers/AuthProvider';
import { RAFirebaseOptions } from './providers/options';
import { functions, hooks, FiReLogger } from './logger';

export {
  DataProvider as FirebaseDataProvider,
  AuthProvider as FirebaseAuthProvider,
  RAFirebaseOptions as RAFirebaseOptions,
  functions as loggerFunctions,
  hooks as loggerHooks,
  FiReLogger as LoggerModel
};
