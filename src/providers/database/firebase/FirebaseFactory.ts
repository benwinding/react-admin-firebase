import { IFirebase } from "./Firebase.interface";
import { Firebase } from "./Firebase";
import { FirebaseStub } from "./Firebase.stub";

export class FirebaseFactory {
  public static CreateMock(): IFirebase {
    return new FirebaseStub();
  }
  public static Create(): IFirebase {
    return new Firebase();
  }
}
