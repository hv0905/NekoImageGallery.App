import {DuplicateValidationResponse} from '../Models/AdminModels';
import {NekoProtocol} from '../Models/ApiResponse';
import {getClient} from './Base';

export function deleteImage(id: string) {
  return getClient().delete<NekoProtocol>(`/admin/delete/${id}`);
}

export function updateOpt(id: string, starred: boolean) {
  return getClient().put<NekoProtocol>(`/admin/update_opt/${id}`, {starred});
}

export function uploadImage(
  file: File,
  local = true,
  starred = false,
  skipOcr = false,
  categories = '',
  comments: string | undefined = undefined
) {
  const formData = new FormData();
  formData.append('image_file', file);
  return getClient().post<NekoProtocol>('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      local,
      starred,
      skip_ocr: skipOcr,
      categories,
      comments,
    },
  });
}

export function duplicationValidate(hashes: string[]) {
  return getClient().post<DuplicateValidationResponse>('/admin/duplication_validate', {
    hashes,
  });
}
