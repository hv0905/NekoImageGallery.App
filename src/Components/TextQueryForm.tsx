import { Search, Casino } from '@mui/icons-material';
import { Box, TextField, Button, IconButton } from '@mui/material';
import {
  RandomSearchQuery,
  SearchQuery,
  TextSearchQuery,
} from '../Services/SearchQuery';
import { useState } from 'react';
import { SearchBasis } from '../Models/SearchBasis';

export function TextQueryForm({
  ocrSearch = false,
  onSubmit,
}: {
  ocrSearch?: boolean
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [textPrompt, setTextPrompt] = useState('');

  const handleTextSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(new TextSearchQuery(textPrompt, ocrSearch ? SearchBasis.ocr : SearchBasis.vision));
  };

  return (
    <Box
      component="form"
      sx={{ width: '100%', display: 'flex', gap: 1 }}
      onSubmit={handleTextSubmit}
    >
      <TextField
        sx={{ flexGrow: 1 }}
        label="Search..."
        placeholder={ocrSearch ? 'Keyword for text that image contains (Chinese / English)' : 'Natural language to describe image content (English only)'}
        variant="outlined"
        value={textPrompt}
        onChange={e => setTextPrompt(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={textPrompt.length < 3}
        sx={{ width: 'clamp(80px, 10%, 200px)' }}
        size="large"
        endIcon={<Search />}
      >
        {ocrSearch ? "OCR" : "GO"}
      </Button>
      <IconButton
        aria-label="random-pick"
        size="large"
        title="Random pick"
        onClick={() => onSubmit?.(new RandomSearchQuery())}
      >
        <Casino />
      </IconButton>
    </Box>
  );
}
