// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  Datagrid,
  List,
  Show,
  Create,
  Edit,
  SimpleShowLayout,
  SimpleForm,
  TextField,
  TextInput,
  ShowButton,
  EditButton,
  RichTextField,
  ReferenceField,
  SelectInput,
  ReferenceInput,
} from "react-admin";
import {CustomDeleteButton} from './CustomDeleteButtons'

export const CommentsList = (props) => (
  <List
    {...props}
  >
    <Datagrid>
      <TextField source="id" />
      <TextField source="updatedby" />
      <TextField source="createdby" />
      <RichTextField source="text" />
      <ReferenceField label="Post" source="post_ref" reference="posts">
        <TextField source="title" />
      </ReferenceField>
      <ShowButton label="" />
      <EditButton label="" />
      <CustomDeleteButton label="" redirect={false} />
    </Datagrid>
  </List>
);

export const CommentShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="createdate" />
      <TextField source="lastupdate" />
      <RichTextField source="text" />
      <ReferenceField label="Post" source="post_ref" reference="posts">
        <TextField source="title" />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);

export const CommentCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="id" />
      <TextInput source="text" />
      <ReferenceInput
        label="Post"
        source="_DOCREF_post_ref"
        reference="posts"
        // filter={{ isAdmin: true }}
      >
        <SelectInput label="User" optionText="title" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const CommentEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" />
      <TextInput source="text" />
      <ReferenceInput
        label="Post"
        source="post_ref"
        reference="posts"
        // filter={{ isAdmin: true }}
      >
        <SelectInput label="User" optionText="title" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);
