import { doc, setDoc } from 'firebase/firestore';
import { FireStore } from '../../src/misc/firebase-models';
import { GetMany } from '../../src/providers/queries';
import { MakeMockClient } from './utils/test-helpers';

describe('api methods', () => {
  test('FireClient list docs', async () => {
    const client = await MakeMockClient();
    const docIds = ['test123', 'test22222', 'asdads'];
    const collName = 'list-mes';
    const collection = client.fireWrapper.dbGetCollection(collName);
    await Promise.all(
      docIds.map((id) => setDoc(doc(collection, id), { title: 'ee' }))
    );

    const result = await GetMany(
      collName,
      {
        ids: docIds.slice(1),
      },
      client
    );
    expect(result.data.length).toBe(2);
    expect(result.data[0]['id']).toBe('test22222');
    expect(result.data[1]['id']).toBe('asdads');
  }, 100000);

  test('FirebaseClient list docs from refs', async () => {
    const client = await MakeMockClient();
    const docs = [
      {
        id: '11',
        name: 'Albert',
      },
      {
        id: '22',
        name: 'Stanburg',
      },
    ];
    const collName = 'list-mes2';
    const db = client.fireWrapper.db();
    await Promise.all(
      docs.map((user) =>
        setDoc(doc(db as FireStore, collName + '/' + user.id), {
          name: user.name,
        })
      )
    );

    const result = await GetMany(
      collName,
      {
        ids: ['11', '22'],
      },
      client
    );
    expect(result.data.length).toBe(2);
    expect(result.data[0]['id']).toBe('11');
    expect(result.data[1]['id']).toBe('22');
  }, 100000);
});
