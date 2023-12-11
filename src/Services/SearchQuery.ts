import { SearchApiResponse } from '../Models/SearchApiResponse';
import { getClient } from './Base';

export abstract class SearchQuery {
  abstract querySearch(count: number): Promise<SearchApiResponse>;
}

export class TextSearchQuery extends SearchQuery {
  constructor(public query: string) {
    super();
  }

  async querySearch(count = 20): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(
      `/search/text/${encodeURIComponent(this.query)}?count=${count}`
    );
    return response.data;
  }
}

export class ImageSearchQuery extends SearchQuery {
  constructor(public image: File) {
    super();
  }

  async querySearch(count = 20): Promise<SearchApiResponse> {
    const formData = new FormData();
    formData.append('image', this.image);
    const response = await getClient().post<SearchApiResponse>(
      `/search/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          count: count,
        },
      }
    );
    return response.data;
  }
}

export class SimilarSearchQuery extends SearchQuery {
  constructor(public id: string) {
    super();
  }

  async querySearch(count = 20): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(
      `/search/similar/${encodeURIComponent(this.id)}?count=${count}`
    );
    return response.data;
  }
}

export class RandomSearchQuery extends SearchQuery {
  constructor() {
    super();
  }

  async querySearch(count = 20): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(
      `/search/random?count=${count}`
    );
    return response.data;
  }
}
