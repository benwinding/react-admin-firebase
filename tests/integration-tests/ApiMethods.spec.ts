import { FirebaseClient } from "../../src/providers/database/FirebaseClient";
import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import {
  getDocsFromCollection,
  createDoc,
  initFireWrapper,
  clearDb,
} from "./utils/test-helpers";

describe("api methods", () => {
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

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "test2";
  beforeAll(() => (fire = initFireWrapper(testId)));
  afterAll(async () => clearDb(testId));

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

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "test3";
  beforeAll(() => (fire = initFireWrapper(testId)));
  afterAll(async () => clearDb(testId));

  test("FirebaseClient delete doc", async () => {
    const docName = "test123";
    await createDoc(fire.db(), "t2", docName, { name: "Jim" });

    const client = new FirebaseClient(fire, {});
    await client.apiDelete("t2", {
      id: docName,
      previousData: {},
    });

    const users = await getDocsFromCollection(fire.db(), "t2");
    expect(users.length).toBe(0);
  }, 100000);
});

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "test4";
  beforeAll(() => (fire = initFireWrapper(testId)));
  afterAll(async () => clearDb(testId));

  test("FirebaseClient delete doc", async () => {
    const docName = "test123";
    await createDoc(fire.db(), "t2", docName, { name: "Jim" });

    const client = new FirebaseClient(fire, {});
    await client.apiDelete("t2", {
      id: docName,
      previousData: {},
    });

    const users = await getDocsFromCollection(fire.db(), "t2");
    expect(users.length).toBe(0);
  }, 100000);
});
