import {Alert, Snackbar} from '@mui/material';
import React from 'react';

export function AlertSnack({
  onClose,
  text,
  severity,
  ...props
}: {
  open: boolean;
  onClose: () => void;
  text: string;
  severity?: React.ComponentProps<typeof Alert>['severity'];
} & React.ComponentPropsWithoutRef<typeof Snackbar>) {
  return (
    <Snackbar autoHideDuration={6000} onClose={onClose} {...props}>
      <Alert onClose={onClose} severity={severity} sx={{width: '100%'}}>
        {text}
      </Alert>
    </Snackbar>
  );
}
