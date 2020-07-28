import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { useHistory } from 'react-router-dom';
import { effectUtils } from './utils';

export const usePageReadsLogger = () => {
  const [pageReads, setPageReads] = useState(0);
  const [lastPageReads, setLastPageReads] = useState(0);
  const history = useHistory();

  useEffect(() => {
    let pageSubscription: Subscription = null,
      lastPageSubscription: Subscription = null,
      historyUnsubscribe = null;

    effectUtils.init(
      'page',
      setPageReads,
      setLastPageReads,
      logger => (historyUnsubscribe = history.listen(
        () => logger.resetPageReads()
      ))
    ).then(([pageSub, lastPageSub]) => {
      pageSubscription = pageSub;
      lastPageSubscription = lastPageSub;
    });

    return () => effectUtils.clean(
      pageSubscription,
      lastPageSubscription,
      () => {
        if (historyUnsubscribe) {
          historyUnsubscribe();
        }
      }
    );
  }, [setPageReads, setLastPageReads, history]);

  return [pageReads, lastPageReads];
};
