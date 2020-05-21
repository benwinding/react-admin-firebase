export interface RAFirebaseOptions {
  rootRef?: string;
  app?: any;
  logging?: boolean;
  watch?: string[];
  dontwatch?: string[];
  overrideDefaultId?: boolean;
  disableMeta?: boolean;
  dontAddIdFieldToDoc?: boolean;
  persistence?: 'session' | 'local' | 'none';
  softDelete?: boolean;
  associateUsersById?: boolean;
  metaFieldCasing?: 'lower' | 'camel' | 'snake' | 'pascal' | 'kebab';
  lazyLoading?: boolean;
}
