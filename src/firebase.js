import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var config = {
  apiKey: "AIzaSyAT6KbSMPcdoLSYstZHLLf9jBCcYpUJtsk",
  authDomain: "react-slack-clone-3b5b0.firebaseapp.com",
  databaseURL: "https://react-slack-clone-3b5b0.firebaseio.com",
  projectId: "react-slack-clone-3b5b0",
  storageBucket: "react-slack-clone-3b5b0.appspot.com",
  messagingSenderId: "162865558091"
};
firebase.initializeApp(config);

export default firebase;
