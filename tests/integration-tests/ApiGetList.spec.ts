import { addDoc, doc, query, setDoc, where } from 'firebase/firestore';
import { FireStoreCollectionRef } from '../../src/misc/firebase-models';
import { GetList } from '../../src/providers/queries';
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

    const result = await GetList(
      collName,
      {
        sort: {
          field: 'title',
          order: 'asc',
        },
        filter: {},
        pagination: {
          page: 1,
          perPage: 10,
        },
      },
      client
    );
    expect(result.data.length).toBe(3);
  }, 100000);

  test('FireClient list docs with boolean filter', async () => {
    const client = await MakeMockClient();
    const testDocs = [
      {
        title: 'A',
        isEnabled: false,
      },
      {
        title: 'B',
        isEnabled: true,
      },
      {
        title: 'C',
        isEnabled: false,
      },
    ];
    const collName = 'list-filtered';
    const collection = client.fireWrapper.dbGetCollection(collName);
    await Promise.all(testDocs.map((document) => addDoc(collection, document)));

    const result = await GetList(
      collName,
      {
        sort: {
          field: 'title',
          order: 'asc',
        },
        pagination: {
          page: 1,
          perPage: 10,
        },
        filter: {
          isEnabled: false,
        },
      },
      client
    );
    expect(result.data.length).toBe(2);
  }, 100000);

  test('FireClient list docs with dotpath sort', async () => {
    const client = await MakeMockClient();
    const testDocs = [
      {
        obj: {
          title: 'A',
        },
        isEnabled: false,
      },
      {
        obj: {
          title: 'C',
        },
        isEnabled: false,
      },
      {
        obj: {
          title: 'B',
        },
        isEnabled: true,
      },
    ];
    const collName = 'list-filtered';
    const collection = client.fireWrapper.dbGetCollection(collName);
    await Promise.all(testDocs.map((document) => addDoc(collection, document)));

    const result = await GetList(
      collName,
      {
        filter: {},
        pagination: {
          page: 1,
          perPage: 10,
        },
        sort: {
          field: 'obj.title',
          order: 'ASC',
        },
      },
      client
    );
    const second = result.data[1];
    expect(second).toBeTruthy();
    expect(second.obj.title).toBe('B');
  }, 100000);

  test('FireClient with filter gte', async () => {
    const client = await MakeMockClient();
    const testDocs = [
      {
        title: 'A',
        obj: { volume: 100 },
      },
      {
        title: 'B',
        obj: { volume: 101 },
      },
      {
        title: 'C',
        obj: { volume: 99 },
      },
    ];
    const collName = 'list-filtered';
    const collection = client.fireWrapper.dbGetCollection(collName);
    await Promise.all(testDocs.map((document) => addDoc(collection, document)));

    const result = await GetList(
      collName,
      {
        filter: {
          collectionQuery: (c: FireStoreCollectionRef) =>
            query(c, where('obj.volume', '>=', 100)),
        },
        pagination: {
          page: 1,
          perPage: 10,
        },
        sort: {
          field: 'obj.volume',
          order: 'ASC',
        },
      },
      client
    );
    const third = result.data.length;
    expect(third).toBe(2);
  }, 100000);
});
