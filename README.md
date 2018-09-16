A firebase data provider for the [React-Admin](https://github.com/marmelab/react-admin) framework. 

## Features
- [x] Dynamic caching of resources
- [x] All methods implemented
- [ ] Realtime updates

## Simple Demo

```
import * as React from 'react';
import { Admin, Resource } from 'react-admin';

import { PostList, PostShow, PostCreate, PostEdit } from "./posts";
import { FirebaseProvider } from 'ra-data-firebase';

const config = {
  apiKey: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  authDomain: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  databaseURL: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  projectId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  storageBucket: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
  messagingSenderId: "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

const firebaseProvider = FirebaseProvider(config);

class App extends React.Component {
  public render() {
    return (
      <Admin 
        dataProvider={firebaseProvider} 
      >
        <Resource name="posts" list={PostList} show={PostShow} create={PostCreate} edit={PostEdit}/>
      </Admin>
    );
  }
}

export default App;
```
