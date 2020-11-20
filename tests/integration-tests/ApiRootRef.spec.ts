import { MakeMockClient } from "./utils/test-helpers";

describe("ApiRootRef", () => {
  test("rootref1", async () => {
    const client = MakeMockClient({ rootRef: "root-ref1/ok" });
    const rm = client.rm;
    const docRef = await client
      .db()
      .collection("root-ref1/ok/t1")
      .add({ test: "" });
    const r = await rm.TryGetResourcePromise("t1");
    const snap = await r.collection.get();
    await docRef.delete();
    expect(snap.docs.length).toBe(1);
  }, 10000);

  test("rootreffunction1", async () => {
    const client = MakeMockClient({ rootRef: "root-ref-function1/ok" });
    const rm = client.rm;
    const docRef = await client
      .db()
      .collection("root-ref-function1/ok/t1")
      .add({ test: "" });
    const r = await rm.TryGetResourcePromise("t1");
    const snap = await r.collection.get();
    await docRef.delete();
    expect(snap.docs.length).toBe(1);
  }, 10000);
});
