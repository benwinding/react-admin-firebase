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
- [ ] Firebase storage upload functionality

_Pull requests welcome!!_

## Firestore Dataprovider Features
- [x] Dynamic caching of resources
- [x] All methods implemented; `(GET, POST, GET_LIST ect...)`
- [x] Filtering, sorting etc...
- [x] Realtime updates, using ra-realtime
    - Implicitly watches all GET_LIST routes using observables with the firebase sdk
    - Optional watch collection array or dontwatch collection array
- [x] Ability to manage sub collections through app configuration

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

## Data Provider

``` javascript
import * as React from 'react';
import { Admin, Resource } from 'react-admin';

import { PostList, PostShow, PostCreate, PostEdit } from "./posts";
import { FirebaseDataProvider } from 'react-admin-firebase';

const config = {
  apiKey: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  authDomain: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  databaseURL: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  projectId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  storageBucket: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  messagingSenderId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

// Options are optional
const options = {
  // All collections and docuemtns can be relative to the new root ref, rather than the firestore root
  rootRef: 'root-collection/document'
}

const dataProvider = FirebaseDataProvider(config, options);

class App extends React.Component {
  public render() {
    return (
      <Admin 
        dataProvider={dataProvider} 
      >
        <Resource name="posts" list={PostList} show={PostShow} create={PostCreate} edit={PostEdit}/>
      </Admin>
    );
  }
}

export default App;
```
## Auth Provider
Using the `FirebaseAuthProvider` you can allow authentication in the application.

``` javascript
...
import {
  FirebaseAuthProvider,
  FirebaseDataProvider
} from 'react-admin-firebase';
...
const dataProvider = FirebaseDataProvider(config);
const authProvider = FirebaseAuthProvider(config);

class App extends React.Component {
  public render() {
    return (
      <Admin 
        dataProvider={dataProvider}
        authProvider={authProvider}
      >
        <Resource name="posts" list={PostList} show={PostShow} create={PostCreate} edit={PostEdit}/>
      </Admin>
    );
  }
}

export default App;
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

class App extends React.Component {
  public render() {
    return (
      <Admin 
        dataProvider={dataProvider} 
        customSagas={[firebaseRealtime]}
      >
        <Resource name="posts" list={PostList} show={PostShow} create={PostCreate} edit={PostEdit}/>
      </Admin>
    );
  }
}

export default App;
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

### Develop `react-admin-firebase` Locally!

1. `git clone https://github.com/benwinding/react-admin-firebase`
2. `yarn && yarn watch`
3. _(open another terminal)_ 
4. `cd src-demo && yarn && yarn start`

Now all local changes in the library source code can be tested immediately in the demo app.
