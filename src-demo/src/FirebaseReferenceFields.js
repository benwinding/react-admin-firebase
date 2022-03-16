import * as React from "react";
import { ReferenceField, ReferenceInput } from "react-admin";

export const FirebaseReferenceField = (props) => {
  const {
    source,
    children,
    ...rest
  } = props;
  return (
    <ReferenceField
      source={`${source}.___refid`}
      {...rest}
    >
      {children}
    </ReferenceField>
  );
};
FirebaseReferenceField.defaultProps = { addLabel: true };

export const FirebaseReferenceInput = (props) => {
  const {
    source,
    children,
    ...rest
  } = props;
  return (
    <ReferenceInput
      source={`${source}.___refid`}
      {...rest}
    >
      {children}
    </ReferenceInput>
  );
};