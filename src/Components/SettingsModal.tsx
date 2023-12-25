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
import { AppSettings, ApiInfo } from './Contexts';
import { useContext, useState } from 'react';

export function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [appSettings, setAppSettings] = useContext(AppSettings);
  const apiInfo = useContext(ApiInfo);
  const [editingSettings, setEditingSettings] = useState(appSettings);

  const adminPortalAvail = apiInfo?.admin_api.available;
  if (!adminPortalAvail && editingSettings.useAdminPortal) {
    setEditingSettings({ ...editingSettings, useAdminPortal: false });
  }

  function saveSettings() {
    setAppSettings(editingSettings);
  }

  const canSave = !editingSettings.useAdminPortal || editingSettings.adminKey;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6">Admin</Typography>
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
          label="Use admin portal"
        />
        {adminPortalAvail ? (
          <Collapse in={editingSettings.useAdminPortal}>
            <TextField
              label="Admin Token"
              variant="standard"
              fullWidth
              required
              value={editingSettings.adminKey}
              type='password'
              onChange={e =>
                setEditingSettings({
                  ...editingSettings,
                  adminKey: e.target.value,
                })
              }
            />
          </Collapse>
        ) : (
          <Alert severity="info">
            The admin portal of this server isn&apos;t enabled.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={saveSettings} disabled={!canSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
