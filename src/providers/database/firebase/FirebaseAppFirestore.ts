import { FirebaseFirestore } from "@firebase/firestore-types";
import { FirebaseApp } from "@firebase/app-types";

export interface FirebaseAppFirestore extends FirebaseApp {
  firestore(): FirebaseFirestore;
}
