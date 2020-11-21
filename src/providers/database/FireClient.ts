import { set } from "lodash";
import {
  AddCreatedByFields,
  AddUpdatedByFields,
  joinPaths,
  log,
  logError,
  parseDocGetAllUploads,
} from "../../misc";
import { RAFirebaseOptions } from "../options";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { IResource, ResourceManager } from "./ResourceManager";

export class FireClient {
  public rm: ResourceManager;
  public db() {
    return this.fireWrapper.db();
  }

  constructor(
    public fireWrapper: IFirebaseWrapper,
    public options: RAFirebaseOptions
  ) {
    this.rm = new ResourceManager(this.fireWrapper, this.options);
  }

  public checkRemoveIdField(obj: any) {
    if (this.options.dontAddIdFieldToDoc) {
      delete obj.id;
    }
  }

  public async parseDataAndUpload(r: IResource, id: string, data: any) {
    if (!data) {
      return data;
    }
    const docPath = r.collection.doc(id).path;

    const uploads = parseDocGetAllUploads(data);
    await Promise.all(
      uploads.map(async (u) => {
        const link = await this.uploadAndGetLink(
          u.rawFile,
          docPath,
          u.fieldSlashesPath,
          !!this.options.useFileNamesInStorage
        );
        set(data, u.fieldDotsPath + ".src", link);
      })
    );
    return data;
  }

  public async addCreatedByFields(obj: any) {
    return AddCreatedByFields(obj, this.fireWrapper, this.rm, this.options);
  }

  public async addUpdatedByFields(obj: any) {
    return AddUpdatedByFields(obj, this.fireWrapper, this.rm, this.options);
  }

  private async uploadAndGetLink(
    rawFile: any,
    docPath: string,
    fieldPath: string,
    useFileName: boolean
  ): Promise<string | undefined> {
    const storagePath = useFileName
      ? joinPaths(docPath, fieldPath, rawFile.name)
      : joinPaths(docPath, fieldPath);
    return this.saveFile(storagePath, rawFile);
  }

  private async saveFile(
    storagePath: string,
    rawFile: any
  ): Promise<string | undefined> {
    log("saveFile() saving file...", { storagePath, rawFile });
    const task = this.fireWrapper.storage().ref(storagePath).put(rawFile);
    try {
      const taskResult: firebase.storage.UploadTaskSnapshot = await new Promise(
        (res, rej) => task.then(res).catch(rej)
      );
      const getDownloadURL = await taskResult.ref.getDownloadURL();
      log("saveFile() saved file", {
        storagePath,
        taskResult,
        getDownloadURL,
      });
      return this.options.relativeFilePaths ? storagePath : getDownloadURL;
    } catch (storageError) {
      if (storageError.code === "storage/unknown") {
        logError(
          'saveFile() error saving file, No bucket found! Try clicking "Get Started" in firebase -> storage',
          { storageError }
        );
      } else {
        logError("saveFile() error saving file", {
          storageError,
        });
      }
    }
  }
}
