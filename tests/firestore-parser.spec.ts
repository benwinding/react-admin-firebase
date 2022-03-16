import {
  FromFirestoreResult, 
  recusivelyCheckObjectValue,
  translateDocFromFirestore,
} from "../src/misc";
import { FireStoreDocumentRef } from "../src/misc/firebase-models";
import { FireClient } from "../src/providers/database/FireClient";
import { MakeMockClient } from "./integration-tests/utils/test-helpers";

function blankResultObj(): FromFirestoreResult {
  return {
    parsedDoc: {},
    refdocs: []
  }
}
describe("timestamp-parser tests", () => {
  test("null doesn't break it", () => {
    const doc = null;
    translateDocFromFirestore(doc);
    expect(doc).toBe(null);
  });

  test("retains falsey", () => {
    const doc = { a: null };
    translateDocFromFirestore(doc);
    expect(doc.a).toBe(null);
  });

  test("retains number", () => {
    const doc = { a: 1 };
    translateDocFromFirestore(doc);
    expect(doc.a).toBe(1);
  });

  test("retains string", () => {
    const doc = { a: "1" };
    translateDocFromFirestore(doc);
    expect(doc.a).toBe("1");
  });

  test("retains object", () => {
    const doc = { a: { f: "1" } };
    translateDocFromFirestore(doc);
    expect(doc.a.f).toBe("1");
  });

  test("converts timestamp simple", () => {
    const doc = { a: makeTimestamp() };
    translateDocFromFirestore(doc);
    expect(doc.a).toBeInstanceOf(Date);
  });

  test("converts timestamp deep nested", () => {
    const doc = { a: { b: makeTimestamp(), c: { d: makeTimestamp() } } };
    translateDocFromFirestore(doc);
    expect(doc.a.b).toBeInstanceOf(Date);
    expect(doc.a.c.d).toBeInstanceOf(Date);
  });

  test("converts timestamp array", () => {
    const doc = { a: { c: [makeTimestamp(), makeTimestamp()] } };
    translateDocFromFirestore(doc);
    expect(doc.a.c[0]).toBeInstanceOf(Date);
    expect(doc.a.c[1]).toBeInstanceOf(Date);
  });

  test("converts timestamp array", () => {
    const doc = { a: { c: [{ d: makeTimestamp() }] } };
    translateDocFromFirestore(doc);
    expect(doc.a.c[0].d).toBeInstanceOf(Date);
  });

  test("retains falsey", () => {
    const doc = ["okay"];
    recusivelyCheckObjectValue(doc,  '', blankResultObj());
    expect(doc[0]).toBe("okay");
  });

  test("check converts document references", async () => {
    const client = await MakeMockClient();
    const doc = { ref: makeDocumentRef("something/here", client) } as any;
    const result = blankResultObj();
    recusivelyCheckObjectValue(doc, '', result);
    expect(result.refdocs.length).toBe(1);
    expect(doc.ref).toBe("here");
  });
});

function makeTimestamp() {
  return new MockTimeStamp();
}

function makeDocumentRef(path: string, client: FireClient): FireStoreDocumentRef | any {
  return client.fireWrapper.db().doc(path);
}

class MockTimeStamp {
  toDate() {
    return new Date();
  }
}
