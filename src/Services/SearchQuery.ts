import {AdvancedSearchModel, CombinedSearchModel} from '../Models/AdvancedSearchModel';
import {Image} from '../Models/Image';
import { MixedSearchModel } from '../Models/MixedSearchModel';
import {SearchApiResponse} from '../Models/SearchApiResponse';
import {SearchBasis} from '../Models/SearchBasis';
import {SearchFilterOptions} from '../Models/SearchFilterOptions';
import {getClient} from './Base';

export abstract class SearchQuery {
  public filterOptions: SearchFilterOptions | null = null;

  abstract querySearch(count: number, skip: number): Promise<SearchApiResponse>;

  public getFilterOptions(): SearchFilterOptions | null {
    return this.filterOptions;
  }
}

export class TextSearchQuery extends SearchQuery {
  constructor(
    public query: string,
    public searchBasis: SearchBasis = SearchBasis.vision,
    public exact = false
  ) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(
      `/search/text/${encodeURIComponent(this.query)}`,
      {
        params: {
          count: count,
          skip: skip,
          basis: this.searchBasis,
          exact: this.exact || undefined,
          ...this.getFilterOptions(),
        },
      }
    );
    return response.data;
  }
}

export class ImageSearchQuery extends SearchQuery {
  constructor(public image: Blob) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const formData = new FormData();
    formData.append('image', this.image);
    const response = await getClient().post<SearchApiResponse>(`/search/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        count: count,
        skip: skip,
        ...this.getFilterOptions(),
      },
    });
    return response.data;
  }
}

export class SimilarSearchQuery extends SearchQuery {
  constructor(
    public img: Image,
    public searchBasis: SearchBasis = SearchBasis.vision
  ) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(
      `/search/similar/${encodeURIComponent(this.img.id)}`,
      {
        params: {
          count: count,
          skip: skip,
          basis: this.searchBasis,
          ...this.getFilterOptions(),
        },
      }
    );
    return response.data;
  }
}

export class MixedSearchQuery extends SearchQuery {

  constructor(
    public text: string,
    public image: Image | Blob) {
      super();
    }

    async querySearch(count: number, skip: number): Promise<SearchApiResponse> {
      const model: MixedSearchModel = {
        text: this.text,
      };

      if (this.image instanceof Blob) {
        model.image_b64encoded = await blobToBase64(this.image);
      } else {
        model.similar_with_id = this.image.id;
      }

      const response = await getClient().post<SearchApiResponse>(
        `/search/mixed`,
        model,
        {
          params: {
            count: count,
            skip: skip,
            ...this.getFilterOptions(),
          },
        }
      );
      return response.data;
    }
}

export class RandomSearchQuery extends SearchQuery {
  public seed?: number;
  constructor(reproducible = true) {
    super();
    if (reproducible) {
      this.seed = Math.floor(Math.random() * Math.pow(2, 31));
    }
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(`/search/random`, {
      params: {
        seed: this.seed,
        count,
        skip,
        ...this.getFilterOptions(),
      },
    });
    return response.data;
  }
}

export class AdvancedSearchQuery extends SearchQuery {
  constructor(
    public searchModel: AdvancedSearchModel,
    public searchBasis: SearchBasis = SearchBasis.vision
  ) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().post<SearchApiResponse>(
      `/search/advanced`,
      this.searchModel,
      {
        params: {
          count: count,
          skip: skip,
          basis: this.searchBasis,
          ...this.getFilterOptions(),
        },
      }
    );
    return response.data;
  }
}

export class CombinedSearchQuery extends SearchQuery {
  constructor(
    public searchModel: CombinedSearchModel,
    public searchBasis: SearchBasis = SearchBasis.vision
  ) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().post<SearchApiResponse>(
      `/search/combined`,
      this.searchModel,
      {
        params: {
          count: count,
          skip: skip,
          basis: this.searchBasis,
          ...this.getFilterOptions(),
        },
      }
    );
    return response.data;
  }
}
