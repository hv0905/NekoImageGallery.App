import { Search, Casino } from '@mui/icons-material';
import { Box, TextField, Button, IconButton } from '@mui/material';
import {
  RandomSearchQuery,
  SearchQuery,
  TextSearchQuery,
} from '../Services/SearchQuery';
import { useState } from 'react';

export function TextQueryForm({
  onSubmit,
}: {
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [textPrompt, setTextPrompt] = useState('');

  const handleTextSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(new TextSearchQuery(textPrompt));
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
        GO
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
