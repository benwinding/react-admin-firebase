import { FireApp } from 'misc/firebase-models';

export interface RAFirebaseOptions {
  // Use a different root document to set your resource collections,
  // by default it uses the root collections of firestore
  rootRef?: string | (() => string);
  // Your own, previously initialized firebase app instance
  app?: FireApp;
  // Enable logging of react-admin-firebase
  logging?: boolean;
  // Resources to watch for realtime updates,
  // will implicitly watch all resources by default, if not set.
  watch?: string[];
  // Resources you explicitly don't want realtime updates for
  dontwatch?: string[];
  // Disable the metadata; 'createdate', 'lastupdate', 'createdby', 'updatedby'
  disableMeta?: boolean;
  // Have custom metadata field names instead of:
  // 'createdate', 'lastupdate', 'createdby', 'updatedby'
  renameMetaFields?: {
    created_at?: string; // default createdate
    created_by?: string; // default createdby
    updated_at?: string; // default lastupdate
    updated_by?: string; // default updatedby
  };
  // Prevents document from getting the ID field added as a property
  dontAddIdFieldToDoc?: boolean;
  // Authentication persistence, defaults to 'session', options are
  // 'session' | 'local' | 'none'
  persistence?: 'session' | 'local' | 'none';
  // Adds 'deleted' meta field for non-destructive deleting functionality
  // NOTE: Hides 'deleted' records from list views unless overridden by
  // filtering for {deleted: true}
  softDelete?: boolean;
  // Changes meta fields like 'createdby' and 'updatedby' to store user IDs instead of email addresses
  associateUsersById?: boolean;
  // Casing for meta fields like 'createdby' and 'updatedby', defaults to 'lower', options are 'lower' | 'camel' | 'snake' | 'pascal' | 'kebab'
  metaFieldCasing?: 'lower' | 'camel' | 'snake' | 'pascal' | 'kebab';
  // Instead of saving full download url for file, save just relative path and then get download url
  // when getting docs - main use case is handling multiple firebase projects (environments)
  // and moving/copying documents/storage files between them - with relativeFilePaths, download url
  // always point to project own storage
  relativeFilePaths?: boolean;
  // Add file name to storage path, when set to true the file name is included in the path
  useFileNamesInStorage?: boolean;
  // Use firebase sdk queries for pagination, filtering and sorting
  lazyLoading?: {
    enabled: boolean;
  };
  // Logging of all reads performed by app (additional feature, for lazy-loading testing)
  firestoreCostsLogger?: {
    enabled: boolean;
    persistCount?: boolean;
  };
  // Function to transform documentData before they are written to Firestore
  transformToDb?: (
    resourceName: string,
    documentData: any,
    documentId: string
  ) => any;
  /* OLD FLAGS */
  /**
   * @deprecated The method should not be used
   */
  overrideDefaultId?: boolean;
}
