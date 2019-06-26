import * as React from "react";
import { PostList, PostShow, PostCreate, PostEdit } from "./posts";
import { UserList, UserShow, UserCreate, UserEdit } from "./users";
import Person from '@material-ui/icons/Person'
import { Admin, Resource } from "react-admin";
import {
  FirebaseRealTimeSaga,
  FirebaseDataProvider,
  FirebaseAuthProvider
} from "react-admin-firebase";
import UserIcon from '@material-ui/icons/People';

import { firebaseConfig } from './FIREBASE_CONFIG';

const options = {
  logging: true,
  rootRef: 'rootrefcollection/QQG2McwjR2Bohi9OwQzP',
  uploadToStorage: true,
  // app: firebaseAppInstance
  // watch: ['posts'];
  // dontwatch: ['comments'];
}

const authProvider = FirebaseAuthProvider(firebaseConfig, options);
const dataProvider = FirebaseDataProvider(firebaseConfig, options);
const firebaseRealtime = FirebaseRealTimeSaga(dataProvider, options);

class App extends React.Component {
  render() {
    return (
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        customSagas={[firebaseRealtime]}
      >
        <Resource
          name="posts"
          list={PostList}
          show={PostShow}
          create={PostCreate}
          edit={PostEdit}
        />
        <Resource
          name="users"
          icon={UserIcon}
          list={UserList}
          show={UserShow}
          create={UserCreate}
          edit={UserEdit}
        />
      </Admin>
    );
  }
}

export default App;
