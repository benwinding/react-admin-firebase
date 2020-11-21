import React from "react";
import { Admin, Resource } from "react-admin";
import {
  FirebaseDataProvider,
  FirebaseAuthProvider
} from "react-admin-firebase";
import firebase from 'firebase';
import UserIcon from '@material-ui/icons/People';
import CommentIcon from '@material-ui/icons/Comment';

import * as Posts from "./posts";
import * as Users from "./users";
import * as Comments from "./comments";

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
          list={Posts.PostList}
          show={Posts.PostShow}
          create={Posts.PostCreate}
          edit={Posts.PostEdit}
        />
        <Resource
          name="users"
          icon={UserIcon}
          list={Users.UserList}
          show={Users.UserShow}
          create={Users.UserCreate}
          edit={Users.UserEdit}
        />
        <Resource
          name="comments"
          icon={CommentIcon}
          list={Comments.CommentsList}
          show={Comments.CommentShow}
          create={Comments.CommentCreate}
          edit={Comments.CommentEdit}
        />
      </Admin>
    );
  }
}

export default App;
