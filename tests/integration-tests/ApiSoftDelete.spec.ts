import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DeleteSoft } from '../../src/providers/commands';
import { MakeMockClient } from './utils/test-helpers';

describe('api methods', () => {
  test('FireClient delete doc', async () => {
    const client = await MakeMockClient({
      softDelete: true,
      disableMeta: true,
    });
    const id = 'test123';
    const collName = 't2';
    const docRef = doc(client.fireWrapper.dbGetCollection(collName), id);
    const docObj = { id, name: 'Jim' };
    await setDoc(docRef, docObj);

    await DeleteSoft(collName, { id: id, previousData: docObj }, client);

    const res = await getDoc(docRef);
    expect(res.exists).toBeTruthy();
    expect(res.get('deleted')).toBeTruthy();
  }, 100000);
});
