import axios from "axios";
import { SearchResult } from "./SearchResult";
import { Environment } from "../environment";

export interface SearchQuery {
    querySearch(count: number): Promise<SearchResult[]>;
}

export class TextSearchQuery implements SearchQuery {
    constructor(public query: string) { }

    async querySearch(count = 20): Promise<SearchResult[]> {
        const response = await axios.get(`${Environment.ApiUrl}/search/text/${encodeURIComponent(this.query)}?count=${count}`);
        return response.data;
        
    }
}