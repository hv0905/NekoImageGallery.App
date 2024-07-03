import {Autocomplete, Box, Collapse, Paper, TextField} from '@mui/material';
import {useEffect, useState} from 'react';
import {SearchFilterOptions} from '../Models/SearchFilterOptions';
import {StrictNumberInput} from './StrictInputs';
import {LabelledSwitch} from './LabelledSwitch';

const commonAspectRatios = [
  '9:32',
  '9:21',
  '9:16',
  '10:16',
  '2:3',
  '3:4',
  '1:1',
  '4:3',
  '3:2',
  '16:10',
  '16:9',
  '21:9',
  '32:9',
];

function aspectRatioTextToNumber(aspectRatio: string) {
  let result = -1;
  if (/^\d+:\d+$/.test(aspectRatio)) {
    const [a, b] = aspectRatio.split(':');
    result = Number(a) / Number(b);
  } else if (/^\d+(\.\d+)?$/.test(aspectRatio)) {
    result = Number(aspectRatio);
  }
  if (result > 0) {
    return result;
  } else {
    return -1;
  }
}

export function FilterForm({onChange}: {onChange?: (newFilterModel: SearchFilterOptions) => void}) {
  const [aspectRatioEnabled, setAspectRatioEnabled] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [aspectRatioTolerance, setAspectRatioTolerance] = useState(10);

  const [minSizeEnabled, setMinSizeEnabled] = useState(false);
  const [minWidth, setMinWidth] = useState(0);
  const [minHeight, setMinHeight] = useState(0);

  const [starredOnly, setStarredOnly] = useState(false);

  const [categoriesEnabled, setCategoriesEnabled] = useState(false);
  const [categories, setCategories] = useState('');

  const [categoriesNegEnabled, setCategoriesNegEnabled] = useState(false);
  const [categoriesNeg, setCategoriesNeg] = useState('');

  useEffect(() => {
    if (
      minWidth < 0 ||
      minHeight < 0 ||
      aspectRatioTolerance < 0 ||
      aspectRatioTolerance > 100 ||
      aspectRatioTextToNumber(aspectRatio) < 0
    ) {
      return;
    }
    const newFilterModel = new SearchFilterOptions();
    if (aspectRatioEnabled) {
      newFilterModel.preferred_ratio = aspectRatioTextToNumber(aspectRatio);
      newFilterModel.ratio_tolerance = aspectRatioTolerance / 100.0;
    }

    if (minSizeEnabled) {
      newFilterModel.min_width = minWidth;
      newFilterModel.min_height = minHeight;
    }

    if (starredOnly) {
      newFilterModel.starred = true;
    }

    if (categoriesEnabled) {
      newFilterModel.categories = categories;
    }

    if (categoriesNegEnabled) {
      newFilterModel.categories_negative = categoriesNeg;
    }

    onChange?.(newFilterModel);
  }, [
    aspectRatioEnabled,
    aspectRatio,
    aspectRatioTolerance,
    minSizeEnabled,
    minWidth,
    minHeight,
    starredOnly,
    onChange,
    categoriesEnabled,
    categoriesNegEnabled,
    categories,
    categoriesNeg,
  ]);

  const aspectRatioErr = aspectRatioTextToNumber(aspectRatio) < 0;

  return (
    <Paper elevation={3} sx={{mx: 1}}>
      <Box sx={{padding: 1}} display='flex' flexDirection='column'>
        <LabelledSwitch
          label='Aspect Ratio'
          checked={aspectRatioEnabled}
          onCheckedChange={setAspectRatioEnabled}
        />
        <Collapse in={aspectRatioEnabled}>
          <Box display='flex' gap={2}>
            <Autocomplete
              id='combo-box-demo'
              options={commonAspectRatios}
              freeSolo
              value={aspectRatio}
              fullWidth
              onChange={(_, v) => setAspectRatio(v ?? '')}
              renderInput={params => (
                <TextField
                  variant='standard'
                  {...params}
                  label='Preferred Aspect Ratio'
                  error={aspectRatioErr}
                  onChange={e => setAspectRatio(e.target.value)}
                  helperText={aspectRatioErr ? 'Invalid aspect ratio' : ''}
                />
              )}
            />
            <StrictNumberInput
              label='Ratio tolerance'
              variant='standard'
              value={aspectRatioTolerance}
              onChange={v => setAspectRatioTolerance(v)}
              min={0}
              max={100}
              step={1}
              fullWidth
            />
          </Box>
        </Collapse>
        <LabelledSwitch
          label='Min Size'
          checked={minSizeEnabled}
          onCheckedChange={setMinSizeEnabled}
        />
        <Collapse in={minSizeEnabled}>
          <Box display='flex' gap={2}>
            <StrictNumberInput
              fullWidth
              label='Min Width'
              value={minWidth}
              min={0}
              step={100}
              onChange={v => setMinWidth(v)}
            />
            <StrictNumberInput
              fullWidth
              label='Min Height'
              value={minHeight}
              min={0}
              step={100}
              onChange={v => setMinHeight(v)}
            />
          </Box>
        </Collapse>
        <LabelledSwitch
          label='Starred only'
          checked={starredOnly}
          onCheckedChange={setStarredOnly}
        />
        <LabelledSwitch
          label='Categories'
          checked={categoriesEnabled}
          onCheckedChange={setCategoriesEnabled}
        />
        <Collapse in={categoriesEnabled}>
          <TextField
            variant='standard'
            label='Seperate by comma'
            value={categories}
            onChange={e => setCategories(e.target.value)}
            fullWidth
          />
        </Collapse>
        <LabelledSwitch
          label='Negative Categories'
          checked={categoriesNegEnabled}
          onCheckedChange={setCategoriesNegEnabled}
        />
        <Collapse in={categoriesNegEnabled}>
          <TextField
            variant='standard'
            label='Seperate by comma'
            value={categoriesNeg}
            onChange={e => setCategoriesNeg(e.target.value)}
            fullWidth
          />
        </Collapse>
      </Box>
    </Paper>
  );
}
