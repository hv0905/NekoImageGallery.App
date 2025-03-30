import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  PopoverPosition,
  TextField,
  Typography,
} from '@mui/material';
import {SearchResult} from '../Models/SearchResult';
import {Dispatch, SetStateAction, memo, useCallback, useContext, useState} from 'react';
import {MixedSearchQuery, SearchQuery, SimilarSearchQuery} from '../Services/SearchQuery';
import {ImageOperationMenu} from './ImageOperationMenu';
import {deleteImage, updateOpt} from '../Services/AdminApi';
import {isAxiosError} from 'axios';
import {ErrorProtocol} from '../Models/ApiResponse';
import {AppSettings} from './Contexts';
import {Favorite, FavoriteBorder, MoreVert} from '@mui/icons-material';
import {AlertSnack} from './AlertSnack';
import {useAlertSnack} from '../Hooks/useAlertSnack';
import {FancyboxWrapper} from './FancyBoxWrapper';
import {transformUrl} from '../Services/StaticFiles';

const ImageGalleryItem = memo(function ImageGalleryItem({
  resultInfo,
  showInfoBar,
  handleStar,
  handleContextMenu,
  handleContextMenuWithButton,
}: {
  resultInfo: SearchResult;
  showInfoBar: boolean;
  handleStar: (item: SearchResult) => void;
  handleContextMenu: (e: React.MouseEvent, item: SearchResult) => void;
  handleContextMenuWithButton: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    item: SearchResult
  ) => void;
}) {
  return (
    <Paper
      onContextMenu={e => handleContextMenu(e, resultInfo)}
      sx={{
        margin: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        width: '100%',
        maxHeight: '500px',
        flexDirection: 'column',
        textDecoration: 'none',
        animation: '0.4s ease-out fade-in',
      }}
    >
      <ButtonBase
        sx={{
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          justifyContent: 'center',
        }}
        component='a'
        data-fancybox='gallery'
        href={transformUrl(resultInfo.img.url)}
        data-caption={`Similarity: ${(resultInfo.score * 100).toFixed(2)}%`}
      >
        <img
          src={transformUrl(resultInfo.img.thumbnail_url ?? resultInfo.img.url)}
          style={{width: '100%'}}
        />
      </ButtonBase>
      {showInfoBar && (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          width='100%'
          my='4px'
        >
          <IconButton
            size='small'
            color={resultInfo.img.starred ? 'secondary' : 'default'}
            onClick={() => handleStar(resultInfo)}
          >
            {resultInfo.img.starred ? (
              <Favorite fontSize='small' />
            ) : (
              <FavoriteBorder fontSize='small' />
            )}
          </IconButton>
          <Typography variant='body1' color='textSecondary' sx={{userSelect: 'none'}}>
            {`Similarity: ${(resultInfo.score * 100).toFixed(2)}%`}
          </Typography>
          <IconButton size='small' onClick={e => handleContextMenuWithButton(e, resultInfo)}>
            <MoreVert fontSize='small' />
          </IconButton>
        </Box>
      )}
    </Paper>
  );
});

