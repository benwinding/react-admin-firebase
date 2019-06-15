import * as React from "react";
import { PostList, PostShow, PostCreate, PostEdit } from "./posts";
import { Admin, Resource } from "react-admin";
import {
  FirebaseRealTimeSaga,
  FirebaseDataProvider,
  FirebaseAuthProvider
} from "react-admin-firebase";

import { firebaseConfig } from './FIREBASE_CONFIG';

import * as firebaseApp from "firebase/app";
import "firebase/firestore";

firebaseApp.initializeApp(firebaseConfig);
const app = firebaseApp.app()

const options = {
  logging: true,
  rootRef: 'rootrefcollection/QQG2McwjR2Bohi9OwQzP',
  app: app
}

const authProvider = FirebaseAuthProvider(null, options);
const dataProvider = FirebaseDataProvider(null, options);
// const firebaseRealtime = FirebaseRealTimeSaga(dataProvider, options);

class App extends React.Component {
  render() {
    return (
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        // customSagas={[firebaseRealtime]}
      >
        <Resource
          name="posts"
          list={PostList}
          show={PostShow}
          create={PostCreate}
          edit={PostEdit}
        />
      </Admin>
    );
  }
}

export default App;
