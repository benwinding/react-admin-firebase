import { FirebaseApp } from 'firebase/app';
import { Auth, User, UserCredential } from 'firebase/auth';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
  Firestore,
  OrderByDirection,
  Query,
  QueryDocumentSnapshot,
  WriteBatch,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  StorageReference,
  TaskState,
  UploadTask,
  UploadTaskSnapshot,
} from 'firebase/storage';

export type FireUser = User;
export type FireApp = FirebaseApp;

export type FireStorage = FirebaseStorage;
export type FireStorageReference = StorageReference;
export type FireUploadTaskSnapshot = UploadTaskSnapshot;
export type FireUploadTask = UploadTask;
export type FireStoragePutFileResult = {
  task: FireUploadTask;
  taskResult: Promise<FireUploadTaskSnapshot>;
  downloadUrl: Promise<string>;
};

export type FireAuth = Auth;
export type FireAuthUserCredentials = UserCredential;

export type FireStore = Firestore;
export type FireStoreBatch = WriteBatch;
export type FireStoreTimeStamp = FieldValue;
export type FireStoreDocumentRef = DocumentReference;
export type FireStoreDocumentSnapshot = DocumentSnapshot<DocumentData>;
export type FireStoreCollectionRef = CollectionReference;
export type FireStoreQueryDocumentSnapshot = QueryDocumentSnapshot;
export type FireStoreQuery = Query;
export type FireStoreQueryOrder = OrderByDirection;

export const TASK_PAUSED = 'paused' as TaskState;
export const TASK_RUNNING = 'running' as TaskState;
export const TASK_CANCELED = 'cancelled' as TaskState;
