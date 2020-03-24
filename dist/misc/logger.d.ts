import { RAFirebaseOptions } from "providers/RAFirebaseOptions";
export declare class SimpleLogger {
    private title;
    isEnabled(): boolean;
    readonly log: (...any: any[]) => void;
    readonly warn: (...any: any[]) => void;
    readonly error: (...any: any[]) => void;
}
export declare function CheckLogging(config: {}, options: RAFirebaseOptions): void;
export declare const log: (...any: any[]) => void;
export declare const logWarn: (...any: any[]) => void;
export declare const logError: (...any: any[]) => void;
