import {
  applyRefDocs,
  RefDocFound,
  REF_INDENTIFIER,
  translateDocFromFirestore,
  translateDocToFirestore,
} from '../src/misc';
import { FireStoreDocumentRef } from '../src/misc/firebase-models';

describe('reference-document-parser.spec', () => {
  test('test translateDocToFirestore', () => {
    const dataToCreate = {
      name: 'Some guy',
      items: [
        {
          user: 'dan',
          friend: 'ref',
          ___REF_FULLPATH_friend: 'my/ref',
        },
      ],
    };
    const result = translateDocToFirestore(dataToCreate);
    expect(result.refdocs.length).toBe(1);
    expect(result.refdocs[0].fieldDotsPath).toBe(
      'items.0.___REF_FULLPATH_friend'
    );
    expect(result.refdocs[0].refPath).toBe('my/ref');
  });

  test('test translateDocFromFirestore', () => {
    const refDocPath = 'fake/doc/path';
    const dataFromDb = {
      myrefdoc: makeFakeRefDoc(refDocPath),
    };
    const result = translateDocFromFirestore(dataFromDb);
    expect(result.refdocs.length).toBe(1);
    expect(result.refdocs[0].fieldPath).toBe('myrefdoc');
    expect(result.refdocs[0].refDocPath).toBe(refDocPath);
  });

  describe('applyRefDocs', () => {
    test('keeps existing fields', () => {
      const doc = {
        somefield: 'okay',
      };
      const result = applyRefDocs(doc, [makeRefDocFound('doc1', 'my/doc')]);
      expect(result.somefield).toBe('okay');
    });
    test('adds refdoc field', () => {
      const doc = {
        somefield: 'okay',
      };
      const result = applyRefDocs(doc, [makeRefDocFound('doc1', 'my/doc')]);
      expect(result[REF_INDENTIFIER + 'doc1']).toBe('my/doc');
    });
  });
});

function makeRefDocFound(fieldPath: string, refDocPath: string): RefDocFound {
  return {
    fieldPath,
    refDocPath,
  };
}

function makeFakeRefDoc(docPath: string): FireStoreDocumentRef {
  return {
    id: docPath.split('/').pop(),
    firestore: {} as any,
    parent: {} as any,
    path: docPath,
  } as any as FireStoreDocumentRef;
}
