import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import { initFireWrapper, clearDb } from "./utils/test-helpers";
import { FirebaseClient } from "../../src/providers/database/FirebaseClient";

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "test-apigetone";
  beforeEach(() => (fire = initFireWrapper(testId)));
  afterEach(async () => clearDb(testId));

  test("FirebaseClient apiGetOne", async () => {
    const docIds = ["test123", "test22222", "asdads"];
    const collName = "list-mes";
    const collection = fire.db().collection(collName);
    await Promise.all(
      docIds.map((id) => collection.doc(id).set({ title: "ee" }))
    );

    const client = new FirebaseClient(fire, {});
    const result = await client.apiGetOne(collName, {
      id: "test22222",
    });
    expect(result.data).toBeTruthy();
    expect(result.data["title"]).toBe("ee");
    expect(result.data["id"]).toBe("test22222");
  }, 100000);

  test("FirebaseClient apiGetOne, with nested Dates", async () => {
    const collName = "list-mes";
    const docId = "1234";
    const collection = fire.db().collection(collName);
    const testDocNestedDates = {
      a: new Date("1999"),
      b: {
        b1: new Date("2006"),
        c: {
          c1: new Date("2006"),
        },
      },
    };
    await collection.doc(docId).set(testDocNestedDates);

    const client = new FirebaseClient(fire, {});
    const result = await client.apiGetOne(collName, {
      id: docId,
    });
    const data = result.data as any;
    expect(data).toBeTruthy();
    expect(data.a).toBeInstanceOf(Date);
    expect(data.b.b1).toBeInstanceOf(Date);
    expect(data.b.c.c1).toBeInstanceOf(Date);
  }, 100000);
});
