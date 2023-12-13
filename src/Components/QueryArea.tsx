import { Box, Tab, Tabs } from '@mui/material';
import { SearchQuery } from '../Services/SearchQuery';
import { useState } from 'react';
import { TextQueryForm } from './TextQueryForm';
import { ImageQueryForm } from './ImageQueryForm';
import { AdvancedQueryForm } from './AdvancedQueryForm';

export function QueryArea({
  onSubmit,
}: {
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [tab, setTab] = useState(0);

  const inputs = [
    <TextQueryForm key={0} onSubmit={onSubmit} />,
    <TextQueryForm key={1} onSubmit={onSubmit} ocrSearch />,
    <ImageQueryForm key={2} onSubmit={onSubmit} />,
    <AdvancedQueryForm key={3} onSubmit={onSubmit}/>
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
      <Tabs variant='scrollable' value={tab} onChange={(_, v: number) => setTab(v)}>
        <Tab label="Text" />
        <Tab label="OCR" />
        <Tab label="Image" />
        <Tab label="Advanced"/>
      </Tabs>
      {inputs[tab]}
    </Box>
  );
}
