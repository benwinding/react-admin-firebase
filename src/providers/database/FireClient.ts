import { set, get } from "lodash";
import { TASK_CANCELED, TASK_PAUSED, TASK_RUNNING } from "../../misc/firebase-models";
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
    try {
      const { task, taskResult, downloadUrl } = this.fireWrapper.putFile(storagePath, rawFile);
      const { name } = rawFile;
      // monitor upload status & progress
      dispatch('FILE_UPLOAD_WILL_START', name);
      task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        log('Upload is ' + progress + '% done');
        dispatch('FILE_UPLOAD_PROGRESS', name, progress);
        switch (snapshot.state) {
          case TASK_PAUSED:
            log('Upload is paused');
            dispatch('FILE_UPLOAD_PAUSED', name);
            break;
          case TASK_RUNNING:
            log('Upload is running');
            dispatch('FILE_UPLOAD_RUNNING', name);
            break;
          case TASK_CANCELED:
            log('Upload has been canceled');
            dispatch('FILE_UPLOAD_CANCELED', name);
            break;
          // case storage.TaskState.ERROR:
            // already handled by catch
          // case storage.TaskState.SUCCESS:
            // already handled by then
        }
      });
      const [getDownloadURL] = await Promise.all([
        downloadUrl,
        taskResult,
      ]);
      dispatch('FILE_UPLOAD_COMPLETE', name);
      dispatch('FILE_SAVED', name);
      log("saveFile() saved file", {
        storagePath,
        taskResult,
        getDownloadURL,
      });
      return this.options.relativeFilePaths ? storagePath : getDownloadURL;
    } catch (storageError) {
      if (get(storageError, 'code') === "storage/unknown") {
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
