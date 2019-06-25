import { FirebaseClient } from "../src/providers/database/FirebaseClient";
import { deleteCollection, getDocsFromCollection, createDoc } from "./test-helpers";
import { FirebaseWrapperStub } from "./FirebaseWrapperStub";
import { IFirebaseWrapper } from "../src/providers/database/firebase/IFirebaseWrapper";

import { config } from './TEST.config';
const fire: IFirebaseWrapper = new FirebaseWrapperStub();
fire.init(config, {});
const db = fire.db();

test('t1 client create doc', async () => {
  const client = new FirebaseClient(fire, {});
  await client.apiCreate('t1', {
    data: { id: 'John' }
  });

  const users = await getDocsFromCollection(db, 't1');
  expect(users.length).toBe(1);
  const first = users[0] as any;
  expect(first).toBeTruthy();
  expect(first.name).toBe('John');
  await deleteCollection(db, 't1');
}, 100000);

test('t2 client delete doc', async () => {
  const docName = 'test123'
  await db.collection('t2').doc(docName).set({name: 'Jim'});

  const client = new FirebaseClient(fire, {});
  await client.apiDelete('t2', {
    'id': docName,
    previousData: {}
  });

  const users = await getDocsFromCollection(db, 't2');
  expect(users.length).toBe(0);
  await deleteCollection(db, 't2');
}, 100000);

test('t3 client delete doc', async () => {
  const docName = 'test123'
  await createDoc(db, 't2', docName, {name: 'Jim'});

  const client = new FirebaseClient(fire, {});
  await client.apiDelete('t2', {
    'id': docName,
    previousData: {}
  });

  const users = await getDocsFromCollection(db, 't2');
  expect(users.length).toBe(0);
  await deleteCollection(db, 't2');
}, 100000);
