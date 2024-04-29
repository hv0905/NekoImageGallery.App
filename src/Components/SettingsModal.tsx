import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {AppSettings, ApiInfo} from './Contexts';
import {useContext, useState} from 'react';
import {resetClient} from '../Services/Base';
import {WelcomeApi} from '../Services/WelcomeApi';

export function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [prevOpen, setPrevOpen] = useState(false);
  const [appSettings, setAppSettings] = useContext(AppSettings);
  const apiInfo = useContext(ApiInfo);
  const [editingSettings, setEditingSettings] = useState(appSettings);
  const [saving, setSaving] = useState(false);
  const [tokenErr, setTokenErr] = useState('');

  if (open && !prevOpen) {
    setPrevOpen(true);
    setEditingSettings(appSettings);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const adminPortalAvail = apiInfo?.admin_api.available ?? true;
  if (!adminPortalAvail && editingSettings.useAdminPortal) {
    setEditingSettings({...editingSettings, useAdminPortal: false});
  }

  function saveSettings() {
    setAppSettings(editingSettings);
    if (editingSettings.useAdminPortal) {
      setSaving(true);
      resetClient();
      WelcomeApi()
        .then(resp => {
          if (resp.admin_api.passed) {
            setTokenErr('');
            onClose();
          } else {
            setTokenErr('Invalid token.');
          }
        })
        .catch(() => {
          setTokenErr('Unknown error.');
        })
        .finally(() => {
          setSaving(false);
        });
    } else {
      onClose();
    }
  }

  const canSave = !editingSettings.useAdminPortal || editingSettings.adminKey;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      scroll='paper'
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers>
        <Typography variant='h6'>Appearance</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={editingSettings.showInfoBar}
              onChange={e =>
                setEditingSettings({
                  ...editingSettings,
                  showInfoBar: e.target.checked,
                })
              }
            />
          }
          label='Show info bar on each image'
        />
        <Typography variant='h6'>Admin</Typography>
        <FormControlLabel
          control={
            <Switch
              disabled={!adminPortalAvail}
              checked={editingSettings.useAdminPortal}
              onChange={e =>
                setEditingSettings({
                  ...editingSettings,
                  useAdminPortal: e.target.checked,
                })
              }
            />
          }
          label='Use admin portal'
        />
        {adminPortalAvail ? (
          <Collapse in={editingSettings.useAdminPortal}>
            <TextField
              label='Admin Token'
              variant='standard'
              fullWidth
              required
              value={editingSettings.adminKey}
              type='password'
              error={!!tokenErr}
              helperText={tokenErr}
              onChange={e =>
                setEditingSettings({
                  ...editingSettings,
                  adminKey: e.target.value,
                })
              }
            />
          </Collapse>
        ) : (
          <Alert severity='info'>
            The admin portal of this server isn&apos;t enabled.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Cancel
        </Button>
        <Button onClick={saveSettings} disabled={!canSave || saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
