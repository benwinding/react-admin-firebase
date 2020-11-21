export interface RAFirebaseOptions {
  rootRef?: string | (() => string);
  app?: any;
  logging?: boolean;
  watch?: string[];
  dontwatch?: string[];
  overrideDefaultId?: boolean;
  disableMeta?: boolean;
  renameMetaFields?: {
    created_at?: string, // default createdate
    created_by?: string, // default createdby
    updated_at?: string, // default lastupdate
    updated_by?: string, // default updatedby
  },
  dontAddIdFieldToDoc?: boolean;
  persistence?: 'session' | 'local' | 'none';
  softDelete?: boolean;
  associateUsersById?: boolean;
  metaFieldCasing?: 'lower' | 'camel' | 'snake' | 'pascal' | 'kebab';
  relativeFilePaths?: boolean;
  useFileNamesInStorage?: boolean;
}
