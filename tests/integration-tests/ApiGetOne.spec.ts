import { MakeMockClient } from "./utils/test-helpers";
import { GetOne } from "../../src/providers/queries";
import { REF_INDENTIFIER } from "../../src/misc";

describe("api methods", () => {
  test("FireClient apiGetOne", async () => {
    const client = await MakeMockClient();
    const docIds = ["test123", "test22222", "asdads"];
    const collName = "list-mes";
    const collection = client.fireWrapper.dbGetCollection(collName);
    await Promise.all(
      docIds.map((id) => collection.doc(id).set({ title: "ee" }))
    );
    type D = { title: string; id: string };
    const result = await GetOne<D>(collName, { id: "test22222" }, client);
    expect(result.data).toBeTruthy();
    expect(result.data.title).toBe("ee");
    expect(result.data.id).toBe("test22222");
  }, 100000);

  test("FireClient apiGetOne, with nested Dates", async () => {
    const client = await MakeMockClient();
    const collName = "list-mes";
    const docId = "1234";
    const collection = client.fireWrapper.dbGetCollection(collName);
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

    const result = await GetOne(
      collName,
      {
        id: docId,
      },
      client
    );
    const data = result.data;
    expect(data).toBeTruthy();
    expect(data.a).toBeInstanceOf(Date);
    expect(data.b.b1).toBeInstanceOf(Date);
    expect(data.b.c.c1).toBeInstanceOf(Date);
  }, 100000);

  test("FireClient apiGetOne, with refdocument", async () => {
    const client = await MakeMockClient();
    const collName = "get-one";
    const docId = "12345";
    const collection = client.fireWrapper.db().collection(collName);
    const refId = '22222';
    const refFullPath = 'ascasc/' + refId;
    const testData = {
      myrefdoc: client.fireWrapper.db().doc(refFullPath),
    };
    await collection.doc(docId).set(testData);

    const result = await GetOne(collName, { id: docId }, client);
    const data = result.data as any;
    expect(data).toBeTruthy();
    expect(data['myrefdoc']).toBe(refId);
    expect(data[`${REF_INDENTIFIER}myrefdoc`]).toBe(refFullPath);
  }, 100000);
});
