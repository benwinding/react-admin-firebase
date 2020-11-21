import { MakeMockClient } from "./utils/test-helpers";
import { DeleteSoft } from "../../src/providers/commands";

describe("api methods", () => {
  test("FireClient delete doc", async () => {
    const client = MakeMockClient({ softDelete: true, disableMeta: true });
    const id = "test123";
    const collName = "t2";
    const docRef = client.db().collection(collName).doc(id);
    const docObj = { id, name: "Jim" };
    await docRef.set(docObj);

    await DeleteSoft(collName, { id: id, previousData: docObj }, client);

    const res = await docRef.get();
    expect(res.exists).toBeTruthy();
    expect(res.get("deleted")).toBeTruthy();
  }, 100000);
});
