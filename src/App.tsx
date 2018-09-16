// tslint:disable-next-line:no-var-requires
// import * as  jsonServerProvider from 'ra-data-json-server';
import * as React from 'react';
import { PostList, PostShow, PostCreate, PostEdit } from "./posts";

// import jsonServerProvider from 'ra-data-json-server';
import { Admin, Resource } from 'react-admin';
import { FirebaseProvider } from './react-admin-firebase/reactAdminFirebase';

const config = {
  apiKey: "AIzaSyBJIVBrJ1Ru5pd-wJ1dlCYj6ddq1AAw7xI",
  authDomain: "test-react-admin-1854c.firebaseapp.com",
  databaseURL: "https://test-react-admin-1854c.firebaseio.com",
  projectId: "test-react-admin-1854c",
  storageBucket: "test-react-admin-1854c.appspot.com",
  // messagingSenderId: "653484435936",
};

const firebaseProvider = FirebaseProvider(config);

class App extends React.Component {
  public render() {
    return (
      <Admin dataProvider={firebaseProvider}>
        <Resource name="posts" list={PostList} show={PostShow} create={PostCreate} edit={PostEdit}/>
      </Admin>
    );
  }
}

export default App;
