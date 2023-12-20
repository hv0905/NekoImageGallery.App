import { useEffect, useRef, useState } from 'react';
import { SearchResult } from '../Models/SearchResult';
import { ImageGallery } from './ImageGallery';
import { QueryArea } from './QueryArea';
import { SearchQuery } from '../Services/SearchQuery';
import { AuthenticationDialog } from './AuthenticationDialog';
import { WelcomeApi } from '../Services/WelcomeApi';
import { HomeApiResponse } from '../Models/HomeApiResponse';
import { Box, Button, CircularProgress } from '@mui/material';
import { ApiInfo } from './ApiInfo';

export function Home() {
  const activeQuery = useRef<SearchQuery | null>(null);
  const [result, setResult] = useState<SearchResult[] | null>(null);
  const [apiInfo, setApiInfo] = useState<HomeApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);

  function queryNext(reset = false) {
    if (!activeQuery.current) return;
    setLoading(true)
    void activeQuery.current.querySearch(30,reset ? 0 : result?.length ?? 0).then(t => {
      if (reset) {
        console.log("Reset!");
        setResult(t.result);
      } else {
        setResult([...(result ?? []), ...t.result]);
      }
      if (t.result.length < 30) {
        setNoMore(true);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  function search(query: SearchQuery) {
    activeQuery.current = query;
    queryNext(true);
  }

  useEffect(() => {
    void WelcomeApi().then(resp => {
      setApiInfo(resp);
    });
  }, []);

  return (
    <ApiInfo.Provider value={apiInfo}>
      <QueryArea onSubmit={search}></QueryArea>

      {result ? (
        <>
          <ImageGallery
            searchResult={result}
            onSimilarSearch={search}
          ></ImageGallery>
          {loading ? (
            <Box display='flex' justifyContent='center' sx={{width: '100%'}}>
            <CircularProgress sx={{ my: '20px' }} />
            </Box>
          ) : ( !noMore &&
            <Button fullWidth sx={{ my: '20px' }} onClick={() => queryNext()}>
              Load More
            </Button>
          )}
        </>
      ) : null}
      <AuthenticationDialog />
    </ApiInfo.Provider>
  );
}
