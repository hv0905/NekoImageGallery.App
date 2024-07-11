import {
  ContentCopy,
  Delete,
  Favorite,
  FavoriteBorder,
  Link,
  OpenInNew,
  Search,
} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import React, {useContext, useState} from 'react';
import {SearchResult} from '../Models/SearchResult';
import {copyTextToClipboard} from '../Utils/Clipboard';
import {AppSettings} from './Contexts';

export function ImageOperationMenu({
  context,
  open,
  onClose,
  onSimilarSearch,
  onStar,
  onDelete,
  ...props
}: {
  context: SearchResult;
  open: boolean;
  onClose: () => void;
  onSimilarSearch: () => void;
  onStar: () => void;
  onDelete: () => void;
} & Omit<React.ComponentProps<typeof Menu>, 'open' | 'onClose' | 'children'>) {
  const [settings] = useContext(AppSettings);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  function handleCopyText(text: string) {
    void copyTextToClipboard(text);
    onClose();
  }

  function handleDelete() {
    setDeleteDialogOpen(true);
    onClose();
  }

  return (
    <>
      <Menu open={open} onClose={onClose} {...props}>
        <MenuItem component='a' href={context.img.url} target='_blank'>
          <ListItemIcon>
            <OpenInNew fontSize='small' />
          </ListItemIcon>
          <ListItemText>Open in newtab</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSimilarSearch();
            onClose();
          }}
        >
          <ListItemIcon>
            <Search fontSize='small' />
          </ListItemIcon>
          <ListItemText>Similar search</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleCopyText(context.img.url)}>
          <ListItemIcon>
            <Link fontSize='small' />
          </ListItemIcon>
          <ListItemText>Copy image link</ListItemText>
        </MenuItem>
        {context.img.ocr_text && (
          <MenuItem onClick={() => handleCopyText(context.img.ocr_text!)}>
            <ListItemIcon>
              <ContentCopy fontSize='small' />
            </ListItemIcon>
            <ListItemText>Copy OCR text</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem disabled>
          <ListItemText>Score: {(context.score * 100).toFixed(2)}%</ListItemText>
        </MenuItem>
        <MenuItem disabled>
          <ListItemText>
            Size: {context.img.width ?? -1} x {context.img.height ?? -1}
          </ListItemText>
        </MenuItem>
        {!!context.img.categories?.length && (
          <MenuItem disabled>
            <ListItemText>Categories: {context.img.categories.join(', ')}</ListItemText>
          </MenuItem>
        )}
        {settings.useAdminPortal && [
          <Divider key={0} />,
          <MenuItem
            key={1}
            onClick={() => {
              onStar();
              onClose();
            }}
          >
            <ListItemIcon>{context.img.starred ? <Favorite /> : <FavoriteBorder />}</ListItemIcon>
            <ListItemText>{context.img.starred ? 'Unstar' : 'Star'}</ListItemText>
          </MenuItem>,
          <MenuItem onClick={handleDelete} key={2}>
            <ListItemIcon>
              <Delete fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText sx={{color: 'error.main'}}>Delete</ListItemText>
          </MenuItem>,
        ]}
      </Menu>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Delete Image?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            This operation will delete this image from the server.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setDeleteDialogOpen(false)}>
            cancel
          </Button>
          <Button
            color='error'
            onClick={() => {
              onDelete();
              setDeleteDialogOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
