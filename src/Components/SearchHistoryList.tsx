import {Box, Button, Chip, List, ListItem, ListItemButton, Paper, Typography} from '@mui/material';
import type {ChipProps} from '@mui/material';
import {
  AdvancedSearchQuery,
  CombinedSearchQuery,
  ImageSearchQuery,
  RandomSearchQuery,
  SearchQuery,
  SimilarSearchQuery,
  TextSearchQuery,
} from '../Services/SearchQuery';
import {useEffect, useState} from 'react';
import {
  AutoFixHighTwoTone,
  Casino,
  ClearAll,
  HistoryToggleOff,
  ImageSearchTwoTone,
  TextsmsTwoTone,
} from '@mui/icons-material';
import {SearchBasis} from '../Models/SearchBasis';

function TextSearchRecord({query}: {query: TextSearchQuery}) {
  return (
    <>
      <TextsmsTwoTone />
      <Chip
        label={`${query.searchBasis}${query.exact ? ':exact' : ''}`}
        color={query.searchBasis === SearchBasis.vision ? 'primary' : 'secondary'}
      />
      <Typography>{query.query}</Typography>
    </>
  );
}

function RandomPickRecord() {
  return (
    <>
      <Casino />
      <Chip label='random'></Chip>
    </>
  );
}

function ImageBaseSearchRecord({
  imgUrl,
  modeDesc,
  modeColor = 'default',
}: {
  imgUrl: string;
  modeDesc: string;
  modeColor: ChipProps['color'];
}) {
  return (
    <>
      <ImageSearchTwoTone />
      <Chip label={modeDesc} color={modeColor} />
      <Box height={100} sx={{overflow: 'hidden', borderRadius: '4px', maxWidth: 400}}>
        <img
          src={imgUrl}
          style={{
            height: '100%',
          }}
          alt='searched image'
        />
      </Box>
    </>
  );
}

function ImageSearchRecord({query}: {query: ImageSearchQuery}) {
  const [imgUrl, setImgUrl] = useState<string>('');
  useEffect(() => {
    const url = URL.createObjectURL(query.image);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [query]);
  return <ImageBaseSearchRecord imgUrl={imgUrl} modeDesc='image' modeColor='primary' />;
}

function SimilarSearchRecord({query}: {query: SimilarSearchQuery}) {
  return (
    <ImageBaseSearchRecord
      imgUrl={query.img.thumbnail_url ?? query.img.url}
      modeDesc='similar'
      modeColor='secondary'
    />
  );
}

function AdvancedSearchRecord({query}: {query: AdvancedSearchQuery | CombinedSearchQuery}) {
  return (
    <>
      <AutoFixHighTwoTone />
      <Chip label={'advanced: ' + query.searchBasis} />
      {!!query.searchModel.criteria.length && (
        <Chip label={'pos: ' + query.searchModel.criteria.join(', ')} color='primary' />
      )}
      {!!query.searchModel.negative_criteria.length && (
        <Chip label={'neg: ' + query.searchModel.negative_criteria.join(', ')} color='secondary' />
      )}
      {query instanceof CombinedSearchQuery && (
        <Chip label={'combined: ' + query.searchModel.extra_prompt} color='info'></Chip>
      )}
    </>
  );
}

function SearchRecord({query}: {query: SearchQuery}) {
  if (query instanceof TextSearchQuery) {
    return <TextSearchRecord query={query} />;
  } else if (query instanceof ImageSearchQuery) {
    return <ImageSearchRecord query={query} />;
  } else if (query instanceof SimilarSearchQuery) {
    return <SimilarSearchRecord query={query} />;
  } else if (query instanceof AdvancedSearchQuery || query instanceof CombinedSearchQuery) {
    return <AdvancedSearchRecord query={query} />;
  } else if (query instanceof RandomSearchQuery) {
    return <RandomPickRecord />;
  }
  throw new Error('Unknown search type');
}

export function SearchHistoryList({
  history,
  onSubmit,
  onClear,
}: {
  history: SearchQuery[];
  onSubmit: (query: SearchQuery, logInHistory?: boolean) => void;
  onClear: () => void;
}) {
  return (
    <Paper sx={{width: '100%', height: '300px'}}>
      {history.length ? (
        <List sx={{overflowY: 'auto', height: '100%'}}>
          {history
            .map((t, i) => (
              <ListItem key={i}>
                <ListItemButton onClick={() => onSubmit(t, false)} sx={{display: 'flex', gap: 1}}>
                  <SearchRecord query={t} />
                </ListItemButton>
              </ListItem>
            ))
            .reverse()}
          <ListItem key={-1}>
            <Button variant='text' fullWidth startIcon={<ClearAll />} onClick={onClear}>
              clear all
            </Button>
          </ListItem>
        </List>
      ) : (
        <Box
          display='flex'
          flexDirection='column'
          height='100%'
          justifyContent='center'
          alignItems='center'
          gap={3}
        >
          <HistoryToggleOff sx={{width: 100, height: 100}} />
          <Typography>No history. Try searching for something first. 🍵</Typography>
        </Box>
      )}
    </Paper>
  );
}
