import {Search} from '@mui/icons-material';
import {
  Button,
  ButtonGroup,
  Collapse,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import {AdvancedSearchQuery, CombinedSearchQuery, SearchQuery} from '../Services/SearchQuery';
import {FormEvent, useContext, useState} from 'react';
import {
  AdvancedSearchMode,
  AdvancedSearchModel,
  CombinedSearchModel,
} from '../Models/AdvancedSearchModel';
import {SearchBasis} from '../Models/SearchBasis';
import {ApiInfo} from './Contexts';
import {LabelledSwitch} from './LabelledSwitch';

export function AdvancedQueryForm({
  onSubmit,
}: {
  availModes?: string[];
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [combinedSearch, setCombinedSearch] = useState(false);
  const [combinedSearchPrompt, setCombinedSearchPrompt] = useState('');
  const [mode, setMode] = useState<AdvancedSearchMode>(AdvancedSearchMode.average);
  const [basis, setBasis] = useState<SearchBasis>(SearchBasis.vision);
  const apiInfo = useContext(ApiInfo);

  const ocrAvail = !apiInfo?.available_basis || apiInfo.available_basis.indexOf('ocr') >= 0;

  const submitable =
    (positivePrompt.length > 0 || negativePrompt.length > 0) &&
    (!combinedSearch || combinedSearchPrompt.length > 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form: AdvancedSearchModel = {
      criteria: positivePrompt
        .split(',')
        .map(s => s.trim())
        .filter(s => s),
      negative_criteria: negativePrompt
        .split(',')
        .map(s => s.trim())
        .filter(s => s),
      mode: mode,
    };
    if (combinedSearch) {
      const combinedForm: CombinedSearchModel = {
        ...form,
        extra_prompt: combinedSearchPrompt,
      };
      onSubmit?.(new CombinedSearchQuery(combinedForm, basis));
    } else {
      onSubmit?.(new AdvancedSearchQuery(form, basis));
    }
  }

  return (
    <Stack component='form' spacing={2} sx={{width: '100%'}} onSubmit={handleSubmit}>
      <TextField
        label='Positive criteria (seperated by comma)'
        variant='outlined'
        value={positivePrompt}
        fullWidth
        onChange={e => setPositivePrompt(e.target.value)}
      />
      <TextField
        label='Negative criteria (seperated by comma)'
        variant='outlined'
        value={negativePrompt}
        color='secondary'
        fullWidth
        onChange={e => setNegativePrompt(e.target.value)}
      />
      <RadioGroup
        row
        aria-labelledby='mode-sel-group'
        value={mode}
        onChange={e => setMode(e.target.value as AdvancedSearchMode)}
      >
        <FormLabel id='mode-sel-group' sx={{alignSelf: 'center', marginX: 2}}>
          Mode
        </FormLabel>
        <FormControlLabel value='average' control={<Radio />} label='Average' />
        <FormControlLabel value='best' control={<Radio />} label='Best' />
      </RadioGroup>
      {ocrAvail && (
        <>
          <RadioGroup
            row
            aria-labelledby='basis-sel-group'
            value={basis}
            onChange={e => setBasis(e.target.value as SearchBasis)}
          >
            <FormLabel id='basis-sel-group' sx={{alignSelf: 'center', marginX: 2}}>
              Basis
            </FormLabel>
            <FormControlLabel value='vision' control={<Radio />} label='Vision' />
            <FormControlLabel value='ocr' control={<Radio />} label='OCR' />
          </RadioGroup>
          <Tooltip
            title='[Experimental] With this feature, besides the basis you have choosen before,
                  you can add up to one criteria with the other basis to enhance your search result. 
                  For example, you can search `Good Morning` with OCR search, than add `1girl` in the 
                  combined search cirteria to filter all the good-morning stickers with a girl in it.'
          >
            <LabelledSwitch
              checked={combinedSearch}
              onCheckedChange={e => setCombinedSearch(e)}
              label='Combined Search'
            />
          </Tooltip>
          <Collapse in={combinedSearch}>
            <TextField
              label='Combined search criteria'
              variant='outlined'
              value={combinedSearchPrompt}
              fullWidth
              onChange={e => setCombinedSearchPrompt(e.target.value)}
            />
          </Collapse>
        </>
      )}
      <ButtonGroup fullWidth>
        <Button variant='outlined' sx={{width: '30%'}}>
          Reset
        </Button>
        <Button
          type='submit'
          variant='contained'
          disabled={!submitable}
          endIcon={<Search />}
          sx={{width: '70%'}}
        >
          Search
        </Button>
      </ButtonGroup>
    </Stack>
  );
}
