type LogFn = (...args: any) => void;

export const LogNoOp: LogFn = (...args: any) => null;

export class LoggerBase {
  constructor(private title: string, private cacheEnabledKey: string) {}

  private isEnabled() {
    return !!localStorage.getItem(this.cacheEnabledKey);
  }

  SetEnabled(isEnabled: boolean) {
    if (isEnabled) {
      localStorage.setItem(this.cacheEnabledKey, 'true');
    } else {
      localStorage.removeItem(this.cacheEnabledKey);
    }
  }

  public get log() {
    if (!this.isEnabled()) {
      return LogNoOp;
    }
    const boundLogFn: (...args: any) => void = console.log.bind(
      console,
      this.title
    );
    return boundLogFn;
  }

  public get warn() {
    if (!this.isEnabled()) {
      return LogNoOp;
    }
    const boundLogFn: (...args: any) => void = console.warn.bind(
      console,
      this.title
    );
    return boundLogFn;
  }

  public get error() {
    if (!this.isEnabled()) {
      return LogNoOp;
    }
    const boundLogFn: (...args: any) => void = console.error.bind(
      console,
      this.title
    );
    return boundLogFn;
  }
}
