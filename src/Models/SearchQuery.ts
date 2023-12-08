import axios from "axios";
import { SearchResult } from "./SearchResult";
import { Environment } from "../environment";

export interface SearchQuery {
    querySearch(count: number): Promise<SearchResult[]>;
}

export class TextSearchQuery implements SearchQuery {
    constructor(public query: string) { }

    async querySearch(count = 20): Promise<SearchResult[]> {
        const response = await axios.get<SearchResult[]>(`${Environment.ApiUrl}/search/text/${encodeURIComponent(this.query)}?count=${count}`);
        return response.data;
        
    }
}

export class ImageSearchQuery implements SearchQuery {
    constructor(public image: File) { }

    async querySearch(count = 20): Promise<SearchResult[]> {
        const formData = new FormData();
        formData.append("image", this.image);
        const response = await axios.post<SearchResult[]>(`${Environment.ApiUrl}/search/image`, formData, {
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