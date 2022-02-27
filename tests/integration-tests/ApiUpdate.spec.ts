import { MakeMockClient } from "./utils/test-helpers";
import { Update } from "../../src/providers/commands";

describe("api methods", () => {
  test("FireClient update doc", async () => {
    const client = await MakeMockClient({ disableMeta: true });
    const id = "testsss123";
    const collName = "t2";
    const docRef = client.fireWrapper.dbGetCollection(collName).doc(id);
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

  test("FireClient update doc with transformToDb function provided", async () => {
    const client = await MakeMockClient({
      transformToDb: (resourceName, document, id) => {
        if (resourceName === "users") {
          return {
            ...document,
            firstName: document.firstName.toUpperCase(),
          };
        }
        return document;
      }
    });

    const id = "user123";
    const docRef = client.fireWrapper.dbGetCollection("users").doc(id);
    await docRef.set({ name: "Jim" });

    const previousUser = {
      id,
      firstName: "Bob",
      lastName: "Last",
    };
    const user = {
      ...previousUser,
      firstName: "John",
    };

    await Update(
      "users",
      {
        id: id,
        data: user,
        previousData: previousUser,
      },
      client
    );

    const res = await docRef.get();
    expect(res.exists).toBeTruthy();
    expect(res.data()).toMatchObject({
      firstName: "JOHN",
      lastName: "Last",
    });
  }, 100000);
});
