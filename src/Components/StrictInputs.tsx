import {TextField} from '@mui/material';
import {useState} from 'react';

export function StrictNumberInput({
  value,
  onChange,
  min,
  max,
  step,
  ...props
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
} & Omit<React.ComponentProps<typeof TextField>, 'value' | 'onChange'>) {
  const [text, setText] = useState(value.toString());
  let err: string | null = null;
  const inferred = Number(text);
  if (text === '' || isNaN(inferred)) {
    err = 'Value should be a number';
  } else if (max != null && inferred > max) {
    err = `Value should not be greater than ${max}`;
  } else if (min != null && inferred < min) {
    err = `Value should not be less than ${min}`;
  }

  return (
    <TextField
      variant='standard'
      type='number'
      value={text}
      onChange={e => {
        setText(e.target.value);
        const v = Number(e.target.value);
        if (!isNaN(v) && (min == null || v >= min) && (max == null || v <= max)) {
          onChange(v);
        }
      }}
      error={!!err}
      helperText={err}
      inputProps={{min, max, step}}
      {...props}
    />
  );
}
