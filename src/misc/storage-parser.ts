import { joinPaths } from './pathHelper';

export function parseStoragePath(
  rawFile: File,
  docPath: string,
  fieldPath: string,
  useFileName: boolean
): string {
  const fileNameBits = rawFile instanceof File ? rawFile.name.split('.') : [];

  const fileExtension = !fileNameBits?.length ? '' : '.' + fileNameBits.pop();

  return useFileName
    ? joinPaths(docPath, fieldPath, rawFile.name)
    : joinPaths(docPath, fieldPath + fileExtension);
}
