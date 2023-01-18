import { REF_INDENTIFIER } from './internal.models';

interface ParsedUpload {
  fieldDotsPath: string;
  fieldSlashesPath: string;
  rawFile: File | any;
}

interface ParsedDocRef {
  fieldDotsPath: string;
  refPath: string;
}

interface ParseResult {
  parsedDoc: any;
  uploads: ParsedUpload[];
  refdocs: ParsedDocRef[];
}

export function translateDocToFirestore(obj: any): ParseResult {
  const isObject = !!obj && typeof obj === 'object';
  const result: ParseResult = {
    uploads: [],
    refdocs: [],
    parsedDoc: {},
  };
  if (!isObject) {
    return result;
  }
  Object.keys(obj).map((key) => {
    const value = obj[key];
    recusivelyParseObjectValue(value, key, result);
  });
  result.parsedDoc = obj;
  return result;
}

export function recusivelyParseObjectValue(
  input: any,
  fieldPath: string,
  result: ParseResult
): any {
  const isFalsey = !input;
  if (isFalsey) {
    return input;
  }
  const isRefField =
    typeof fieldPath === 'string' && fieldPath.includes(REF_INDENTIFIER);
  if (isRefField) {
    const refDocFullPath = input as string;
    result.refdocs.push({
      fieldDotsPath: fieldPath,
      refPath: refDocFullPath,
    });
    return;
  }
  const isPrimitive = typeof input !== 'object';
  if (isPrimitive) {
    return input;
  }
  const isTimestamp = !!input.toDate && typeof input.toDate === 'function';
  if (isTimestamp) {
    return input.toDate();
  }
  const isArray = Array.isArray(input);
  if (isArray) {
    return (input as []).map((value, index) =>
      recusivelyParseObjectValue(value, `${fieldPath}.${index}`, result)
    );
  }
  const isFileField = !!input && input.hasOwnProperty('rawFile');
  if (isFileField) {
    result.uploads.push({
      fieldDotsPath: fieldPath,
      fieldSlashesPath: fieldPath.split('.').join('/'),
      rawFile: input.rawFile,
    });
    delete input.rawFile;
    return;
  }
  Object.keys(input).map((key) => {
    const value = input[key];
    recusivelyParseObjectValue(value, `${fieldPath}.${key}`, result);
  });
  return input;
}
