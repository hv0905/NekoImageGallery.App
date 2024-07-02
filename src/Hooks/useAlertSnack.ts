import {Alert} from '@mui/material';
import {ComponentProps, useState, useCallback} from 'react';

type AlertSeverity = ComponentProps<typeof Alert>['severity'];

export function useAlertSnack() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('success');

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const fireSnack = useCallback((text: string, severity: AlertSeverity = 'success') => {
    setText(text);
    setSeverity(severity);
    setOpen(true);
  }, []);

  return [{open, text, severity, onClose: handleClose}, fireSnack] as const;
}
