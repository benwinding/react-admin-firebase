import { addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { MakeMockClient } from './utils/test-helpers';

describe('ApiRootRef', () => {
  test('rootref1', async () => {
    const client = await MakeMockClient({ rootRef: 'root-ref1/ok' });
    const rm = client.rm;
    const docRef = await addDoc(
      client.fireWrapper.dbGetCollection('root-ref1/ok/t1'),
      { test: '' }
    );
    const r = await rm.TryGetResourcePromise('t1');
    const snap = await getDocs(r.collection);
    await deleteDoc(docRef);
    expect(snap.docs.length).toBe(1);
  }, 10000);

  test('rootreffunction1', async () => {
    const client = await MakeMockClient({ rootRef: 'root-ref-function1/ok' });
    const rm = client.rm;
    const docRef = await addDoc(
      client.fireWrapper.dbGetCollection('root-ref-function1/ok/t1'),
      { test: '' }
    );
    const r = await rm.TryGetResourcePromise('t1');
    const snap = await getDocs(r.collection);
    await deleteDoc(docRef);
    expect(snap.docs.length).toBe(1);
  }, 10000);
});
