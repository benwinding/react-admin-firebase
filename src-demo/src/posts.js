import * as React from "react";
import {
  Datagrid,
  List,
  Show,
  Create,
  Edit,
  DateField,
  ImageField,
  ImageInput,
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
  FileInput,
  FileField,
  ArrayInput,
  SimpleFormIterator,
  DateInput,
  Toolbar,
  SaveButton,
} from "react-admin";
import {
  CustomDeleteButton, 
  CustomBulkDeleteButton,
} from './CustomDeleteButtons'
import { FirebaseReferenceField, FirebaseReferenceInput } from './FirebaseReferenceFields';

// const PostFilter = (props) => (
//   <Filter {...props}>
//     <TextInput label="Search" source="title" alwaysOn />
//   </Filter>
// );

// const ReferenceFilter = (props) => (
//   <Filter {...props}>
//     <ReferenceInput
//       label="Organization"
//       source="user.id"
//       reference="users"
//       allowEmpty
//     >
//       <SelectInput optionText="name" />
//     </ReferenceInput>
//   </Filter>
// );

export const PostList = (props) => (
  <List
    {...props}
    bulkActionButtons={<CustomBulkDeleteButton />}
    // filters={<ReferenceFilter />}
    // filter={{ updatedby: "test@example.com" }}
  >
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="publishing_state" />
      <TextField source="updatedby" />
      <TextField source="createdby" />
      <RichTextField source="body" />
      <ReferenceField label="User Ref" source="user_ref.___refid" reference="users">
        <TextField source="name" />
      </ReferenceField>

      <ShowButton label="" />
      <EditButton label="" />
      {/* <CustomDeleteButton label="" redirect={false} /> */}
    </Datagrid>
  </List>
);

// const ConditionalEmailField = ({}) =>
//   record && record.hasEmail ? (
//     <EmailField source="email" record={record} {...rest} />
//   ) : null;
export const PostShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="createdate" />
      <TextField source="lastupdate" />
      <TextField source="title" />
      <RichTextField source="body" />

      <ReferenceField label="User Id" source="user_id" reference="users">
        <TextField source="name" />
      </ReferenceField>

      <ReferenceField label="User Ref" source="user_ref.___refid" reference="users">
        <TextField source="name" />
      </ReferenceField>
      {/* Or use the easier <FirebaseReferenceField> */}
      <FirebaseReferenceField
        label="User (Reference Doc)"
        source="user_ref"
        reference="users"
      >
        <TextField source="name" />
      </FirebaseReferenceField>

      <FileField
        source="files_multiple.src"
        title="files_multiple.title"
        multiple
      />
    </SimpleShowLayout>
  </Show>
);

export const PostCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="id" />
      <TextInput source="title" />
      <TextInput source="body" />
      <DateInput source="date" parse={val => new Date(val)} />
      <ReferenceInput
        label="User Id"
        source="user_id"
        reference="users"
        // filter={{ isAdmin: true }}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput
        label="User Ref"
        source="user_ref.___refid"
        reference="users"
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      {/* Or use the easier <FirebaseReferenceInput> */}
      <FirebaseReferenceInput
        label="User Ref (Firebase)"
        source="user_ref"
        reference="users"
      >
        <SelectInput optionText="name" />
      </FirebaseReferenceInput>
      <FileInput source="files_multiple" multiple label="Files with (multiple)">
        <FileField source="src" title="title" />
      </FileInput>
      <ArrayInput source="files">
        <SimpleFormIterator>
          <FileInput source="file" label="Array Form Files">
            <FileField source="src" title="title" />
          </FileInput>
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="sections.mySection.items" label="Section items">
        <SimpleFormIterator>
          <TextInput source="name" label="Name" />
          <ImageInput source="image" label="Image" accept="image/*">
            <ImageField source="src" title="title" />
          </ImageInput>
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

const ToolbarForEdit = (props) => {
  return(
      <Toolbar {...props} style={{justifyContent: 'space-between'}}>
          <SaveButton />
          <CustomDeleteButton />
      </Toolbar>
  )
}

export const PostEdit = (props) => (
  <Edit {...props}>
    <SimpleForm toolbar={<ToolbarForEdit />}>
      <TextInput disabled source="id" />
      <DateField source="createdate" />
      <DateField source="lastupdate" />
      <TextInput source="title" />
      <TextInput source="body" />
      <ReferenceInput
        label="User Id"
        source="user_id"
        reference="users"
        // filter={{ isAdmin: true }}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput
        label="User Ref"
        source="user_ref.___refid"
        reference="users"
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <FirebaseReferenceInput
        label="User Ref (Firebase)"
        source="user_ref"
        reference="users"
      >
        <SelectInput optionText="name" />
      </FirebaseReferenceInput>
      <FileInput source="files_multiple" multiple label="Files with (multiple)">
        <FileField source="src" title="title" />
      </FileInput>
      <ArrayInput source="files">
        <SimpleFormIterator>
          <FileInput source="file" label="Array Form Files">
            <FileField source="src" title="title" />
          </FileInput>
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="sections.mySection.items" label="Section items">
        <SimpleFormIterator>
          <TextInput source="name" label="Name" />
          <ImageInput source="image" label="Image" accept="image/*">
            <ImageField source="src" title="title" />
          </ImageInput>
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);
