// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
const { Datagrid, List, TextField } = require("react-admin");

export const PostList = (props: {}) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="body" />
    </Datagrid>
  </List>
);