export function ImageGallery({
  searchResult,
  setSearchResult,
  onSimilarSearch,
}: {
  searchResult: SearchResult[];
  setSearchResult: Dispatch<SetStateAction<SearchResult[] | null>>;
  onSimilarSearch?: (query: SearchQuery) => void;
}) {
  const [appSettings] = useContext(AppSettings);
  const [contextMenu, setContextMenu] = useState<PopoverPosition | null>(null);
  const [contextMenuEl, setContextMenuEl] = useState<HTMLElement | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<SearchResult | null>(null);
  const [mixedSearchItem, setMixedSearchItem] = useState<SearchResult | null>(null);
  const [mixedSearchText, setMixedSearchText] = useState<string>('');

  const [alertProps, fireSnack] = useAlertSnack();

  const contextMenuOpen = !!contextMenu || !!contextMenuEl;

  const handleContextMenu = useCallback((e: React.MouseEvent, item: SearchResult) => {
    e.preventDefault();
    setContextMenuItem(item);
    setContextMenu({top: e.clientY - 6, left: e.clientX + 2});
  }, []);

  // onclick event
  const handleContextMenuWithButton = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, item: SearchResult) => {
      setContextMenuItem(item);
      setContextMenuEl(e.currentTarget);
    },
    []
  );

  function handleDelete() {
    if (!contextMenuItem) return;
    deleteImage(contextMenuItem.img.id)
      .then(resp => {
        fireSnack(resp.data.message, 'success');
        setSearchResult(searchResult.filter(t => t.img.id !== contextMenuItem.img.id));
      })
      .catch(err => {
        if (isAxiosError<ErrorProtocol>(err) && err.response?.data.detail) {
          fireSnack(err.response?.data?.detail, 'error');
        } else {
          fireSnack('Unknown error', 'error');
        }
      });
  }

  function handleSimilarSearch() {
    if (!contextMenuItem) return;
    onSimilarSearch?.(new SimilarSearchQuery(contextMenuItem.img));
  }

  const handleStar = useCallback(
    (item: SearchResult) => {
      updateOpt(item.img.id, !item.img.starred)
        .then(() => {
          fireSnack(`Image ${item.img.starred ? 'unstarred' : 'starred'}.`, 'success');

          setSearchResult(s =>
            s!.map(t => {
              if (t.img.id === item.img.id) {
                return {...t, img: {...t.img, starred: !t.img.starred}};
              }
              return t;
            })
          );
        })
        .catch(err => {
          if (isAxiosError<ErrorProtocol>(err) && err.response?.data.detail) {
            fireSnack(err.response?.data?.detail, 'error');
          } else {
            fireSnack('Unknown error', 'error');
          }
        });
    },
    [setSearchResult, fireSnack]
  );

  return (
    <FancyboxWrapper
      onContextMenu={e => {
        if (contextMenuOpen) {
          e.preventDefault();
          setContextMenu(null);
          setContextMenuEl(null);
        }
      }}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridAutoRows: 'minmax(200px, auto)',
        justifyItems: 'center',
        gap: 1,
      }}
      onSimilarClick={useCallback(
        (index: number) => onSimilarSearch?.(new SimilarSearchQuery(searchResult[index].img)),
        [onSimilarSearch, searchResult]
      )}
    >
      {searchResult.map(t => (
        <ImageGalleryItem
          key={t.img.id}
          resultInfo={t}
          showInfoBar={appSettings.showInfoBar}
          handleStar={handleStar}
          handleContextMenu={handleContextMenu}
          handleContextMenuWithButton={handleContextMenuWithButton}
        />
      ))}
      {contextMenuItem && (
        <ImageOperationMenu
          open={contextMenuOpen}
          anchorReference={contextMenuEl ? 'anchorEl' : 'anchorPosition'}
          anchorEl={contextMenuEl}
          anchorPosition={contextMenu ?? undefined}
          context={contextMenuItem}
          onClose={() => {
            setContextMenu(null);
            setContextMenuEl(null);
          }}
          onDelete={handleDelete}
          onStar={() => contextMenuItem && handleStar(contextMenuItem)}
          onSimilarSearch={handleSimilarSearch}
          onMixedSearch={() => setMixedSearchItem(contextMenuItem)}
        />
      )}
      <AlertSnack {...alertProps} />
      <Dialog open={!!mixedSearchItem} onClose={() => setMixedSearchItem(null)}>
        <DialogTitle>Mixed Search</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Mixed search can search for similar images of the provide image with an addition
            description.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            label='Criteria'
            fullWidth
            variant='standard'
            value={mixedSearchText}
            onChange={e => setMixedSearchText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMixedSearchItem(null)}>Cancel</Button>
          <Button
            disabled={!mixedSearchText.trim()}
            onClick={() => {
              if (mixedSearchItem) {
                onSimilarSearch?.(new MixedSearchQuery(mixedSearchText, mixedSearchItem.img));
              }
              setMixedSearchItem(null);
            }}
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </FancyboxWrapper>
  );
}
