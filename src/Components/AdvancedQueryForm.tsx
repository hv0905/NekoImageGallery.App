import { Search } from '@mui/icons-material';
import {
  Button,
  ButtonGroup,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material';
import { AdvancedSearchQuery, SearchQuery } from '../Services/SearchQuery';
import { useState } from 'react';
import {
  AdvancedSearchMode,
  AdvancedSearchModel,
} from '../Models/AdvancedSearchModel';
import { SearchBasis } from '../Models/SearchBasis';

export function AdvancedQueryForm({
  onSubmit,
}: {
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [mode, setMode] = useState<AdvancedSearchMode>(AdvancedSearchMode.average);
  const [basis, setBasis] = useState<SearchBasis>(SearchBasis.vision);

  const submitable = positivePrompt.length > 0 || negativePrompt.length > 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form: AdvancedSearchModel = {
      criteria: positivePrompt.split(',').map(s => s.trim()),
      negative_criteria: negativePrompt.split(',').map(s => s.trim()),
      mode: mode,
    };
    onSubmit?.(new AdvancedSearchQuery(form, basis));
  }

  return (
    <Stack
      component="form"
      spacing={2}
      sx={{ width: '100%' }}
      onSubmit={handleSubmit}
    >
      <TextField
        sx={{ flexGrow: 1 }}
        label="Positive criteria (seperated by comma)"
        variant="outlined"
        value={positivePrompt}
        fullWidth
        onChange={e => setPositivePrompt(e.target.value)}
      />
      <TextField
        sx={{ flexGrow: 1 }}
        label="Negative criteria (seperated by comma)"
        variant="outlined"
        value={negativePrompt}
        color="secondary"
        fullWidth
        onChange={e => setNegativePrompt(e.target.value)}
      />
      <RadioGroup
        row
        aria-labelledby="mode-sel-group"
        value={mode}
        onChange={e => setMode(e.target.value as AdvancedSearchMode)}
      >
        <FormLabel id="mode-sel-group" sx={{ alignSelf: 'center', marginX: 2 }}>
          Mode
        </FormLabel>
        <FormControlLabel value="average" control={<Radio />} label="Average" />
        <FormControlLabel value="best" control={<Radio />} label="Best" />
      </RadioGroup>
      <RadioGroup
        row
        aria-labelledby="basis-sel-group"
        value={basis}
        onChange={e => setBasis(e.target.value as SearchBasis)}
      >
        <FormLabel id="basis-sel-group" sx={{ alignSelf: 'center', marginX: 2 }}>
          Basis
        </FormLabel>
        <FormControlLabel value="vision" control={<Radio />} label="Vision" />
        <FormControlLabel value="ocr" control={<Radio />} label="OCR" />
      </RadioGroup>
      <ButtonGroup fullWidth>
        <Button variant="outlined" sx={{ width: '30%' }}>
          Reset
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!submitable}
          endIcon={<Search />}
          sx={{ width: '70%' }}
        >
          Search
        </Button>
      </ButtonGroup>
    </Stack>
  );
}
