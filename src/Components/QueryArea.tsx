import {Box, Tab, Tabs} from '@mui/material';
import {SearchQuery} from '../Services/SearchQuery';
import {useContext, useState} from 'react';
import {TextQueryForm} from './TextQueryForm';
import {ImageQueryForm} from './ImageQueryForm';
import {AdvancedQueryForm} from './AdvancedQueryForm';
import {ApiInfo} from './Contexts';
import {History} from '@mui/icons-material';
import {SearchHistoryList} from './SearchHistoryList';

export function QueryArea({
  onSubmit,
  searchHistory,
  onClearHistory,
}: {
  onSubmit: (query: SearchQuery, logInHistory?: boolean) => void;
  searchHistory: SearchQuery[];
  onClearHistory: () => void;
}) {
  const [tab, setTab] = useState(1);
  const apiInfo = useContext(ApiInfo);

  const ocrAvail = !apiInfo?.available_basis || apiInfo.available_basis.includes('ocr');

  const inputs = [
    <SearchHistoryList
      history={searchHistory}
      onSubmit={onSubmit}
      key={0}
      onClear={onClearHistory}
    />,
    <TextQueryForm key={1} onSubmit={onSubmit} />,
    ...(ocrAvail ? [<TextQueryForm key={2} onSubmit={onSubmit} ocrSearch />] : []),
    <ImageQueryForm key={3} onSubmit={onSubmit} />,
    <AdvancedQueryForm key={4} onSubmit={onSubmit} />,
  ];

  return (
    <Box
      display='flex'
      sx={{
        flexDirection: 'column',
        justifyItems: 'center',
        alignItems: 'center',
        gap: 1.5,
        padding: 1,
      }}
    >
      <Tabs
        variant='scrollable'
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{maxWidth: '100%'}}
      >
        <Tab icon={<History />} sx={{minWidth: 0}} />
        <Tab label='Text' />
        {ocrAvail && <Tab label='OCR' />}
        <Tab label='Image' />
        <Tab label='Advanced' />
      </Tabs>
      {inputs[tab]}
    </Box>
  );
}
