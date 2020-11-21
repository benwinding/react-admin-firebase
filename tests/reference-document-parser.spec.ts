import { translateDocToFirestore } from "../src/misc";

describe("reference-document-parser.spec", () => {
  test("test document references", () => {
    const docToCreate = {
      name: "Some guy",
      items: [
        {
          user: "dan",
          friend: "ref",
          ___REF_FULLPATH_friend: "my/ref",
        },
      ],
    };
    const result = translateDocToFirestore(docToCreate);
    expect(result.refdocs.length).toBe(1);
    expect(result.refdocs[0].fieldDotsPath).toBe(
      "items.0.___REF_FULLPATH_friend"
    );
    expect(result.refdocs[0].refPath).toBe("my/ref");
  });
});
