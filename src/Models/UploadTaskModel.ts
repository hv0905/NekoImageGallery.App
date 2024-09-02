export enum UploadTaskStatus {
  Pending = 'pending',
  Uploading = 'uploading',
  Complete = 'complete',
  Error = 'error',
  Duplicate = 'duplicate',
}

export class UploadTask {
  private static counter = 0;
  public errorText = '';
  public readonly id: number;

  constructor(
    public file: File,
    public uploadName = '',
    public progress = 0,
    public status: UploadTaskStatus = UploadTaskStatus.Pending,
    public categories = '',
    public starred = false,
    public selected = false,
    public skipOcr = false
  ) {
    this.id = UploadTask.counter++;
    this.uploadName = this.uploadName || file.webkitRelativePath || file.name; // webkitRelativePath is empty string when not in a directory
  }
}
