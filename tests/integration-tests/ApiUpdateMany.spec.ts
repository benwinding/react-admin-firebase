import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import { initFireWrapper, clearDb } from "./utils/test-helpers";
import { FirebaseClient } from "../../src/providers/database/FirebaseClient";

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "testupdatemany";
  beforeEach(
    () =>
      (fire = initFireWrapper(testId, { softDelete: true, disableMeta: true }))
  );
  afterEach(async () => clearDb(testId));

  test("FirebaseClient updatemany doc", async () => {
    const docIds = ["test123", "test22222", "asdads"];
    const collName = "updatec";
    const collection = fire.db().collection(collName);
    await Promise.all(
      docIds.map((id) => collection.doc(id).set({ title: "ee" }))
    );

    const client = new FirebaseClient(fire, fire.options);
    await client.apiUpdateMany(collName, {
      ids: docIds,
      data: {
        title: 'blue'
      } as any
    });
    const res = await collection.get();
    expect(res.docs.length).toBe(3);
    expect(res.docs[0].get('title')).toBe('blue')
    expect(res.docs[1].get('title')).toBe('blue')
    expect(res.docs[2].get('title')).toBe('blue')
  }, 100000);
});
