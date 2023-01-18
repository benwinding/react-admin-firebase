import { RAFirebaseOptions } from 'index';
import { IFirebaseWrapper, ResourceManager } from 'providers/database';

export async function AddCreatedByFields(
  obj: any,
  fireWrapper: IFirebaseWrapper,
  rm: Pick<ResourceManager, 'getUserIdentifier'>,
  options: Pick<
    RAFirebaseOptions,
    | 'associateUsersById'
    | 'disableMeta'
    | 'renameMetaFields'
    | 'metaFieldCasing'
  >
) {
  if (options.disableMeta) {
    return;
  }
  const currentUserIdentifier = await rm.getUserIdentifier();
  const createAtSelector = GetSelectorsCreateAt(options);
  const createBySelector = GetSelectorsCreateBy(options);
  obj[createAtSelector] = fireWrapper.serverTimestamp();
  obj[createBySelector] = currentUserIdentifier;
}

export async function AddUpdatedByFields(
  obj: any,
  fireWrapper: IFirebaseWrapper,
  rm: Pick<ResourceManager, 'getUserIdentifier'>,
  options: Pick<
    RAFirebaseOptions,
    | 'associateUsersById'
    | 'disableMeta'
    | 'renameMetaFields'
    | 'metaFieldCasing'
  >
) {
  if (options.disableMeta) {
    return;
  }
  const currentUserIdentifier = await rm.getUserIdentifier();
  const updateAtSelector = GetSelectorsUpdateAt(options);
  const updateBySelector = GetSelectorsUpdateBy(options);
  obj[updateAtSelector] = fireWrapper.serverTimestamp();
  obj[updateBySelector] = currentUserIdentifier;
}

export function GetSelectorsUpdateAt(
  options: Pick<RAFirebaseOptions, 'metaFieldCasing' | 'renameMetaFields'>
): string {
  if (options.renameMetaFields && options.renameMetaFields.updated_at) {
    return options.renameMetaFields.updated_at;
  }
  const casing = options.metaFieldCasing;
  const defautCase = 'lastupdate';
  if (!casing) {
    return defautCase;
  }
  if (casing === 'camel') {
    return 'lastUpdate';
  }
  if (casing === 'snake') {
    return 'last_update';
  }
  if (casing === 'pascal') {
    return 'LastUpdate';
  }
  if (casing === 'kebab') {
    return 'last-update';
  }
  return defautCase;
}

export function GetSelectorsUpdateBy(
  options: Pick<RAFirebaseOptions, 'metaFieldCasing' | 'renameMetaFields'>
): string {
  if (options.renameMetaFields && options.renameMetaFields.updated_by) {
    return options.renameMetaFields.updated_by;
  }
  const casing = options.metaFieldCasing;
  const defautCase = 'updatedby';
  if (!casing) {
    return defautCase;
  }
  if (casing === 'camel') {
    return 'updatedBy';
  }
  if (casing === 'snake') {
    return 'updated_by';
  }
  if (casing === 'pascal') {
    return 'UpdatedBy';
  }
  if (casing === 'kebab') {
    return 'updated-by';
  }
  return defautCase;
}

export function GetSelectorsCreateAt(
  options: Pick<RAFirebaseOptions, 'metaFieldCasing' | 'renameMetaFields'>
): string {
  if (options.renameMetaFields && options.renameMetaFields.created_at) {
    return options.renameMetaFields.created_at;
  }
  const casing = options.metaFieldCasing;
  const defautCase = 'createdate';
  if (!casing) {
    return defautCase;
  }
  if (casing === 'camel') {
    return 'createDate';
  }
  if (casing === 'snake') {
    return 'create_date';
  }
  if (casing === 'pascal') {
    return 'CreateDate';
  }
  if (casing === 'kebab') {
    return 'create-date';
  }
  return defautCase;
}

export function GetSelectorsCreateBy(
  options: Pick<RAFirebaseOptions, 'metaFieldCasing' | 'renameMetaFields'>
): string {
  if (options.renameMetaFields && options.renameMetaFields.created_by) {
    return options.renameMetaFields.created_by;
  }
  const casing = options.metaFieldCasing;
  const defautCase = 'createdby';
  if (!casing) {
    return defautCase;
  }
  if (casing === 'camel') {
    return 'createdBy';
  }
  if (casing === 'snake') {
    return 'created_by';
  }
  if (casing === 'pascal') {
    return 'CreatedBy';
  }
  if (casing === 'kebab') {
    return 'created-by';
  }
  return defautCase;
}
