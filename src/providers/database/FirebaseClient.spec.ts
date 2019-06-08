import { FirebaseClient } from "./FirebaseClient";
import { FirebaseFactory } from "./firebase/FirebaseFactory";

test('test-list', async () => {
  const firebaseMock = FirebaseFactory.CreateMock();
  const client = new FirebaseClient(firebaseMock, {});
  await client.apiCreate('users', {
    data: { name: 'John' }
  });
  const result = await client.apiGetList('users', {
    pagination: {
      page: 0,
      perPage: 100,
    }
  });
  expect(result.data).toBe('hashs');
});

