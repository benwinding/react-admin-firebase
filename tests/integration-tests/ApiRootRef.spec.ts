import { ResourceManager } from '../../src/providers/database/ResourceManager';
import { deleteCollection, initFireWrapper } from './utils/test-helpers';

const fire = initFireWrapper();

test('rootref1', async () => {
  const rm = new ResourceManager(fire, {
    rootRef: 'root-ref1/ok'
  });
  await rm.TryGetResourcePromise('t1');

  await deleteCollection(fire.db(), 't1');
}, 10000);
