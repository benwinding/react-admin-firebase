import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Update } from '../../src/providers/commands';
import { MakeMockClient } from './utils/test-helpers';

describe('api methods', () => {
  test('FireClient update doc', async () => {
    const client = await MakeMockClient({ disableMeta: true });
    const id = 'testsss123';
    const collName = 't2';
    const docRef = doc(client.fireWrapper.dbGetCollection(collName), id);
    await setDoc(docRef, { name: 'Jim' });

    await Update(
      collName,
      {
        id: id,
        data: { id: id, title: 'asd' },
        previousData: { id: id, name: 'Jim' },
      },
      client
    );

    const res = await getDoc(docRef);
    expect(res.exists).toBeTruthy();
    expect(res.get('title')).toBe('asd');
  }, 100000);

  // tslint:disable-next-line:max-line-length
  test('FireClient update doc with transformToDb function provided', async () => {
    const client = await MakeMockClient({
      transformToDb: (resourceName, document) => {
        if (resourceName === 'users') {
          return {
            ...document,
            firstName: document.firstName.toUpperCase(),
          };
        }
        return document;
      },
    });

    const id = 'user123';
    const docRef = doc(client.fireWrapper.dbGetCollection('users'), id);
    await setDoc(docRef, { name: 'Jim' });

    const previousUser = {
      id,
      firstName: 'Bob',
      lastName: 'Last',
    };
    const user = {
      ...previousUser,
      firstName: 'John',
    };

    await Update(
      'users',
      {
        id: id,
        data: user,
        previousData: previousUser,
      },
      client
    );

    const res = await getDoc(docRef);
    expect(res.exists).toBeTruthy();
    expect(res.data()).toMatchObject({
      firstName: 'JOHN',
      lastName: 'Last',
    });
  }, 100000);
});
