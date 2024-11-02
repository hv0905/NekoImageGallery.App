import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {AppSettings, ApiInfo} from './Contexts';
import {useContext, useState} from 'react';
import {resetClient} from '../Services/Base';
import {WelcomeApi} from '../Services/WelcomeApi';
import {LoadingButton} from '@mui/lab';
import {LabelledSwitch} from './LabelledSwitch';

export function SettingsDialog({open, onClose}: {open: boolean; onClose: () => void}) {
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
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth scroll='paper'>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers>
        <Typography variant='h6'>Appearance</Typography>
        <LabelledSwitch
          label='Show info bar on each image'
          sx={{width: '100%'}}
          checked={editingSettings.showInfoBar}
          onCheckedChange={e =>
            setEditingSettings({
              ...editingSettings,
              showInfoBar: e,
            })
          }
        />
        <LabelledSwitch
          label='Auto load more images when scrolling to the end'
          sx={{width: '100%'}}
          checked={editingSettings.autoPaging}
          onCheckedChange={e =>
            setEditingSettings({
              ...editingSettings,
              autoPaging: e,
            })
          }
        />
        <Typography variant='h6'>Admin</Typography>
        <LabelledSwitch
          label='Use admin portal'
          disabled={!adminPortalAvail}
          checked={editingSettings.useAdminPortal}
          onCheckedChange={e =>
            setEditingSettings({
              ...editingSettings,
              useAdminPortal: e,
            })
          }
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
            <Tooltip
              title={
                window.isSecureContext
                  ? '[Alpha] When enabled, this option checks if an image already exists on the server by its SHA-1 digest before uploading. This can save time and reduce network traffic for potentially duplicate images. Duplicate images are always rejected by the server, even if this option is not enabled.'
                  : "Sorry, but this feature doesn't support on insecure context. Contact your admin for more information."
              }
            >
              <LabelledSwitch
                label='Check for Duplicate Images Before Upload'
                sx={{width: '100%'}}
                disabled={!window.isSecureContext}
                checked={editingSettings.duplicateAvoidMode}
                onCheckedChange={e =>
                  setEditingSettings({
                    ...editingSettings,
                    duplicateAvoidMode: e,
                  })
                }
              />
            </Tooltip>
            <Tooltip title='This will include the name (and the relative path if using add directory) of the uploaded file as a comment. Comments are accessible for all users with access to the server. This might help containing extra context for the image.'>
              <LabelledSwitch
                label='Upload file name as file comment'
                sx={{width: '100%'}}
                checked={editingSettings.includeFilenameAsComment}
                onCheckedChange={e =>
                  setEditingSettings({
                    ...editingSettings,
                    includeFilenameAsComment: e,
                  })
                }
              />
            </Tooltip>
          </Collapse>
        ) : (
          <Alert severity='info'>The admin portal of this server isn&apos;t enabled.</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Cancel
        </Button>
        <LoadingButton onClick={saveSettings} disabled={!canSave} loading={saving}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
