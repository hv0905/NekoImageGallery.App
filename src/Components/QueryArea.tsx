import { Box, Tab, Tabs } from '@mui/material';
import { SearchQuery } from '../Services/SearchQuery';
import { useState } from 'react';
import { TextQueryForm } from './TextQueryForm';
import { ImageQueryForm } from './ImageQueryForm';

export function QueryArea({
  onSubmit,
}: {
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [tab, setTab] = useState(0);

  const inputs = [
    <TextQueryForm key={0} onSubmit={onSubmit} />,
    <ImageQueryForm key={1} onSubmit={onSubmit} />,
  ];

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        justifyItems: 'center',
        alignItems: 'center',
        gap: 1.5,
        padding: 1,
      }}
    >
      <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
        <Tab label="Text Search" />
        <Tab label="Image Search" />
      </Tabs>
      {inputs[tab]}
    </Box>
  );
}
