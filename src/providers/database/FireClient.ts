import { storage } from "firebase/app";
import { set } from "lodash";
import {
  AddCreatedByFields,
  AddUpdatedByFields,
  IFirestoreLogger,
  joinPaths,
  log,
  logError,
  parseDocGetAllUploads,
  dispatch,
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
    public options: RAFirebaseOptions,
    public flogger: IFirestoreLogger
  ) {
    this.rm = new ResourceManager(this.fireWrapper, this.options, this.flogger);
  }

  public checkRemoveIdField(obj: any, docId: string) {
    if (!this.options.dontAddIdFieldToDoc) {
      obj.id = docId;
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
    const { name } = rawFile;
    dispatch('FILE_UPLOAD_WILL_START', name);
    const task = this.fireWrapper.storage().ref(storagePath).put(rawFile);
    // monitor upload status & progress
    task.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      log('Upload is ' + progress + '% done');
      dispatch('FILE_UPLOAD_PROGRESS', name, progress);
      switch (snapshot.state) {
        case storage.TaskState.PAUSED:
          log('Upload is paused');
          dispatch('FILE_UPLOAD_PAUSED', name);
          break;
        case storage.TaskState.RUNNING:
          log('Upload is running');
          dispatch('FILE_UPLOAD_START', name);
          break;
        case storage.TaskState.CANCELED:
          log('Upload has been canceled');
          dispatch('FILE_UPLOAD_CANCELED', name);
          break;
        // case storage.TaskState.ERROR:
          // already handled by catch
        // case storage.TaskState.SUCCESS:
          // already handled by then
      }
    });
    try {
      const taskResult: firebase.storage.UploadTaskSnapshot = await new Promise(
        (res, rej) => task.then(res).catch(rej)
      );
      dispatch('FILE_UPLOAD_COMPLETE', name);
      const getDownloadURL = await taskResult.ref.getDownloadURL();
      dispatch('FILE_SAVED', name);
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
