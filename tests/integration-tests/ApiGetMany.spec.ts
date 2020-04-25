import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import { initFireWrapper, clearDb } from "./utils/test-helpers";
import { FirebaseClient } from "../../src/providers/database/FirebaseClient";

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "test-listmany";
  beforeEach(() => (fire = initFireWrapper(testId)));
  afterEach(async () => clearDb(testId));

  test("FirebaseClient list docs", async () => {
    const docIds = ["test123", "test22222", "asdads"];
    const collName = "list-mes";
    const collection = fire.db().collection(collName);
    await Promise.all(
      docIds.map((id) => collection.doc(id).set({ title: "ee" }))
    );

    const client = new FirebaseClient(fire, {});
    const result = await client.apiGetMany(collName, {
      ids: docIds.slice(1),
    });
    expect(result.data.length).toBe(2);
    expect(result.data[0]['id']).toBe('test22222');
    expect(result.data[1]['id']).toBe('asdads');
  }, 100000);
});
