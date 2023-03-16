# react-admin-firebase
<!-- [START badges] -->
[![NPM Version](https://img.shields.io/npm/v/react-admin-firebase.svg)](https://www.npmjs.com/package/react-admin-firebase) 
[![License](https://img.shields.io/npm/l/react-admin-firebase.svg)](https://github.com/benwinding/react-admin-firebase/blob/master/LICENSE) 
[![Downloads/week](https://img.shields.io/npm/dm/react-admin-firebase.svg)](https://www.npmjs.com/package/react-admin-firebase) 
[![Github Issues](https://img.shields.io/github/issues/benwinding/react-admin-firebase.svg)](https://github.com/benwinding/react-admin-firebase)
<!-- [END badges] -->

A firebase data provider for the [React-Admin](https://github.com/marmelab/react-admin) framework. It maps collections from the Firebase database (Firestore) to your react-admin application. It's an [npm package](https://www.npmjs.com/package/react-admin-firebase)!

---

## Features
- [x] Firestore Dataprovider _(details below)_
- [x] Firebase AuthProvider (email, password)
- [x] Login with: Google, Facebook, Github etc... [(Example Here)](https://github.com/benwinding/react-admin-firebase/blob/master/src-demo/src/CustomLoginPage.js)
- [x] Forgot password button... [(Example Here)](https://github.com/benwinding/react-admin-firebase/blob/master/src-demo/src/CustomForgotPassword.js)
- [x] Firebase storage upload functionality, with upload monitoring... [(Example Here)](https://github.com/benwinding/react-admin-firebase/blob/master/src-demo/src/EventMonitor.js)

_Pull requests welcome!!_

## Firestore Dataprovider Features
- [x] Dynamic caching of resources
- [x] All methods implemented; `(GET, POST, GET_LIST ect...)`
- [x] Filtering, sorting etc...
- [x] Ability to manage sub collections through app configuration
- [x] Ability to use externally initialized firebaseApp instance
- [x] Override firestore random id by using "id" as a field in the Create part of the resource
- [x] Upload to the firebase storage bucket using the standard `<FileInput />` field
- [ ] Realtime updates, using ra-realtime
    - Optional watch collection array or dontwatch collection array

## Get Started
`yarn add react-admin-firebase firebase`

or

`npm install --save react-admin-firebase firebase`

## Demos Basic
A simple example based on the [React Admin Tutorial](https://marmelab.com/react-admin/Tutorial.html).

- [Demo Project (javascript)](https://github.com/benwinding/demo-react-admin-firebase)
- [Demo Project (typescript)](https://github.com/benwinding/react-admin-firebase-demo-typescript)

### Prerequisits
- Create a `posts` collection in the firebase firestore database
- Get config credentials using the dashboard

## Options

``` javascript
import {
  FirebaseAuthProvider,
  FirebaseDataProvider,
  FirebaseRealTimeSaga
} from 'react-admin-firebase';

const config = {
  apiKey: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  authDomain: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  databaseURL: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  projectId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  storageBucket: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  messagingSenderId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

// All options are optional
const options = {
  // Use a different root document to set your resource collections, by default it uses the root collections of firestore
  rootRef: 'root-collection/some-doc' | () => 'root-collection/some-doc',
  // Your own, previously initialized firebase app instance
  app: firebaseAppInstance,
  // Enable logging of react-admin-firebase
  logging: true,
  // Resources to watch for realtime updates, will implicitly watch all resources by default, if not set.
  watch: ['posts'],
  // Resources you explicitly dont want realtime updates for
  dontwatch: ['comments'],
  // Authentication persistence, defaults to 'session', options are 'session' | 'local' | 'none'
  persistence: 'session',
  // Disable the metadata; 'createdate', 'lastupdate', 'createdby', 'updatedby'
  disableMeta: false,
  // Have custom metadata field names instead of: 'createdate', 'lastupdate', 'createdby', 'updatedby'
  renameMetaFields: {
    created_at: 'my_created_at', // default: 'createdate'
    created_by: 'my_created_by', // default: 'createdby'
    updated_at: 'my_updated_at', // default: 'lastupdate'
    updated_by: 'my_updated_by', // default: 'updatedby'
  },
  // Prevents document from getting the ID field added as a property
  dontAddIdFieldToDoc: false,
  // Adds 'deleted' meta field for non-destructive deleting functionality
  // NOTE: Hides 'deleted' records from list views unless overridden by filtering for {deleted: true} 
  softDelete: false,
  // Changes meta fields like 'createdby' and 'updatedby' to store user IDs instead of email addresses
  associateUsersById: false,
  // Casing for meta fields like 'createdby' and 'updatedby', defaults to 'lower', options are 'lower' | 'camel' | 'snake' | 'pascal' | 'kebab'
  metaFieldCasing: 'lower',
  // Instead of saving full download url for file, save just relative path and then get download url
  // when getting docs - main use case is handling multiple firebase projects (environments)
  // and moving/copying documents/storage files between them - with relativeFilePaths, download url
  // always point to project own storage
  relativeFilePaths: false, 
  // Add file name to storage path, when set to true the file name is included in the path
  useFileNamesInStorage: false,
  // Use firebase sdk queries for pagination, filtering and sorting
  lazyLoading: {
    enabled: false
  },
  // Logging of all reads performed by app (additional feature, for lazy-loading testing)
  firestoreCostsLogger: {
    enabled: false,
    localStoragePrefix // optional
  },
  // Function to transform documentData before they are written to Firestore
  transformToDb: (resourceName, documentData, documentId) => documentDataTransformed
}

const dataProvider = FirebaseDataProvider(config, options);
const authProvider = FirebaseAuthProvider(config, options);
const firebaseRealtime = FirebaseRealTimeSaga(dataProvider, options);
```

## Data Provider

``` javascript
import * as React from 'react';
import { Admin, Resource } from 'react-admin';

import { PostList, PostShow, PostCreate, PostEdit } from "./posts";
import {
  FirebaseAuthProvider,
  FirebaseDataProvider,
  FirebaseRealTimeSaga
} from 'react-admin-firebase';

const config = {
  apiKey: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  authDomain: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  databaseURL: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  projectId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  storageBucket: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  messagingSenderId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

const options = {};

const dataProvider = FirebaseDataProvider(config, options);
...
      <Admin 
        dataProvider={dataProvider} 
      >
        <Resource name="posts" list={PostList} show={PostShow} create={PostCreate} edit={PostEdit}/>
      </Admin>
...
```
## Auth Provider
Using the `FirebaseAuthProvider` you can allow authentication in the application.

``` javascript
const dataProvider = FirebaseDataProvider(config);
const authProvider = FirebaseAuthProvider(config);
...
      <Admin 
        dataProvider={dataProvider}
        authProvider={authProvider}
      >
...
```

Also checkout how to login with: Google, Facebook, Github etc... [(Example Here)](https://github.com/benwinding/react-admin-firebase/blob/master/src-demo/src/CustomLoginPage.js)

And you might want a "Forgot password" button... [(Example Here)](https://github.com/benwinding/react-admin-firebase/blob/master/src-demo/src/CustomForgotPassword.js)

#### Note
To get the currently logged in user run `const user = await authProvider.checkAuth()`, this will return the firebase user object, or null if there is no currently logged in user.

## Realtime Updates!

NOTE: Realtime updates were removed in `react-admin` v3.x (see https://github.com/marmelab/react-admin/pull/3908). As such, `react-admin-firebase` v3.x also does not support Realtime Updates. However, much of the original code used for this functionality in `react-admin` v2.x remains - including the documentation below. For updates on the implementation of realtime please follow these issues:
- https://github.com/benwinding/react-admin-firebase/issues/49
- https://github.com/benwinding/react-admin-firebase/issues/57

Get realtime updates from the firebase server instantly on your tables, with minimal overheads, using rxjs observables!

``` javascript
...
import {
  FirebaseRealTimeSaga,
  FirebaseDataProvider
} from 'react-admin-firebase';
...
const dataProvider = FirebaseDataProvider(config);
const firebaseRealtime = FirebaseRealTimeSaga(dataProvider);
...
      <Admin 
        dataProvider={dataProvider} 
        customSagas={[firebaseRealtime]}
      >
...
```

### Realtime Options
Trigger realtime on only some routes using the options object.

``` javascript
...
const dataProvider = FirebaseDataProvider(config);
const options = {
  watch: ['posts', 'comments'],
  dontwatch: ['users']
}
const firebaseRealtime = FirebaseRealTimeSaga(dataProvider, options);
...
```

## Upload Progress

Monitor file upload data using custom React component which listen for following events (`CustomEvent`):

- `FILE_UPLOAD_WILL_START`
- `FILE_UPLOAD_START`
- `FILE_UPLOAD_PROGRESS`
- `FILE_UPLOAD_PAUSED`
- `FILE_UPLOAD_CANCELD`
- `FILE_UPLOAD_COMPLETE`
- `FILE_SAVED`

All events have data passed in `details` key:

- `fileName`: the file anme
- `data`: percentage for `FILE_UPLOAD_PROGRESS`

Events are sent to HTML DOM element with id "eventMonitor". See demo implementation for example at [src-demo/src/App.js](src-demo/src/App.js);

# Help Develop `react-admin-firebase`?

1. `git clone https://github.com/benwinding/react-admin-firebase`
2. `yarn`
3. `yarn start-demo`

Now all local changes in the library source code can be tested immediately in the demo app.

### Run tests
To run the tests, either watch for changes or just run all tests.

- `yarn test-watch`
- `yarn test`

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ben.winding%40gmail.com&item_name=Development&currency_code=AUD&source=url)
