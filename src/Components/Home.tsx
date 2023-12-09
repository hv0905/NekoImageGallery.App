import { useState } from "react";
import { SearchResult } from "../Models/SearchResult";
import { ImageGallery } from "./ImageGallery";
import { QueryArea } from "./QueryArea";
import { SearchQuery } from "../Models/SearchQuery";

export function Home() {
    const [result, setResult] = useState<SearchResult[] | null>(null)

    function search(query: SearchQuery) {
        void query.querySearch(20).then(t => {
            setResult(t.result)
        });
    }

    return (
        <>
        <QueryArea onSubmit={search}></QueryArea>
        {result ? <ImageGallery searchResult={result}></ImageGallery> : null}
        </>
    )
}