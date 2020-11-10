import { IFirebaseWrapper } from "../../src/providers/database/firebase/IFirebaseWrapper";
import { initFireWrapper, clearDb } from "./utils/test-helpers";
import { FirebaseClient } from "../../src/providers/database/FirebaseClient";

describe("api methods", () => {
  let fire: IFirebaseWrapper;
  const testId = "test-getlist";
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
    const result = await client.apiGetList(collName, {
      sort: {
        field: "title",
        order: "asc",
      },
      filter: {},
      pagination: {
        page: 1,
        perPage: 10,
      },
    });
    expect(result.data.length).toBe(3);
  }, 100000);

  test("FirebaseClient list docs with boolean filter", async () => {
    const testDocs = [
      {
        title: "A",
        isEnabled: false,
      },
      {
        title: "B",
        isEnabled: true,
      },
      {
        title: "C",
        isEnabled: false,
      },
    ];
    const collName = "list-filtered";
    const collection = fire.db().collection(collName);
    await Promise.all(testDocs.map((doc) => collection.add(doc)));

    const client = new FirebaseClient(fire, {});
    const result = await client.apiGetList(collName, {
      sort: {
        field: "title",
        order: "asc",
      },
      pagination: {
        page: 1,
        perPage: 10,
      },
      filter: {
        isEnabled: false,
      },
    });
    expect(result.data.length).toBe(2);
  }, 100000);

  test("FirebaseClient list docs with dotpath sort", async () => {
    const testDocs = [
      {
        obj: {
          title: "A",
        },
        isEnabled: false,
      },
      {
        obj: {
          title: "C",
        },
        isEnabled: false,
      },
      {
        obj: {
          title: "B",
        },
        isEnabled: true,
      },
    ];
    const collName = "list-filtered";
    const collection = fire.db().collection(collName);
    await Promise.all(testDocs.map((doc) => collection.add(doc)));

    const client = new FirebaseClient(fire, {});
    const result = await client.apiGetList(collName, {
      filter: {},
      pagination: {
        page: 1,
        perPage: 10,
      },
      sort: {
        field: "obj.title",
        order: "ASC",
      },
    });
    const second = result.data[1] as any;
    expect(second).toBeTruthy();
    expect(second.obj.title).toBe("B");
  }, 100000);
});
