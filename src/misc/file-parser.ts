import { logError } from "./logger";
import { IFirebaseWrapper } from "../providers/database/firebase/IFirebaseWrapper";

interface ParsedUpload {
  fieldDotsPath: string;
  fieldSlashesPath: string;
  rawFile: File | any;
}

export function parseDocGetAllUploads(obj: any): ParsedUpload[] {
  const isObject = !!obj && typeof obj === "object";
  if (!isObject) {
    return [];
  }
  const uploads: ParsedUpload[] = [];
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
): any {
  const isFalsey = !input;
  if (isFalsey) {
    return input;
  }
  const isPrimitive = typeof input !== "object";
  if (isPrimitive) {
    return input;
  }
  const isTimestamp = !!input.toDate && typeof input.toDate === "function";
  if (isTimestamp) {
    return input.toDate();
  }
  const isArray = Array.isArray(input);
  if (isArray) {
    return (input as []).map((value, index) =>
      recusivelyParseObjectValue(value, `${fieldPath}.${index}`, uploads)
    );
  }
  const isObject = typeof input === "object";
  if (!isObject) {
    return;
  }
  const isFileField = !!input && input.hasOwnProperty("rawFile");
  if (isFileField) {
    uploads.push({
      fieldDotsPath: fieldPath,
      fieldSlashesPath: fieldPath.split('.').join('/'),
      rawFile: input.rawFile,
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

export const recursivelyMapStorageUrls = async (
  fireWrapper: IFirebaseWrapper,
  fieldValue: any
): Promise<any> => {
  const isArray = Array.isArray(fieldValue);
  const isObject = !isArray && typeof fieldValue === "object";
  const isFileField = isObject && !!fieldValue && fieldValue.hasOwnProperty("src");
  if (isFileField) {
    try {
      const src = await fireWrapper.storage().ref(fieldValue.src).getDownloadURL();
      return {
        ...fieldValue,
        src
      };
    } catch (error) {
      logError(`Error when getting download URL`, {
        error
      });
      return fieldValue;
    }
  } else if (isObject) {
    for (let key in fieldValue) {
      if (fieldValue.hasOwnProperty(key)) {
        const value = fieldValue[key];
        fieldValue[key] = await recursivelyMapStorageUrls(fireWrapper, value);
      }
    }

    return fieldValue;
  } else if (isArray) {
    for (let i = 0; i < fieldValue.length; i++) {
      fieldValue[i] = await recursivelyMapStorageUrls(fireWrapper, fieldValue[i])
    }

    return fieldValue;
  }

  return fieldValue;
};
