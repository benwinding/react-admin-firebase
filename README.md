# react-admin-firebase

<!-- [START badges] -->
[![NPM Version](https://img.shields.io/npm/v/react-admin-firebase.svg)](https://www.npmjs.com/package/react-admin-firebase) 
[![License](https://img.shields.io/npm/l/react-admin-firebase.svg)](https://github.com/benwinding/react-admin-firebase/blob/master/LICENSE) 
[![Downloads/week](https://img.shields.io/npm/dm/react-admin-firebase.svg)](https://www.npmjs.com/package/react-admin-firebase) 
[![Github Issues](https://img.shields.io/github/issues/benwinding/react-admin-firebase.svg)](https://github.com/benwinding/react-admin-firebase)
<!-- [END badges] -->

A firebase data provider for the [React-Admin](https://github.com/marmelab/react-admin) framework. It maps collections from the Firebase database (Firestore) to your react-admin application. It's an [npm package](https://www.npmjs.com/package/react-admin-firebase)!

## Features
- [x] Firestore Dataprovider _(details below)_
- [x] Firebase AuthProvider (email, password)
- [x] Firebase storage upload functionality

_Pull requests welcome!!_

## Firestore Dataprovider Features
- [x] Dynamic caching of resources
- [x] All methods implemented; `(GET, POST, GET_LIST ect...)`
- [x] Filtering, sorting etc...
- [x] Realtime updates, using ra-realtime
    - Optional watch collection array or dontwatch collection array
- [x] Ability to manage sub collections through app configuration
- [x] Ability to use externally initialized firebaseApp instance
- [x] Override firestore random id by using "id" as a field in the Create part of the resource
- [x] Upload to the firebase storage bucket using the standard <FileInput /> field

## Get Started
`yarn add react-admin-firebase` 

or

`npm install --save react-admin-firebase`

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
  rootRef: 'root-collection/some-doc';
  // Your own, previously initialized firebase app instance
  app: firebaseAppInstance;
  // Enable logging of react-admin-firebase
  logging: true;
  // Resources to watch for realtime updates, will implicitly watch all resources by default, if not set.
  watch: ['posts'];
  // Resources you explicitly dont want realtime updates for
  dontwatch: ['comments'];
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
#### Note
To get the currently logged in user run `const user = await authProvider('AUTH_GETCURRENT')`, this will return the firebase user object, or null if there is no currently logged in user.

## Realtime Updates!
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

# Help Develop `react-admin-firebase`?

1. `git clone https://github.com/benwinding/react-admin-firebase`
2. `yarn && yarn watch`
3. _(open another terminal)_ 
4. `cd src-demo && yarn && yarn start`

Now all local changes in the library source code can be tested immediately in the demo app.

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ben.winding%40gmail.com&item_name=Development&currency_code=AUD&source=url)
