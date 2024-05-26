import {isAxiosError} from 'axios';
import {ErrorProtocol} from '../Models/ApiResponse';
import {UploadTask, UploadTaskStatus} from '../Models/UploadTaskModel';
import {uploadImage} from './AdminApi';

export class UploadService {
  constructor(
    public queue: UploadTask[],
    public workersCount = 4,
    public statusUpdateCallback?: () => void
  ) {}

  private async uploadWorker() {
    for (const item of this.queue) {
      if (item.status != UploadTaskStatus.Pending) {
        continue;
      }
      item.status = UploadTaskStatus.Uploading;
      this.statusUpdateCallback?.();
      try {
        await uploadImage(
          item.file,
          true,
          item.starred,
          item.skipOcr,
          item.categories
        );
        item.status = UploadTaskStatus.Complete;
      } catch (err) {
        if (isAxiosError<ErrorProtocol>(err)) {
          if (!err.response) {
            item.status = UploadTaskStatus.Error;
            item.errorText = 'Network error';
          } else if (err.response.status === 409) {
            item.status = UploadTaskStatus.Duplicate;
            item.errorText = 'Duplicated';
          } else if (
            err.response.status === 400 ||
            err.response.status === 415
          ) {
            item.status = UploadTaskStatus.Error;
            item.errorText = 'Invalid file';
          } else {
            item.status = UploadTaskStatus.Error;
            item.errorText = err.response?.data?.detail ?? 'Unknown error';
          }
        } else {
          item.status = UploadTaskStatus.Error;
          item.errorText = 'Internal error';
        }
        console.error(err);
      } finally {
        this.statusUpdateCallback?.();
      }
    }
  }

  public upload(): Promise<void[]> {
    const threadColl = [];
    for (let i = 0; i < this.workersCount; ++i) {
      threadColl.push(this.uploadWorker());
    }
    return Promise.all(threadColl);
  }
}
