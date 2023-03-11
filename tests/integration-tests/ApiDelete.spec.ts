import { doc, setDoc } from 'firebase/firestore';
import { Delete } from '../../src/providers/commands';
import { getDocsFromCollection, MakeMockClient } from './utils/test-helpers';

describe('api methods', () => {
  test('FireClient delete doc', async () => {
    const client = await MakeMockClient();

    const docId = 'test123';
    const docObj = { id: docId, name: 'Jim' };
    await setDoc(doc(client.fireWrapper.dbGetCollection('t2'), docId), docObj);

    await Delete(
      't2',
      {
        id: docId,
        previousData: docObj,
      },
      client
    );

    const users = await getDocsFromCollection(client.fireWrapper.db(), 't2');
    expect(users.length).toBe(0);
  }, 100000);
});
