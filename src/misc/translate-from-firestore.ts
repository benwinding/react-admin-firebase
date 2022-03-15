import { logError } from "./logger";
import { IFirebaseWrapper } from "providers/database";
// import { DocumentReference } from "@firebase/firestore-types";
// import { set } from "lodash";
// import { REF_INDENTIFIER } from "./internal.models";

export interface RefDocFound {
  fieldPath: string;
  refDocPath: string;
}

export interface FromFirestoreResult {
  parsedDoc: any;
  refdocs: RefDocFound[];
}

export function translateDocFromFirestore(obj: any) {
  const isObject = !!obj && typeof obj === "object";
  const result: FromFirestoreResult = {
    parsedDoc: {},
    refdocs: [],
  };
  if (!isObject) {
    return result;
  }
  Object.keys(obj).map((key) => {
    const value = obj[key];
    obj[key] = recusivelyCheckObjectValue(value, key, result);
  });
  result.parsedDoc = obj;
  return result;
}

export function recusivelyCheckObjectValue(
  input: any,
  fieldPath: string,
  result: FromFirestoreResult
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
    return (input as any[]).map((value, index) =>
      recusivelyCheckObjectValue(value, `${fieldPath}.${index}`, result)
    );
  }
  // const isDocumentReference = isInputADocReference(input);
  // if (isDocumentReference) {
  //   const ref = input as DocumentReference;
  //   result.refdocs.push({ fieldPath: fieldPath, refDocPath: ref.path });
  //   return ref.id;
  // }
  const isObject = typeof input === "object";
  if (isObject) {
    Object.keys(input).map((key) => {
      const value = input[key];
      input[key] = recusivelyCheckObjectValue(value, key, result);
    });
    return input;
  }
  return input;
}

function isInputADocReference(input: any): boolean {
  const isDocumentReference = typeof input.id === "string" &&
    typeof input.parent === "object" &&
    typeof input.path === "string";
  return isDocumentReference;
}

export function applyRefDocs(
  doc: any,
  refDocs: RefDocFound[],
) {
  // refDocs.map((d) => {
  //   set(doc, REF_INDENTIFIER + d.fieldPath, d.refDocPath);
  // });
  return doc;
}

export const recursivelyMapStorageUrls = async (
  fireWrapper: IFirebaseWrapper,
  fieldValue: any
): Promise<any> => {
  const isArray = Array.isArray(fieldValue);
  const isObject = !isArray && typeof fieldValue === "object";
  const isFileField = isObject && !!fieldValue && fieldValue.hasOwnProperty("src");
  if (isFileField) {
    const isAlreadyUploaded = fieldValue.src.startsWith('https://');
    if (isAlreadyUploaded) {
      return fieldValue;
    }
    try {
      const src = await fireWrapper.getStorageDownloadUrl(fieldValue.src);
      return {
        ...fieldValue,
        src
      };
    } catch (error) {
      logError(`Error when getting download URL`, {
        error,
        fieldValue,
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
