import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

export type FireUser = firebase.User;
export type FireApp = firebase.app.App;

export type FireStorage = firebase.storage.Storage;
export type FireStorageReference = firebase.storage.Reference;
export type FireUploadTaskSnapshot = firebase.storage.UploadTaskSnapshot;
export type FireUploadTask = firebase.storage.UploadTask;
export type FireStoragePutFileResult = {
  task: FireUploadTask, 
  taskResult: Promise<FireUploadTaskSnapshot>,
  downloadUrl: Promise<string>,
}

export type FireAuth = firebase.auth.Auth;
export type FireAuthUserCredentials = firebase.auth.UserCredential;

export type FireStore = firebase.firestore.Firestore;
export type FireStoreBatch = firebase.firestore.WriteBatch;
export type FireStoreTimeStamp = firebase.firestore.FieldValue;
export type FireStoreDocumentRef = firebase.firestore.DocumentReference;
export type FireStoreDocumentSnapshot = firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>;
export type FireStoreCollectionRef = firebase.firestore.CollectionReference;
export type FireStoreQueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot;
export type FireStoreQuery = firebase.firestore.Query;
export type FireStoreQueryOrder = firebase.firestore.OrderByDirection;

export const TASK_PAUSED = firebase.storage.TaskState.PAUSED
export const TASK_RUNNING = firebase.storage.TaskState.RUNNING
export const TASK_CANCELED = firebase.storage.TaskState.CANCELED
