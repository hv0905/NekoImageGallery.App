import {
  Check,
  ContentCopy,
  DoneAll,
  Error,
  Favorite,
  FavoriteBorder,
  Flaky,
  Pageview,
  Pending,
  PlaylistRemove,
  RemoveDone,
} from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  ListItem,
  ListItemButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { UploadTask, UploadTaskStatus } from '../Models/UploadTaskModel';
import { CSSProperties, useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  imageFileTypes,
  selectDirectory,
  selectFiles,
} from '../Utils/SystemDialog';
import { humanReadableBytes } from '../Utils/StringUtils';
import { Fancybox } from '@fancyapps/ui';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { uploadImage } from '../Services/AdminApi';
import { isAxiosError } from 'axios';
import { ErrorProtocol } from '../Models/ApiResponse';

export function UploadDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
  const workingUploadQueue = useRef<UploadTask[]>([]);
  const [uploading, setUploading] = useState(false);
  const [categoriesInput, setCategoriesInput] = useState('');
  const [completedTasks, setCompletedTasks] = useState(0);
  const [errorTasks, setErrorTasks] = useState(0);
  const [duplicateTasks, setDuplicateTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(1);

  const percentage = (completedTasks / totalTasks) * 100;

  const ready = uploadQueue.length > 0;

  function addImages(newEntries: File[]) {
    setUploadQueue([
      ...uploadQueue,
      ...newEntries.map(file => new UploadTask(file)),
    ]);
  }

  function selectImages() {
    selectFiles(true)
      .then(t => addImages(t))
      .catch(() => undefined);
  }

  function selectImgDir() {
    selectDirectory()
      .then(t => addImages(t))
      .catch(() => undefined);
  }

  const dropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;
    addImages(Array.from(files).filter(t => imageFileTypes.includes(t.type)));
  };

  const dragOverImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  function previewImage(file: File) {
    const url = URL.createObjectURL(file);
    const box = Fancybox.show([
      {
        src: url,
      },
    ]);

    box.on('destroy', () => {
      URL.revokeObjectURL(url);
    });
  }

  function updateRenderQueueFromWorking() {
    setCompletedTasks(
      workingUploadQueue.current.filter(
        t =>
          t.status === UploadTaskStatus.Complete ||
          t.status === UploadTaskStatus.Error ||
          t.status === UploadTaskStatus.Duplicate
      ).length
    );
    setErrorTasks(
      workingUploadQueue.current.filter(
        t => t.status === UploadTaskStatus.Error
      ).length
    );
    setDuplicateTasks(
      workingUploadQueue.current.filter(
        t => t.status === UploadTaskStatus.Duplicate
      ).length
    );
    setUploadQueue(
      workingUploadQueue.current.filter(
        t => t.status !== UploadTaskStatus.Complete
      )
    );
  }

  async function uploadWorker() {
    for (const item of workingUploadQueue.current) {
      if (item.status != UploadTaskStatus.Pending) {
        continue;
      }
      item.status = UploadTaskStatus.Uploading;
      updateRenderQueueFromWorking();
      try {
        await uploadImage(
          item.file,
          true,
          item.starred,
          false,
          item.categories
        );
        item.status = UploadTaskStatus.Complete;
      } catch (err) {
        if (isAxiosError<ErrorProtocol>(err)) {
          if (!err.response) {
            item.status = UploadTaskStatus.Error;
            item.errorText = 'Network error';
          } else if (err.response.status === 409) {
            item.status = UploadTaskStatus.Duplicate;
            item.errorText = 'Duplicated';
          } else if (err.response.status === 400 || err.response.status === 415) {
            item.status = UploadTaskStatus.Error;
            item.errorText = 'Invalid file';
          } else {
            item.status = UploadTaskStatus.Error;
            item.errorText = err.response?.data?.detail ?? 'Unknown error';
          }
        } else {
          item.status = UploadTaskStatus.Error;
          item.errorText = 'Internal error';
        }
        console.error(err);
      } finally {
        updateRenderQueueFromWorking();
      }
    }
  }

  function startUpload() {
    setUploading(true);
    workingUploadQueue.current = uploadQueue
      .filter(
        t =>
          t.status === UploadTaskStatus.Pending ||
          t.status === UploadTaskStatus.Error
      )
      .map(t => ({ ...t, status: UploadTaskStatus.Pending }));
    setTotalTasks(workingUploadQueue.current.length);
    const threadColl = [];
    for (let i = 0; i < 4; ++i) {
      threadColl.push(uploadWorker());
    }
    Promise.all(threadColl)
      .then(() => {
        setUploading(false);
      })
      .catch(ex => console.error(ex));
  }

  function renderForTask(t: UploadTask, style: CSSProperties) {
    return (
      <ListItem
        key={t.id}
        style={style}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="view"
            onClick={() => previewImage(t.file)}
          >
            <Pageview />
          </IconButton>
        }
        disablePadding
      >
        <ListItemButton
          dense
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gridTemplateRows: 'auto auto',
            gap: 1,
          }}
          onClick={() =>
            setUploadQueue(
              uploadQueue.map(u =>
                u.id === t.id ? { ...u, selected: !u.selected } : u
              )
            )
          }
        >
          {uploading ? (
            <Box gridRow="1 / -1" width={30}>
              {t.status === UploadTaskStatus.Pending && <Pending />}
              {t.status === UploadTaskStatus.Uploading && (
                <CircularProgress size={30} />
              )}
              {t.status === UploadTaskStatus.Complete && (
                <Check color="success"/>
              )}
              {t.status === UploadTaskStatus.Error && (
                <Error color="error" />
              )}
              {t.status === UploadTaskStatus.Duplicate && (
                <ContentCopy color="secondary" />
              )}
            </Box>
          ) : (
            <Checkbox
              edge="start"
              disableRipple
              sx={{ gridRow: '1 / -1' }}
              checked={t.selected}
            />
          )}

          <Box
            display="flex"
            alignItems="center"
            gap={1}
            maxWidth="100%"
            overflow="hidden"
          >
            {t.starred ? <Favorite /> : <FavoriteBorder />}
            <Typography
              textOverflow="ellipsis"
              maxWidth="100%"
              overflow="hidden"
              noWrap
            >
              {t.file.name}
            </Typography>
          </Box>
          <Box display="flex" gridRow="2/3" gap={1}>
            {t.status === UploadTaskStatus.Error && (
              <Chip label={t.errorText} color="error" />
            )}
            <Chip label={humanReadableBytes(t.file.size)} />
            {t.categories && (
              <Chip
                label={`categories: ${t.categories}`}
                sx={{
                  justifySelf: 'start',
                }}
              />
            )}
          </Box>
        </ListItemButton>
      </ListItem>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      onDrop={dropImage}
      onDragOver={dragOverImage}
    >
      <DialogTitle>Upload new images</DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <ButtonGroup variant="contained" disabled={uploading}>
            <Button onClick={selectImages}>Add File</Button>
            <Button onClick={selectImgDir}>Add Directory</Button>
          </ButtonGroup>
          <ButtonGroup disabled={uploading}>
            <Tooltip title="Select All">
              <Button
                onClick={() =>
                  setUploadQueue(
                    uploadQueue.map(t => {
                      return { ...t, selected: true };
                    })
                  )
                }
              >
                <DoneAll />
              </Button>
            </Tooltip>
            <Tooltip title="Select None">
              <Button
                onClick={() =>
                  setUploadQueue(
                    uploadQueue.map(t => {
                      return { ...t, selected: false };
                    })
                  )
                }
              >
                <RemoveDone />
              </Button>
            </Tooltip>
            <Tooltip title="Reverse Selection">
              <Button
                onClick={() =>
                  setUploadQueue(
                    uploadQueue.map(t => {
                      return { ...t, selected: !t.selected };
                    })
                  )
                }
              >
                <Flaky />
              </Button>
            </Tooltip>
            <Tooltip title="Remove selection from list">
              <Button
                color="error"
                onClick={() =>
                  setUploadQueue(uploadQueue.filter(t => !t.selected))
                }
              >
                <PlaylistRemove />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
        <Paper elevation={3} sx={{ my: 2, height: 300 }}>
          {uploadQueue.length > 0 ? (
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  width={width}
                  height={height}
                  itemCount={uploadQueue.length}
                  itemSize={72}
                  itemKey={idx => uploadQueue[idx].id}
                >
                  {idx => renderForTask(uploadQueue[idx.index], idx.style)}
                </FixedSizeList>
              )}
            </AutoSizer>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Typography variant="h6" sx={{ userSelect: 'none' }}>
                Drop file here to upload.
              </Typography>
            </Box>
          )}
        </Paper>
        <Collapse in={!uploading} unmountOnExit>
          <Box
            display="flex"
            mt={2}
            gap={2}
            flexWrap="wrap"
            justifyContent="space-between"
          >
            <ButtonGroup color="secondary" disabled={uploading}>
              <Tooltip title="Star selection">
                <Button
                  onClick={() =>
                    setUploadQueue(
                      uploadQueue.map(t =>
                        t.selected ? { ...t, starred: true } : t
                      )
                    )
                  }
                >
                  <Favorite />
                </Button>
              </Tooltip>
              <Tooltip title="Unstar selection">
                <Button
                  onClick={() =>
                    setUploadQueue(
                      uploadQueue.map(t =>
                        t.selected ? { ...t, starred: false } : t
                      )
                    )
                  }
                >
                  <FavoriteBorder />
                </Button>
              </Tooltip>
            </ButtonGroup>
            <Box display="flex" gap={1} justifyContent="right" flexGrow={1}>
              <TextField
                color="secondary"
                variant="standard"
                label="Categories of selection"
                sx={{ flexGrow: 1, maxWidth: 400 }}
                value={categoriesInput}
                onChange={e => setCategoriesInput(e.target.value)}
              />
              <Button
                variant="outlined"
                color="secondary"
                onClick={() =>
                  setUploadQueue(
                    uploadQueue.map(t =>
                      t.selected ? { ...t, categories: categoriesInput } : t
                    )
                  )
                }
              >
                Set
              </Button>
            </Box>
          </Box>
        </Collapse>
        <Collapse in={uploading}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
            mt={2}
          >
            {(!!errorTasks || !!duplicateTasks) && (
              <Typography>
                Errors: {errorTasks} Duplicates: {duplicateTasks}
              </Typography>
            )}
            <Typography>
              Progress: {completedTasks}/{totalTasks} ({percentage.toFixed(0)}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              sx={{ width: '100%' }}
              value={percentage}
            />
          </Box>
        </Collapse>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={uploading}
          loadingPosition="start"
          startIcon={<Check />}
          onClick={startUpload}
          disabled={!ready}
        >
          {uploading ? 'Uploading' : 'Upload'}
        </LoadingButton>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
