import ReadsLogger from "./ReadsLogger";
import { RAFirebaseOptions } from "../../providers/RAFirebaseOptions";

export const initFirebaseReadsLogger = (options: RAFirebaseOptions) => {
  ReadsLogger.initLogger(options);
};

export const getFirebaseReadsLogger = () => ReadsLogger.getLogger();

export default ReadsLogger;
