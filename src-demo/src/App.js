import * as React from "react";
import { PostList, PostShow, PostCreate, PostEdit } from "./posts";
import { UserList, UserShow, UserCreate, UserEdit } from "./users";
import { Admin, Resource } from "react-admin";
import {
  FirebaseDataProvider,
  FirebaseAuthProvider
} from "react-admin-firebase";
import firebase from 'firebase';
import UserIcon from '@material-ui/icons/People';

import { firebaseConfig } from './FIREBASE_CONFIG';
import CustomLoginPage from './CustomLoginPage';

const firebaseApp = firebase.initializeApp(firebaseConfig);

const options = {
  logging: true,
  // rootRef: 'rootrefcollection/QQG2McwjR2Bohi9OwQzP',
  app: firebaseApp,
  // watch: ['posts'];
  // dontwatch: ['comments'];
  persistence: 'local',
  // disableMeta: true
  dontAddIdFieldToDoc: true
}

const authProvider = FirebaseAuthProvider(firebaseConfig, options);
const dataProvider = FirebaseDataProvider(firebaseConfig, options);

class App extends React.Component {
  render() {
    return (
      <Admin
        loginPage={CustomLoginPage}
        dataProvider={dataProvider}
        authProvider={authProvider}
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
