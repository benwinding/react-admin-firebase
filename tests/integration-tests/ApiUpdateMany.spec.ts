import { doc, getDocs, setDoc } from 'firebase/firestore';
import { UpdateMany } from '../../src/providers/commands';
import { MakeMockClient } from './utils/test-helpers';

describe('api methods', () => {
  test('FireClient updatemany doc', async () => {
    const client = await MakeMockClient({
      softDelete: true,
      disableMeta: true,
    });
    const docIds = ['test123', 'test22222', 'asdads'];
    const collName = 'updatec';
    const collection = client.fireWrapper.dbGetCollection(collName);
    await Promise.all(
      docIds.map((id) => setDoc(doc(collection, id), { title: 'ee' }))
    );

    await UpdateMany(
      collName,
      { ids: docIds, data: { title: 'blue' } },
      client
    );
    const res = await getDocs(collection);
    expect(res.docs.length).toBe(3);
    expect(res.docs[0].get('title')).toBe('blue');
    expect(res.docs[1].get('title')).toBe('blue');
    expect(res.docs[2].get('title')).toBe('blue');
  }, 100000);

  // tslint:disable-next-line:max-line-length
  test('FireClient updatemany doc with transformToDb function provided', async () => {
    const collectionName = 'updatec';

    const client = await MakeMockClient({
      transformToDb: (resourceName, document, id) => {
        if (resourceName === collectionName) {
          return {
            ...document,
            title: document.title.toUpperCase(),
          };
        }
        return document;
      },
    });

    const docIds = ['test123', 'test22222', 'asdads'];
    const collection = client.fireWrapper.dbGetCollection(collectionName);

    const originalDoc = {
      title: 'red',
      body: 'Hello world...',
    };
    const updatedDoc = {
      title: 'blue',
      body: 'OK...',
    };

    await Promise.all(
      docIds.map((id) => setDoc(doc(collection, id), originalDoc))
    );

    await UpdateMany(collectionName, { ids: docIds, data: updatedDoc }, client);

    const res = await getDocs(collection);
    expect(res.docs.length).toBe(3);
    expect(res.docs[0].get('title')).toBe('BLUE');
    expect(res.docs[1].get('title')).toBe('BLUE');
    expect(res.docs[2].get('title')).toBe('BLUE');
  }, 100000);
});
