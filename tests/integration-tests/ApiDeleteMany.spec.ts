import { MakeMockClient } from "./utils/test-helpers";
import { DeleteMany } from "../../src/providers/commands";

describe("api methods", () => {
  test("FireClient delete doc", async () => {
    const client = await MakeMockClient();
    const docIds = ["test123", "test22222", "asdads"];
    const collName = "deleteables";
    const collection = client.fireWrapper.dbGetCollection(collName);
    await Promise.all(
      docIds.map((id) => collection.doc(id).set({ title: "ee" }))
    );

    await DeleteMany(collName, { ids: docIds.slice(1) }, client);
    const res = await collection.get();
    expect(res.docs.length).toBe(1);
  }, 100000);
});
