import { MakeMockClient } from "./utils/test-helpers";
import { UpdateMany } from "../../src/providers/commands";

describe("api methods", () => {
  test("FireClient updatemany doc", async () => {
    const client = MakeMockClient({ softDelete: true, disableMeta: true });
    const docIds = ["test123", "test22222", "asdads"];
    const collName = "updatec";
    const collection = client.db().collection(collName);
    await Promise.all(
      docIds.map((id) => collection.doc(id).set({ title: "ee" }))
    );

    await UpdateMany(
      collName,
      { ids: docIds, data: { title: "blue" } as any },
      client
    );
    const res = await collection.get();
    expect(res.docs.length).toBe(3);
    expect(res.docs[0].get("title")).toBe("blue");
    expect(res.docs[1].get("title")).toBe("blue");
    expect(res.docs[2].get("title")).toBe("blue");
  }, 100000);
});
