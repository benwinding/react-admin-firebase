import { MakeMockClient } from "./utils/test-helpers";
import { Update } from "../../src/providers/commands";

describe("api methods", () => {
  test("FireClient update doc", async () => {
    const client = MakeMockClient({ disableMeta: true });
    const id = "testsss123";
    const collName = "t2";
    const docRef = client.db().collection(collName).doc(id);
    await docRef.set({ name: "Jim" });

    await Update(
      collName,
      {
        id: id,
        data: { id: id, title: "asd" },
        previousData: { id: id, name: "Jim" },
      },
      client
    );

    const res = await docRef.get();
    expect(res.exists).toBeTruthy();
    expect(res.get("title")).toBe("asd");
  }, 100000);
});
