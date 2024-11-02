import {
  Check,
  ContentCopy,
  DoneAll,
  Error,
  Favorite,
  FavoriteBorder,
  Flaky,
  FontDownload,
  FontDownloadOff,
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
import {UploadTask, UploadTaskStatus} from '../Models/UploadTaskModel';
import {useContext, useEffect, useRef, useState} from 'react';
import {LoadingButton} from '@mui/lab';
import {imageFileTypes, selectDirectory, selectFiles} from '../Utils/SystemDialog';
import {humanReadableBytes} from '../Utils/StringUtils';
import {FixedSizeList, ListChildComponentProps} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {UploadService} from '../Services/UploadService';
import {useFileDropper} from '../Hooks/useFileDropper';
import {viewImageFile} from '../Utils/FancyboxUtils';
import {AlertSnack} from './AlertSnack';
import {useAlertSnack} from '../Hooks/useAlertSnack';
import {AppSettings} from './Contexts';

export function UploadDialog({open, onClose}: {open: boolean; onClose: () => void}) {
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
  const uploadService = useRef<UploadService | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categoriesInput, setCategoriesInput] = useState('');
  const [completedTasks, setCompletedTasks] = useState(0);
  const [errorTasks, setErrorTasks] = useState(0);
  const [duplicateTasks, setDuplicateTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(1);

  const [appSettings] = useContext(AppSettings);
  const [alertProps, fireSnack] = useAlertSnack();

  const percentage = (completedTasks / totalTasks) * 100;

  const ready =
    uploadQueue.some(
      t => t.status === UploadTaskStatus.Pending || t.status === UploadTaskStatus.Error
    );

  useEffect(() => {
    if (uploading) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = true;

        fireSnack('Upload in progress. Closing the tab will cancel the upload.', 'warning');
      };
      window.addEventListener('beforeunload', handler);
      return () => {
        window.removeEventListener('beforeunload', handler);
      };
    }
  }, [fireSnack, uploading]);

  function mapSelect(pred: (t: UploadTask) => boolean) {
    setUploadQueue(uploadQueue.map(t => ({...t, selected: pred(t)})));
  }

  function mapPropForSelection(newProps: Partial<UploadTask>) {
    setUploadQueue(uploadQueue.map(t => (t.selected ? {...t, ...newProps} : t)));
  }

  function addImages(newEntries: File[]) {
    setUploadQueue([...uploadQueue, ...newEntries.map(file => new UploadTask(file))]);
  }

  function addImagesWithCustomName(newEntries: [File, string][]) {
    setUploadQueue([
      ...uploadQueue,
      ...newEntries.map(([file, name]) => new UploadTask(file, name)),
    ]);
  }

  function notifyBadImg() {
    fireSnack(
      'Invalid file type. Only jpeg, png, webp, gif image files are currently allowed.',
      'error'
    );
  }

  function selectImages() {
    selectFiles(true)
      .then(t => addImages(t))
      .catch(notifyBadImg);
  }

  function selectImgDir() {
    selectDirectory()
      .then(t => addImages(t))
      .catch(notifyBadImg);
  }

  function updateRenderQueueFromWorking() {
    const queue = uploadService.current?.queue ?? [];
    setCompletedTasks(uploadService.current?.finishedTasksCount ?? 0);
    setErrorTasks(uploadService.current?.errorTasksCount ?? 0);
    setDuplicateTasks(uploadService.current?.duplicateTasksCount ?? 0);
    setUploadQueue(queue.filter(t => t.status !== UploadTaskStatus.Complete));
  }

  function startUpload() {
    setUploading(true);
    const queue = uploadQueue
      .filter(t => t.status === UploadTaskStatus.Pending || t.status === UploadTaskStatus.Error)
      .map(t => ({...t, status: UploadTaskStatus.Pending}));
    setTotalTasks(queue.length);
    uploadService.current = new UploadService(
      queue,
      4,
      updateRenderQueueFromWorking,
      appSettings.duplicateAvoidMode && window.isSecureContext,
      appSettings.includeFilenameAsComment
    );
    uploadService.current
      .upload()
      .then(() => {
        setUploading(false);
        fireSnack(
          `Upload completed. ${uploadService.current!.completedTasksCount} images uploaded.` +
            (uploadService.current!.errorTasksCount > 0
              ? ` ${uploadService.current!.errorTasksCount} images failed.`
              : '') +
            (uploadService.current!.duplicateTasksCount > 0
              ? ` ${uploadService.current!.duplicateTasksCount} images duplicated.`
              : ''),
          uploadService.current!.errorTasksCount > 0
            ? 'error'
            : uploadService.current!.duplicateTasksCount > 0
              ? 'warning'
              : 'success'
        );
      })
      .catch(ex => console.error(ex));
  }

  function renderForTask(context: ListChildComponentProps<void>) {
    const t = uploadQueue[context.index];
    return (
      <ListItem
        key={t.id}
        style={context.style}
        secondaryAction={
          <IconButton edge='end' aria-label='view' onClick={() => viewImageFile(t.file)}>
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
              uploadQueue.map(u => (u.id === t.id ? {...u, selected: !u.selected} : u))
            )
          }
        >
          {uploading ? (
            <Box gridRow='1 / -1' width={30}>
              {t.status === UploadTaskStatus.Pending && <Pending />}
              {t.status === UploadTaskStatus.Uploading && <CircularProgress size={30} />}
              {t.status === UploadTaskStatus.Complete && <Check color='success' />}
              {t.status === UploadTaskStatus.Error && <Error color='error' />}
              {t.status === UploadTaskStatus.Duplicate && <ContentCopy color='secondary' />}
            </Box>
          ) : (
            <Checkbox edge='start' disableRipple sx={{gridRow: '1 / -1'}} checked={t.selected} />
          )}

          <Box display='flex' alignItems='center' gap={1} maxWidth='100%' overflow='hidden'>
            {t.starred ? <Favorite /> : <FavoriteBorder />}
            <Typography textOverflow='ellipsis' maxWidth='100%' overflow='hidden' noWrap>
              {t.uploadName}
            </Typography>
          </Box>
          <Box display='flex' gridRow='2/3' gap={1}>
            {t.status === UploadTaskStatus.Error && <Chip label={t.errorText} color='error' />}
            {t.status === UploadTaskStatus.Duplicate && <Chip label='Duplicated' color='warning' />}
            {t.skipOcr && <Chip label='Skip OCR' color='secondary' />}
            {t.categories && (
              <Chip
                label={`categories: ${t.categories}`}
                sx={{
                  justifySelf: 'start',
                }}
              />
            )}
            <Chip label={humanReadableBytes(t.file.size)} />
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
      maxWidth='lg'
      scroll='paper'
      {...useFileDropper(imageFileTypes, addImagesWithCustomName, notifyBadImg)}
    >
      <DialogTitle>Upload new images</DialogTitle>
      <DialogContent>
        <Box display='flex' gap={2} flexWrap='wrap' justifyContent='space-between'>
          <ButtonGroup variant='contained' disabled={uploading}>
            <Button onClick={selectImages}>Add File</Button>
            <Button onClick={selectImgDir}>Add Directory</Button>
          </ButtonGroup>
          <ButtonGroup disabled={uploading}>
            <Tooltip title='Select All'>
              <Button onClick={() => mapSelect(() => true)}>
                <DoneAll />
              </Button>
            </Tooltip>
            <Tooltip title='Select None'>
              <Button onClick={() => mapSelect(() => false)}>
                <RemoveDone />
              </Button>
            </Tooltip>
            <Tooltip title='Reverse Selection'>
              <Button onClick={() => mapSelect(t => !t.selected)}>
                <Flaky />
              </Button>
            </Tooltip>
            <Tooltip title='Remove selection from list'>
              <Button
                color='error'
                onClick={() => setUploadQueue(uploadQueue.filter(t => !t.selected))}
              >
                <PlaylistRemove />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
        <Paper elevation={3} sx={{my: 2, height: 'max(300px, 45vh)'}}>
          {uploadQueue.length > 0 ? (
            <AutoSizer>
              {({height, width}) => (
                <FixedSizeList
                  width={width}
                  height={height}
                  itemCount={uploadQueue.length}
                  itemSize={72}
                  itemKey={idx => uploadQueue[idx].id}
                >
                  {renderForTask}
                </FixedSizeList>
              )}
            </AutoSizer>
          ) : (
            <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
              <Typography variant='h6' sx={{userSelect: 'none'}}>
                Drop file here to upload.
              </Typography>
            </Box>
          )}
        </Paper>
        <Collapse in={!uploading} unmountOnExit>
          <Box display='flex' mt={2} gap={2} flexWrap='wrap' justifyContent='space-between'>
            <ButtonGroup color='secondary' disabled={uploading}>
              <Tooltip title='Star selection'>
                <Button onClick={() => mapPropForSelection({starred: true})}>
                  <Favorite />
                </Button>
              </Tooltip>
              <Tooltip title='Unstar selection'>
                <Button onClick={() => mapPropForSelection({starred: false})}>
                  <FavoriteBorder />
                </Button>
              </Tooltip>
              <Tooltip title='Skip OCR process for selection'>
                <Button onClick={() => mapPropForSelection({skipOcr: true})}>
                  <FontDownloadOff />
                </Button>
              </Tooltip>
              <Tooltip title='Enable OCR process for selection'>
                <Button onClick={() => mapPropForSelection({skipOcr: false})}>
                  <FontDownload />
                </Button>
              </Tooltip>
            </ButtonGroup>
            <Box display='flex' gap={1} justifyContent='right' flexGrow={1}>
              <TextField
                color='secondary'
                variant='standard'
                label='Categories of selection'
                sx={{flexGrow: 1, maxWidth: 400}}
                value={categoriesInput}
                onChange={e => setCategoriesInput(e.target.value)}
              />
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => mapPropForSelection({categories: categoriesInput})}
              >
                Set
              </Button>
            </Box>
          </Box>
        </Collapse>
        <Collapse in={uploading}>
          <Box display='flex' flexDirection='column' alignItems='center' gap={1} mt={2}>
            {(!!errorTasks || !!duplicateTasks) && (
              <Typography>
                Errors: {errorTasks} Duplicates: {duplicateTasks}
              </Typography>
            )}
            <Typography>
              Progress: {completedTasks}/{totalTasks} ({percentage.toFixed(0)}%)
            </Typography>
            <LinearProgress variant='determinate' sx={{width: '100%'}} value={percentage} />
          </Box>
        </Collapse>
        <AlertSnack {...alertProps} />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={uploading}
          loadingPosition='start'
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
