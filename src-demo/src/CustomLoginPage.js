// LoginPage.js
import React from "react";
import { Login, LoginForm } from "react-admin";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from "firebase/compat/app";
import ForgotPasswordButton from './CustomForgotPassword'

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '#/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID
  ],
  // Optional callbacks in order to get Access Token from Google,Facebook,... etc
  callbacks: {
    signInSuccessWithAuthResult: (result) => {
      const credential = result.credential;
      // The signed-in user info.
      const user = result.user;
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      const accessToken = credential.accessToken;
      console.log({result, user, accessToken});
    }
  }
};

const SignInScreen = () => <StyledFirebaseAuth 
  firebaseAuth={firebase.auth()}
  uiConfig={uiConfig}
/>;

const CustomLoginForm = props => (
  <div>
    <div style={{fontFamily: "monospace", marginLeft: '15px'}}>
      <p>Username: test@example.com</p>
      <p>Password: password</p>
    </div>
    <LoginForm {...props} />
    <SignInScreen />
    <ForgotPasswordButton {...props} />
  </div>
);

const CustomLoginPage = props => (
  <Login {...props}>
    <CustomLoginForm {...props}/>
  </Login>
);

export default CustomLoginPage;
