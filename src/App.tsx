// tslint:disable-next-line:no-var-requires
// import * as  jsonServerProvider from 'ra-data-json-server';
import * as React from 'react';
import { PostList } from './posts';

import jsonServerProvider from 'ra-data-json-server';
import { Admin, Resource } from 'react-admin';

const dataProvider = jsonServerProvider('http://jsonplaceholder.typicode.com');

class App extends React.Component {
  public render() {
    return (
      <Admin dataProvider={dataProvider}>
        <Resource name="posts" list={PostList} />
      </Admin>
    );
  }
}

export default App;
