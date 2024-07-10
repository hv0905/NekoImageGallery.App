import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {SearchResult} from '../Models/SearchResult';
import {ImageGallery} from './ImageGallery';
import {QueryArea} from './QueryArea';
import {SearchQuery} from '../Services/SearchQuery';
import {AuthenticationDialog} from './AuthenticationDialog';
import {Box, Button, CircularProgress, Collapse} from '@mui/material';
import {AppSettings} from './Contexts';
import {FilterForm} from './FilterForm';
import {SearchFilterOptions} from '../Models/SearchFilterOptions';

export function Home() {
  const activeQuery = useRef<SearchQuery | null>(null);
  const [searchHistory, setSearchHistory] = useState([] as SearchQuery[]);
  const [result, setResult] = useState<SearchResult[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(true);

  const [appSettings] = useContext(AppSettings);

  const filterOptions = useRef<SearchFilterOptions | null>(null);

  const queryNext = useCallback(
    (reset = false) => {
      if (!activeQuery.current) return;
      setLoading(true);
      void activeQuery.current
        .querySearch(30, reset ? 0 : result?.length ?? 0)
        .then(t => {
          if (reset) {
            setResult(t.result);
            setTimeout(() => {
              window.scrollTo({top: 0, behavior: 'smooth'});
            }, 0);
          } else {
            // In a very rare situation, if two image are same, which means their score is literally equal (lets say it p_1 and p_2, p1.score = p2.score),
            // and p_1 is the last result of previous request.
            // The last result of the previous request may be the same as the first (or second) result of the next request.
            // Previous query: [..., p1], Next query: [p2, p1, ...], the result will be [..., p1, p2, p1, ...], which will break the uniqueness of the result ID.
            // So a distinct is required.
            setResult(
              [...(result ?? []), ...t.result].filter(
                (v, i, a) => a.findIndex(t => t.img.id === v.img.id) === i
              )
            );
          }
          if (t.result.length < 30) {
            setNoMore(true);
          } else {
            setNoMore(false);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [result]
  );

  function search(query: SearchQuery, logInHistory = true) {
    query.filterOptions = appSettings.useFilter ? filterOptions.current : null;
    activeQuery.current = query;
    if (logInHistory) {
      setSearchHistory([...searchHistory, query]);
    }
    queryNext(true);
  }

  useEffect(() => {
    if (appSettings.autoPaging && result && !noMore && !loading) {
      const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
          window.removeEventListener('scroll', handleScroll); // Remove the event immediately to prevent multiple queryNext() calls.
          queryNext();
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [noMore, queryNext, result, appSettings, loading]);

  return (
    <>
      <QueryArea
        onSubmit={search}
        searchHistory={searchHistory}
        onClearHistory={() => setSearchHistory([])}
      ></QueryArea>
      <Collapse in={appSettings.useFilter}>
        <FilterForm onChange={v => (filterOptions.current = v)} />
      </Collapse>

      {result && (
        <ImageGallery searchResult={result} setSearchResult={setResult} onSimilarSearch={search} />
      )}
      {loading ? (
        <Box display='flex' justifyContent='center' sx={{width: '100%'}}>
          <CircularProgress sx={{my: '20px'}} />
        </Box>
      ) : (
        !noMore && (
          <Button fullWidth sx={{my: '20px'}} onClick={() => queryNext()}>
            Load More
          </Button>
        )
      )}
      <AuthenticationDialog />
    </>
  );
}
