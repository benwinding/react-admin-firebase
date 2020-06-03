interface ParsedUpload {
  fieldDotsPath: string;
  fieldSlashesPath: string;
  rawFile: File | any;
}

export function parseDocGetAllUploads(obj: {}): ParsedUpload[] {
  const isObject = !!obj && typeof obj === 'object';
  if (!isObject) {
    return [];
  }
  const uploads = [];
  Object.keys(obj).map((key) => {
    const value = obj[key];
    recusivelyParseObjectValue(value, key, uploads);
  });
  return uploads;
}

export function recusivelyParseObjectValue(
  input: any,
  fieldPath: string,
  uploads: ParsedUpload[]
) {
  const isFalsey = !input;
  if (isFalsey) {
    return input;
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
      recusivelyParseObjectValue(value, `${fieldPath}.${index}`, uploads)
    );
  }
  const isObject = typeof input === 'object';
  if (!isObject) {
    return;
  }
  const isFileField = !!input && input.hasOwnProperty('rawFile');
  if (isFileField) {
    uploads.push({
      fieldDotsPath: fieldPath,
      fieldSlashesPath: fieldPath.split('.').join('/'),
      rawFile: input.rawFile
    });
    delete input.rawFile;
    return;
  }
  Object.keys(input).map((key) => {
    const value = input[key];
    recusivelyParseObjectValue(value, `${fieldPath}.${key}`, uploads);
  });
  return input;
}
