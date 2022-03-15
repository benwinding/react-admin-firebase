import { translateDocFromFirestore } from "../src/misc";

function parseAllDatesDoc(doc: any) {
  return translateDocFromFirestore(doc).parsedDoc;
}

describe("timestamp-parser tests", () => {
  test("null doesn't break it", () => {
    const doc = null;
    expect(() => parseAllDatesDoc(doc)).not.toThrowError();
  });

  test("retains falsey", () => {
    const doc = { a: null };
    const res = parseAllDatesDoc(doc);
    expect(res.a).toBe(null);
  });

  test("retains number", () => {
    const doc = { a: 1 };
    const res = parseAllDatesDoc(doc);
    expect(res.a).toBe(1);
  });

  test("retains string", () => {
    const doc = { a: "1" };
    const res = parseAllDatesDoc(doc);
    expect(res.a).toBe("1");
  });

  test("retains object", () => {
    const doc = { a: { f: "1" } };
    const res = parseAllDatesDoc(doc);
    expect(res.a.f).toBe("1");
  });

  test("converts timestamp simple", () => {
    const doc = { a: makeTimestamp() };
    const res = parseAllDatesDoc(doc);
    expect(res.a).toBeInstanceOf(Date);
  });

  test("converts timestamp deep nested", () => {
    const doc = { a: { b: makeTimestamp(), c: { d: makeTimestamp() } } };
    const res = parseAllDatesDoc(doc);
    expect(res.a.b).toBeInstanceOf(Date);
    expect(doc.a.c.d).toBeInstanceOf(Date);
  });

  test("converts timestamp array", () => {
    const doc = { a: { c: [makeTimestamp(), makeTimestamp()] } };
    const res = parseAllDatesDoc(doc);
    expect(res.a.c[0]).toBeInstanceOf(Date);
    expect(doc.a.c[1]).toBeInstanceOf(Date);
  });

  test("converts timestamp array", () => {
    const doc = { a: { c: [{ d: makeTimestamp() }] } };
    const res = parseAllDatesDoc(doc);
    expect(res.a.c[0].d).toBeInstanceOf(Date);
  });

  test("retains falsey", () => {
    const doc = ['okay'];
    const res = parseAllDatesDoc(doc);
    expect(res[0]).toBe('okay');
  });
});

function makeTimestamp() {
  return new MockTimeStamp();
}

class MockTimeStamp {
  toDate() {
    return new Date();
  }
}
