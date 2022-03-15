import { translateDocToFirestore } from "../src/misc";

function parseDocGetAllUploads(doc: any) {
  return translateDocToFirestore(doc).uploads;
}

describe("file-parser tests", () => {
  test("simple single file", () => {
    const doc = {
      name: "Some guy",
      file: makeFile(),
    };
    const uploads = parseDocGetAllUploads(doc);
    expect(uploads.length).toBe(1);
    expect(uploads[0].fieldDotsPath).toBe("file");
    expect(doc.file.rawFile).toBeFalsy();
  });

  test("simple files in array", () => {
    const doc = {
      name: "Some guy",
      files: [makeFile(), makeFile()],
    };
    const uploads = parseDocGetAllUploads(doc);
    expect(uploads.length).toBe(2);
    expect(uploads[0].fieldDotsPath).toBe("files.0");
    expect(doc.files[0].rawFile).toBeFalsy();
  });

  test("simple files in array objects", () => {
    const doc = {
      name: "Some guy",
      items: [
        {
          name: "albert",
          image: makeFile(),
        },
        {
          name: "franklin",
          image: makeFile(),
        },
      ],
    };
    const uploads = parseDocGetAllUploads(doc);
    expect(uploads.length).toBe(2);
    expect(uploads[0].fieldDotsPath).toBe("items.0.image");
    expect(uploads[0].fieldSlashesPath).toBe("items/0/image");
    expect(doc.items[0].image.rawFile).toBeFalsy();
  });
});

function makeFile() {
  return new MockFile();
}

class MockFile {
  rawFile = "File binary goes here";
  src = "somethign";
}
