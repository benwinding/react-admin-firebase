import { BehaviorSubject, Observable } from 'rxjs';
import { GetLoggerAsyncOptions } from '../options';

export namespace loggerTypes {
  interface Counters<T> {
    pageReads: T;
    lastPageReads: T;
    customReads: T;
    lastCustomReads: T;
    sessionReads: T;
    lastSessionReads: T;
  }

  export type CounterSubjects = Counters<BehaviorSubject<number>>;
  export type CounterStreams = Counters<Observable<number>>;
  export type CounterEmitOptions = Counters<boolean>;

  export type ResetFn = () => void;
  export type IncrementFn = (newReads: number) => void;

  export interface ReadsLogger {
    pageReads: number;
    lastPageReads: number;
    resetPageReads: ResetFn;

    customReads: number;
    lastCustomReads: number;
    resetCustomReads: ResetFn;

    sessionReads: number;
    lastSessionReads: number;

    incrementAll: IncrementFn;
    counters$: CounterStreams;
  }

  export type GetLoggerAsyncFn = (retryCount: number) => Promise<ReadsLogger>;
}

export namespace loggerConstants {
  export const EMIT_OPTIONS_FROM_STORAGE: loggerTypes.CounterEmitOptions = {
    pageReads: false,
    lastPageReads: false,
    customReads: true,
    lastCustomReads: true,
    sessionReads: true,
    lastSessionReads: true
  };

  export const EMIT_OPTIONS_ALL: loggerTypes.CounterEmitOptions = {
    ...EMIT_OPTIONS_FROM_STORAGE,
    pageReads: true,
    lastPageReads: true
  };

  export const DEFAULT_GET_LOGGER_ASYNC_OPTIONS: GetLoggerAsyncOptions = {
    retryLimit: 5,
    retryTimeout: 2
  };
}

export namespace loggerStreamHelpers {
  type CreateSubjectsFn = () => loggerTypes.CounterSubjects;
  type GetStreamsFn = (subjects: loggerTypes.CounterSubjects) =>
    loggerTypes.CounterStreams;

  export const createSubjects: CreateSubjectsFn = () => ({
    pageReads: new BehaviorSubject(0),
    lastPageReads: new BehaviorSubject(0),
    customReads: new BehaviorSubject(0),
    lastCustomReads: new BehaviorSubject(0),
    sessionReads: new BehaviorSubject(0),
    lastSessionReads: new BehaviorSubject(0)
  });

  export const getStreams: GetStreamsFn = subjects => ({
    pageReads: subjects.pageReads.asObservable(),
    lastPageReads: subjects.lastPageReads.asObservable(),
    customReads: subjects.customReads.asObservable(),
    lastCustomReads: subjects.lastCustomReads.asObservable(),
    sessionReads: subjects.sessionReads.asObservable(),
    lastSessionReads: subjects.lastSessionReads.asObservable()
  });
}


