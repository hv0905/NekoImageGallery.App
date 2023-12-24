import { Box, Tab, Tabs } from '@mui/material';
import { SearchQuery } from '../Services/SearchQuery';
import { useContext, useState } from 'react';
import { TextQueryForm } from './TextQueryForm';
import { ImageQueryForm } from './ImageQueryForm';
import { AdvancedQueryForm } from './AdvancedQueryForm';
import { ApiInfo } from './Contexts';

export function QueryArea({
  onSubmit,
}: {
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [tab, setTab] = useState(0);
  const apiInfo = useContext(ApiInfo);

  const ocrAvail = !apiInfo?.available_basis || apiInfo.available_basis.indexOf('ocr') >= 0;

  const inputs = [
    <TextQueryForm key={0} onSubmit={onSubmit} />,
    <ImageQueryForm key={2} onSubmit={onSubmit} />,
    <AdvancedQueryForm key={3} onSubmit={onSubmit}/>
  ];

  if (ocrAvail) {
    inputs.splice(1, 0, <TextQueryForm key={1} onSubmit={onSubmit} ocrSearch />);
  }

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
        {ocrAvail && <Tab label="OCR" />}
        <Tab label="Image" />
        <Tab label="Advanced"/>
      </Tabs>
      {inputs[tab]}
    </Box>
  );
}
