import {FormControlLabel, Switch} from '@mui/material';
import {forwardRef} from 'react';

export const LabelledSwitch = forwardRef(function LabelledSwitch(
  {
    label,
    checked,
    onCheckedChange: setChecked,
    ...props
  }: {
    label: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
  } & Omit<React.ComponentProps<typeof FormControlLabel>, 'control' | 'label'>,
  ref
) {
  return (
    <FormControlLabel
      ref={ref}
      control={<Switch checked={checked} onChange={e => setChecked(e.target.checked)} />}
      label={label}
      {...props}
    />
  );
});
