import { MakeMockClient } from "./utils/test-helpers";
import { DeleteManySoft } from "../../src/providers/commands";

describe("api methods", () => {
  test("FireClient delete doc", async () => {
    const client = MakeMockClient({ softDelete: true, disableMeta: true });
    const docIds = ["test123", "test22222", "asdads"];
    const collName = "deleteables";
    const collection = client.db().collection(collName);
    await Promise.all(
      docIds.map((id) => collection.doc(id).set({ title: "ee" }))
    );

    await DeleteManySoft(collName, { ids: docIds.slice(1) }, client);
    const res = await collection.get();
    expect(res.docs.length).toBe(3);
  }, 100000);
});
