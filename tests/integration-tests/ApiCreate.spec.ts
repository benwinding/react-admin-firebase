import { FirebaseClient } from "../../src/providers/database/FirebaseClient";
import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import {
  getDocsFromCollection,
  initFireWrapper,
  clearDb,
} from "./utils/test-helpers";

describe("ApiCreate", () => {
  let fire: IFirebaseWrapper;
  const testId = "test1";
  beforeAll(() => (fire = initFireWrapper(testId)));
  afterAll(async () => clearDb(testId));

  test("FirebaseClient create doc", async () => {
    const client = new FirebaseClient(fire, {
      logging: true,
      disableMeta: true,
    });
    await client.apiCreate("t1", {
      data: { name: "John" },
    });
    const users = await getDocsFromCollection(fire.db(), "t1");
    expect(users.length).toBe(1);
    const first = users[0] as any;
    expect(first).toBeTruthy();
    expect(first.name).toBe("John");
  }, 100000);
});
