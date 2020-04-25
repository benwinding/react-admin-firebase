import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import {
  initFireWrapper,
  clearDb,
  getDocsFromCollection,
  createDoc,
} from "./utils/test-helpers";
import { FirebaseClient } from "../../src/providers/database/FirebaseClient";

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "test2";
  beforeEach(() => (fire = initFireWrapper(testId)));
  afterEach(async () => clearDb(testId));

  test("FirebaseClient delete doc", async () => {
    const docName = "test123";
    await fire.db().collection("t2").doc(docName).set({ name: "Jim" });

    const client = new FirebaseClient(fire, {});
    await client.apiDelete("t2", {
      id: docName,
      previousData: {},
    });

    const users = await getDocsFromCollection(fire.db(), "t2");
    expect(users.length).toBe(0);
  }, 100000);
});

