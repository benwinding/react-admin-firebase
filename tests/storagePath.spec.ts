import { parseStoragePath } from '../src/misc';

test('useFileNamesInStorage: false', () => {
  const mockFile = new File([], 'test.png');
  const docPath = 'resource/id';
  const fieldPath = 'picture';

  const path = parseStoragePath(mockFile, docPath, fieldPath, false);
  expect(path).toBe('resource/id/picture.png');
});

test('useFileNamesInStorage: true', () => {
  const mockFile = new File([], 'test.png');
  const docPath = 'resource/id';
  const fieldPath = 'picture';

  const path = parseStoragePath(mockFile, docPath, fieldPath, true);
  expect(path).toBe('resource/id/picture/test.png');
});
