import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import { initFireWrapper, clearDb } from "./utils/test-helpers";
import { FirebaseClient } from "../../src/providers/database/FirebaseClient";

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "test-deletemany";
  beforeEach(() => (fire = initFireWrapper(testId)));
  afterEach(async () => clearDb(testId));

  test("FirebaseClient delete doc", async () => {
    const docIds = ["test123", "test22222", "asdads"];
    const collName = "deleteables";
    const collection = fire.db().collection(collName);
    await Promise.all(
      docIds.map((id) => collection.doc(id).set({ title: "ee" }))
    );

    const client = new FirebaseClient(fire, {});
    await client.apiDeleteMany(collName, {
      ids: docIds.slice(1),
    });
    const res = await collection.get();
    expect(res.docs.length).toBe(1);
  }, 100000);
});
