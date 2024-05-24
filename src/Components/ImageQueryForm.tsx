import {Close} from '@mui/icons-material';
import {Box, Card, Collapse, Alert, IconButton, Button} from '@mui/material';
import {useEffect, useState} from 'react';
import {ImageSearchQuery, SearchQuery} from '../Services/SearchQuery';
import {thumbnail} from '../Utils/ImageOps';
import {imageFileTypes, selectFiles} from '../Utils/SystemDialog';

export function ImageQueryForm({
  onSubmit,
}: {
  onSubmit?: (query: SearchQuery) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFileUrl(null);
    }
  }, [file]);

  const handleImageSearch = async () => {
    if (!file) return;
    let blob: Blob = file;

    if (file.size > 9 * 1024 * 1024) {
      // Entity too large
      // compress image
      blob = await thumbnail(fileUrl!, 1024, 1024);
      console.log('Image compressed. New size: ', blob.size / 1024, 'K');
    }

    onSubmit?.(new ImageSearchQuery(blob));
  };

  const setImageFile = (file: File) => {
    if (imageFileTypes.includes(file.type)) {
      setFile(file);
    } else {
      setNotificationOpen(true);
    }
  };

  const selectImage = () => {
    selectFiles()
      .then(t => setImageFile(t[0]))
      .catch(() => undefined);
  };

  const dropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setImageFile(files[0]);
    }
  };

  const dragOverImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const pasteImage = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          setImageFile(file);
          break;
        }
      }
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        gap: 1,
        flexDirection: 'column',
      }}
    >
      <Card sx={{width: '100%', height: '200px'}}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onDrop={dropImage}
          onPaste={pasteImage}
          onDragOver={dragOverImage}
        >
          {fileUrl ? (
            <img
              src={fileUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            ></img>
          ) : (
            <Box>Drop or paste your image here.</Box>
          )}
        </div>
      </Card>
      <Collapse in={notificationOpen}>
        <Alert
          severity='error'
          action={
            <IconButton
              aria-label='close'
              color='inherit'
              size='small'
              onClick={() => setNotificationOpen(false)}
            >
              <Close fontSize='inherit' />
            </IconButton>
          }
          sx={{mb: 2}}
        >
          Invalid file type. Please select a PNG or JPEG image.
        </Alert>
      </Collapse>
      <Box display='flex' gap={2}>
        <Button fullWidth variant='outlined' onClick={selectImage}>
          Select Image
        </Button>
        <Button
          fullWidth
          variant='contained'
          disabled={!file}
          onClick={() => void handleImageSearch()}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
}
