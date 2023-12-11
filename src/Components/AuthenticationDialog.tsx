import { Key } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Home } from '../Services/HomeApi';
import { resetClient } from '../Services/Base';

export function AuthenticationDialog() {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState(false);
  const [token, setToken] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    void Home().then(resp => {
      if (!resp.authorization.passed) {
        setOpen(true);
      } else {
        console.log("Already authenticated, don't show dialog.");
      }
    });
  }, []);

  const verifyToken = () => {
    localStorage.setItem('access-token', token);
    resetClient();
    setRequesting(true);
    Home()
      .then(resp => {
        if (resp.authorization.passed) {
          setOpen(false);
        } else {
          setToken('');
          setErr(true);
          setErrMsg('Invalid token.');
        }
      })
      .catch(() => {
        setErr(true);
        setErrMsg('Unknown error.');
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Authentication required</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This server is protected by access token, please enter your token to
          continue.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Access Token"
          type="password"
          fullWidth
          variant="standard"
          value={token}
          onChange={e => setToken(e.target.value)}
          error={err}
          helperText={errMsg}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={verifyToken}
          startIcon={<Key />}
          disabled={token.length == 0 || requesting}
        >
          Unlock
        </Button>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
