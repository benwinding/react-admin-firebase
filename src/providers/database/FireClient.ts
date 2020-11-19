import { set } from "lodash";
import { joinPaths, log, logError, parseDocGetAllUploads } from "../../misc";
import { RAFirebaseOptions } from "../RAFirebaseOptions";
import { IFirebaseWrapper } from "./firebase/IFirebaseWrapper";
import { IResource, ResourceManager } from "./ResourceManager";

export class FireClient {
  public rm: ResourceManager;

  constructor(
    public fireWrapper: IFirebaseWrapper,
    public options: RAFirebaseOptions
  ) {
    this.rm = new ResourceManager(this.fireWrapper, this.options);
  }

  
  public checkRemoveIdField(obj: any) {
    if (this.options.dontAddIdFieldToDoc) {
      delete obj.id
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
        const link = await this.uploadAndGetLink(u.rawFile, docPath, u.fieldSlashesPath, !!this.options.useFileNamesInStorage);
        set(data, u.fieldDotsPath + '.src', link);
      })
    );
    return data;
  }

  public async addCreatedByFields(obj: any) {
    if (this.options.disableMeta) {
      return;
    }
    const currentUserIdentifier = this.options.associateUsersById ? await this.getCurrentUserId() : await this.getCurrentUserEmail();
    switch (this.options.metaFieldCasing) {
      case 'camel':
        obj.createDate = this.fireWrapper.serverTimestamp();
        obj.createdBy = currentUserIdentifier;
        break;
      case 'snake':
        obj.create_date = this.fireWrapper.serverTimestamp();
        obj.created_by = currentUserIdentifier;
        break;
      case 'pascal':
        obj.CreateDate = this.fireWrapper.serverTimestamp();
        obj.CreatedBy = currentUserIdentifier;
        break;
      case 'kebab':
        obj['create-date'] = this.fireWrapper.serverTimestamp();
        obj['created-by'] = currentUserIdentifier;
        break;
      default:
        obj.createdate = this.fireWrapper.serverTimestamp();
        obj.createdby = currentUserIdentifier;
        break;
    }
  }

  public async addUpdatedByFields(obj: any) {
    if (this.options.disableMeta) {
      return;
    }
    const currentUserIdentifier = this.options.associateUsersById ? await this.getCurrentUserId() : await this.getCurrentUserEmail();
    switch (this.options.metaFieldCasing) {
      case 'camel':
        obj.lastUpdate = this.fireWrapper.serverTimestamp();
        obj.updatedBy = currentUserIdentifier;
        break;
      case 'snake':
        obj.last_update = this.fireWrapper.serverTimestamp();
        obj.updated_by = currentUserIdentifier;
        break;
      case 'pascal':
        obj.LastUpdate = this.fireWrapper.serverTimestamp();
        obj.UpdatedBy = currentUserIdentifier;
        break;
      case 'kebab':
        obj['last-update'] = this.fireWrapper.serverTimestamp();
        obj['updated-by'] = currentUserIdentifier;
        break;
      default:
        obj.lastupdate = this.fireWrapper.serverTimestamp();
        obj.updatedby = currentUserIdentifier;
        break;
    }
  }

  private async uploadAndGetLink(
    rawFile: any,
    docPath: string,
    fieldPath: string,
    useFileName: boolean
  ): Promise<string | undefined> {
    const storagePath = useFileName ? 
      joinPaths(docPath, fieldPath, rawFile.name) : 
      joinPaths(docPath, fieldPath);
    return this.saveFile(storagePath, rawFile);
  }

  private async saveFile(storagePath: string, rawFile: any): Promise<string | undefined> {
    log("saveFile() saving file...", { storagePath, rawFile });
    const task = this.fireWrapper
      .storage()
      .ref(storagePath)
      .put(rawFile);
    try {
      const taskResult: firebase.storage.UploadTaskSnapshot = await new Promise(
        (res, rej) => task.then(res).catch(rej)
      );
      const getDownloadURL = await taskResult.ref.getDownloadURL();
      log("saveFile() saved file", {
        storagePath,
        taskResult,
        getDownloadURL
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
          storageError
        });
      }
    }
  }

  private async getCurrentUserEmail() {
    const user = await this.rm.getUserLogin();
    if (user) {
      return user.email;
    } else {
      return "annonymous user";
    }
  }
  private async getCurrentUserId() {
    const user = await this.rm.getUserLogin();
    if (user) {
      return user.uid;
    } else {
      return "annonymous user";
    }
  }
}