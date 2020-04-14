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
<<<<<<< HEAD
  metaFieldCasing?: 'lower' | 'camel' | 'snake' | 'pascal' | 'kebab';
=======
  softDelete?: boolean;
>>>>>>> softDelete
}
