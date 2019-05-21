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
  SelectInput
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
      <RichTextField source="body" />
      <TextField source="createdate" />
      <TextField source="lastupdate" />
      <ShowButton label="" />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

export const PostShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="createdate" />
      <TextField source="lastupdate" />
      <RichTextField source="body" />
    </SimpleShowLayout>
  </Show>
);

export const PostCreate = (props) => (
  <Create {...props} >
    <SimpleForm>
      <TextInput source="title" />
      <RichTextInput source="body" />
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
      <SelectInput source="rating" choices={[
        { id: 1, name: 'Good' },
        { id: 2, name: 'Okay' },
        { id: 3, name: 'Bad' },
      ]} />
    </SimpleForm>
  </Edit>
);
