import { getDocsFromCollection, MakeMockClient } from "./utils/test-helpers";
import { Create } from "../../src/providers/commands";

describe("ApiCreate", () => {
  test("FireClient create doc", async () => {
    const client = MakeMockClient({
      logging: true,
      disableMeta: true,
    });
    await Create("t1", { data: { name: "John" } }, client);
    const users = await getDocsFromCollection(client.db(), "t1");
    expect(users.length).toBe(1);
    const first = users[0] as any;
    expect(first).toBeTruthy();
    expect(first.name).toBe("John");
  }, 100000);
});
