// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  Datagrid,
  List,
  Show,
  Create,
  Edit,
  Filter,
  DisabledInput,
  SimpleShowLayout,
  SimpleForm,
  TextField,
  TextInput,
  ShowButton,
  EditButton,
  DeleteButton,
  RichTextField,
  ReferenceField,
  SelectInput,
  ReferenceInput,
  FileInput,
  FileField,
  ArrayInput,
  SimpleFormIterator
} from "react-admin";
import RichTextInput from "ra-input-rich-text";

const PostFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="title" alwaysOn />
  </Filter>
);

export const PostList = (props) => (
  <List {...props} filters={<PostFilter />}>
    <Datagrid>
      <TextField source="title" />
      <TextField source="updatedby" />
      <TextField source="createdby" />
      <RichTextField source="body" />
      <ReferenceField label="User" source="user_id" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <ShowButton label="" />
      <EditButton label="" />
      <DeleteButton label="" redirect={false} />
    </Datagrid>
  </List>
);

export const PostShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="createdate" />
      <TextField source="lastupdate" />
      <TextField source="title" />
      <RichTextField source="body" />
      <ReferenceField label="User" source="user_id" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <FileField source="file.src" title="file.title" />
    </SimpleShowLayout>
  </Show>
);

export const PostCreate = (props) => (
  <Create {...props} >
    <SimpleForm>
      <TextInput source="title" />
      <RichTextInput source="body" />
      <ReferenceInput
        label="User"
        source="user_id"
        reference="users"
        // filter={{ isAdmin: true }}
      >
        <SelectInput label="User" optionText="name" />
      </ReferenceInput>
      <FileInput source="file" label="File" accept="application/pdf">
        <FileField source="src" title="title" />
      </FileInput>
    </SimpleForm>
  </Create>
);

export const PostEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <DisabledInput source="id" />
      <DisabledInput source="createdate" />
      <DisabledInput source="lastupdate" />
      <TextInput source="title" />
      <RichTextInput source="body" />
      <ReferenceInput
        label="User"
        source="user_id"
        reference="users"
        // filter={{ isAdmin: true }}
      >
        <SelectInput label="User" optionText="name" />
      </ReferenceInput>
      <FileInput source="file" label="File" accept="application/pdf">
        <FileField source="src" title="title" />
      </FileInput>
    </SimpleForm>
  </Edit>
);
