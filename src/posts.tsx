// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  Datagrid,
  List,
  Show,
  SimpleShowLayout,
  TextField,
  ShowButton
} from "react-admin";

export const PostList = (props: {}) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="body" />
      <ShowButton />
    </Datagrid>
  </List>
);

export const PostShow = (props: {}) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="body" />
    </SimpleShowLayout>
  </Show>
);
