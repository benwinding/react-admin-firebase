import * as logger from '../../../reads-logger';

/**
 * getFirebaseReadsLogger
 *
 * Get singleton instance of FirebaseReadsLogger
 * @returns {Promise<FirebaseReadsLogger>}
 */
export const getFirebaseReadsLogger = async () => logger.getFiReLogger();
