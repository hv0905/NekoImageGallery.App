import { createContext, useEffect, useState } from 'react';
import { SearchResult } from '../Models/SearchResult';
import { ImageGallery } from './ImageGallery';
import { QueryArea } from './QueryArea';
import { SearchQuery } from '../Services/SearchQuery';
import { AuthenticationDialog } from './AuthenticationDialog';
import { WelcomeApi } from '../Services/WelcomeApi';
import { HomeApiResponse } from '../Models/HomeApiResponse';

export const ApiInfo = createContext<HomeApiResponse | null>(null);

export function Home() {
  const [result, setResult] = useState<SearchResult[] | null>(null);
  const [apiInfo, setApiInfo] = useState<HomeApiResponse | null>(null);

  function search(query: SearchQuery) {
    void query.querySearch(30).then(t => {
      setResult(t.result);
    });
  }

  useEffect(() => {
    void WelcomeApi().then(resp => {
      setApiInfo(resp);
    })
  }, [])

  return (
    <ApiInfo.Provider value={apiInfo}>
      <QueryArea onSubmit={search}></QueryArea>

      {result ? (
        <ImageGallery
          searchResult={result}
          onSimilarSearch={search}
        ></ImageGallery>
      ) : null}

      <AuthenticationDialog/>
    </ApiInfo.Provider>
  );
}
