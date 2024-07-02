import {NekoProtocol} from './ApiResponse';

export interface ImageOptUpdateModel {
  starred?: boolean;
  categories?: string[];
}

export interface DuplicateValidationResponse extends NekoProtocol {
  entity_ids: string[];
  exists: boolean[];
}
