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
  test("FireClient create doc with custom meta", async () => {
    const client = MakeMockClient({
      logging: true,
      renameMetaFields: {
        updated_by: 'MY_CREATED_BY',
      },
    });
    await Create("t1", { data: { name: "John" } }, client);
    const users = await getDocsFromCollection(client.db(), "t1");
    expect(users.length).toBe(1);
    const first = users[0] as {};

    expect(first.hasOwnProperty('MY_CREATED_BY')).toBeTruthy();
  }, 100000);
  test("FireClient create doc with transformToDb function provided", async () => {
    const client = MakeMockClient({
      logging: true,
      transformToDb: (resourceName, document, id) => {
        if (resourceName === "users") {
          return {
            ...document,
            firstName: document.firstName.toUpperCase(),
            picture: document.picture.src || document.picture,
          };
        }
        return document;
      }
    });

    const newUser = { 
      firstName: "John",
      lastName: "Last",
      age: 20,
      picture: {
        src: "http://example.com/pic.png"
      },
    };

    await Create("users", { data: newUser }, client);
    const users = await getDocsFromCollection(client.db(), "users");

    expect(users.length).toBe(1);
    expect(users[0]).toMatchObject({
      firstName: "JOHN",
      lastName: "Last",
      age: 20,
      picture: "http://example.com/pic.png",
    });

  }, 100000);
});
