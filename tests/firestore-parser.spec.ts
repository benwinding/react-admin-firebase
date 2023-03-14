import firebase from 'firebase/compat';
import { doc } from 'firebase/firestore';
import {
  FromFirestoreResult,
  recusivelyCheckObjectValue,
  translateDocFromFirestore,
} from '../src/misc';
import { FireStoreDocumentRef } from '../src/misc/firebase-models';
import { FireClient } from '../src/providers/database';
import { MakeMockClient } from './integration-tests/utils/test-helpers';

function blankResultObj(): FromFirestoreResult {
  return {
    parsedDoc: {},
    refdocs: [],
  };
}

describe('timestamp-parser tests', () => {
  test(`null doesn't break it`, () => {
    const testDoc = null;
    translateDocFromFirestore(testDoc);
    expect(testDoc).toBe(null);
  });

  test('retains falsey', () => {
    const testDoc = { a: null };
    translateDocFromFirestore(testDoc);
    expect(testDoc.a).toBe(null);
  });

  test('retains number', () => {
    const testDoc = { a: 1 };
    translateDocFromFirestore(testDoc);
    expect(testDoc.a).toBe(1);
  });

  test('retains string', () => {
    const testDoc = { a: '1' };
    translateDocFromFirestore(testDoc);
    expect(testDoc.a).toBe('1');
  });

  test('retains object', () => {
    const testDoc = { a: { f: '1' } };
    translateDocFromFirestore(testDoc);
    expect(testDoc.a.f).toBe('1');
  });

  test('converts timestamp simple', () => {
    const testDoc = { a: makeTimestamp() };
    translateDocFromFirestore(testDoc);
    expect(testDoc.a).toBeInstanceOf(Date);
  });

  test('converts timestamp deep nested', () => {
    const testDoc = { a: { b: makeTimestamp(), c: { d: makeTimestamp() } } };
    translateDocFromFirestore(testDoc);
    expect(testDoc.a.b).toBeInstanceOf(Date);
    expect(testDoc.a.c.d).toBeInstanceOf(Date);
  });

  test('converts timestamp array', () => {
    const testDoc = { a: { c: [makeTimestamp(), makeTimestamp()] } };
    translateDocFromFirestore(testDoc);
    expect(testDoc.a.c[0]).toBeInstanceOf(Date);
    expect(testDoc.a.c[1]).toBeInstanceOf(Date);
  });

  test('converts timestamp array', () => {
    const testDoc = { a: { c: [{ d: makeTimestamp() }] } };
    translateDocFromFirestore(testDoc);
    expect(testDoc.a.c[0].d).toBeInstanceOf(Date);
  });

  test('retains falsey', () => {
    const document = ['okay'];
    recusivelyCheckObjectValue(document, '', blankResultObj());
    expect(document[0]).toBe('okay');
  });

  test('check converts document references', async () => {
    const client = await MakeMockClient();
    const document = { ref: makeDocumentRef('something/here', client) } as any;
    const result = blankResultObj();
    recusivelyCheckObjectValue(document, '', result);
    expect(result.refdocs.length).toBe(1);
    expect(document.ref).toBe('here');
  });
});

function makeTimestamp() {
  return new MockTimeStamp();
}

function makeDocumentRef(
  path: string,
  client: FireClient
): FireStoreDocumentRef | any {
  return doc(client.fireWrapper.db() as firebase.firestore.Firestore, path);
}

class MockTimeStamp {
  toDate() {
    return new Date();
  }
}
