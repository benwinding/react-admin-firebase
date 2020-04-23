import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import { initFireWrapper, clearDb } from "./utils/test-helpers";
import { FirebaseClient } from "../../src/providers/database/FirebaseClient";

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "testupdate1";
  beforeEach(() => (fire = initFireWrapper(testId, { disableMeta: true })));
  afterEach(async () => clearDb(testId));

  test("FirebaseClient update doc", async () => {
    const id = "test123";
    const collName = "t2";
    const docRef = fire.db().collection(collName).doc(id);
    await docRef.set({ name: "Jim" });

    const client = new FirebaseClient(fire, fire.options);
    await client.apiUpdate(collName, {
      id: id,
      data: { id: id, title: 'asd' } as any,
      previousData: { name: "Jim" },
    });

    const res = await docRef.get();
    expect(res.exists).toBeTruthy();
    expect(res.get('title')).toBe('asd');
  }, 100000);
});
