A firebase data provider for the [React-Admin](https://github.com/marmelab/react-admin) framework. Built from Typescript!

## Features
- [x] Dynamic caching of resources
- [x] All methods implemented
- [x] Realtime updates, using ra-realtime

## Simple Demo

```
import * as React from 'react';
import { Admin, Resource } from 'react-admin';

import { PostList, PostShow, PostCreate, PostEdit } from "./posts";
import {
  FirebaseRealTimeSaga,
  FirebaseDataProvider
} from 'react-admin-firebase';

const config = {
  apiKey: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  authDomain: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  databaseURL: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  projectId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  storageBucket: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  messagingSenderId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

const dataProvider = FirebaseDataProvider(config);
// Optional realtime updates in lists and datagrids
const firebaseRealtime = FirebaseRealTimeSaga(dataProvider);

class App extends React.Component {
  public render() {
    return (
      <Admin 
        dataProvider={firebaseProvider} 
        customSagas={[firebaseRealtime]}
      >
        <Resource name="posts" list={PostList} show={PostShow} create={PostCreate} edit={PostEdit}/>
      </Admin>
    );
  }
}

export default App;
```
