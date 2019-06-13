import { FirebaseClient } from "../src/providers/database/FirebaseClient";
import { FirebaseStub } from "../src/providers/database/firebase/Firebase.stub";

import { config } from './TEST.config';
const fire = new FirebaseStub();
fire.init(config);

test('test-list', async () => {
  const client = new FirebaseClient(fire, {});
  await client.apiCreate('users', {
    data: { name: 'John' }
  });

  const users = await client.apiGetList('users', {
    pagination: {
      page: 0,
      perPage: 100,
    }
  });

  expect(users.data.length).toBe(1);
  const first = users.data[0] as any;
  expect(first).toBeTruthy();
  expect(first.name).toBe('John');
  // expect(!!result.data).toBe(true);
}, 300000);
