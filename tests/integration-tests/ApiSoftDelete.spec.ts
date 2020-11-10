import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import { initFireWrapper, clearDb } from "./utils/test-helpers";
import { FirebaseClient } from "../../src/providers/database/FirebaseClient";

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "testsoft1";
  beforeEach(
    () =>
      (fire = initFireWrapper(testId, { softDelete: true, disableMeta: true }))
  );
  afterEach(async () => clearDb(testId));

  test("FirebaseClient delete doc", async () => {
    const id = "test123";
    const collName = "t2";
    const docRef = fire.db().collection(collName).doc(id);
    const docObj = { id, name: "Jim" }
    await docRef.set(docObj);

    const client = new FirebaseClient(fire, fire.options);
    await client.apiSoftDelete(collName, {
      id: id,
      previousData: docObj,
    });

    const res = await docRef.get();
    expect(res.exists).toBeTruthy();
    expect(res.get("deleted")).toBeTruthy();
  }, 100000);
});
