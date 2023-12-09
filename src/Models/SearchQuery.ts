import axios from "axios";
import { Environment } from "../environment";
import { SearchApiResponse } from "./SearchApiResponse";

export abstract class SearchQuery {
    abstract querySearch(count: number): Promise<SearchApiResponse>;
}

export class TextSearchQuery extends SearchQuery {
    constructor(public query: string) {
        super();
    }

    async querySearch(count = 20): Promise<SearchApiResponse> {
        const response = await axios.get<SearchApiResponse>(`${Environment.ApiUrl}/search/text/${encodeURIComponent(this.query)}?count=${count}`);
        return response.data;
        
    }
}

export class ImageSearchQuery extends SearchQuery {
    constructor(public image: File) {
        super();
    }

    async querySearch(count = 20): Promise<SearchApiResponse> {
        const formData = new FormData();
        formData.append("image", this.image);
        const response = await axios.post<SearchApiResponse>(`${Environment.ApiUrl}/search/image`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            params: {
                count: count
            }
        });
        return response.data;
    }
}

export class SimilarSearchQuery extends SearchQuery {
    constructor(public id: string) {
        super();
    }

    async querySearch(count = 20): Promise<SearchApiResponse> {
        const response = await axios.get<SearchApiResponse>(`${Environment.ApiUrl}/search/similar/${encodeURIComponent(this.id)}?count=${count}`);
        return response.data;
    }
}