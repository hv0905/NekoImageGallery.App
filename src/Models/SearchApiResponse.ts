import { SearchResult } from './SearchResult';

export interface SearchApiResponse {
  query_id: string;
  message: string;
  result: SearchResult[];
}
