import {
  Box,
  IconButton,
  Paper,
  PopoverPosition,
  Typography,
} from '@mui/material';
import {SearchResult} from '../Models/SearchResult';
import {Environment} from '../environment';
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Fancybox} from '@fancyapps/ui';
import {SearchQuery, SimilarSearchQuery} from '../Services/SearchQuery';
import {ImageOperationMenu} from './ImageOperationMenu';
import {deleteImage, updateOpt} from '../Services/AdminApi';
import {isAxiosError} from 'axios';
import {ErrorProtocol} from '../Models/ApiResponse';
import {AppSettings} from './Contexts';
import {Favorite, FavoriteBorder, MoreVert} from '@mui/icons-material';
import {AlertSnack} from './AlertSnack';

const ImageGalleryItem = memo(function ImageGalleryItem({
  t,
  showInfoBar,
  handleStar,
  handleContextMenu,
  handleContextMenuWithButton,
}: {
  t: SearchResult;
  showInfoBar: boolean;
  handleStar: (item: SearchResult) => void;
  handleContextMenu: (e: React.MouseEvent, item: SearchResult) => void;
  handleContextMenuWithButton: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    item: SearchResult
  ) => void;
}) {
  window.ReactDOM
  return (
    <Paper
      onContextMenu={e => handleContextMenu(e, t)}
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
      }}
    >
      <Box
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
        href={t.img.url}
        data-caption={`Similarity: ${(t.score * 100).toFixed(2)}%`}
      >
        <img src={t.img.thumbnail_url ?? t.img.url} style={{width: '100%'}} />
      </Box>
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
            color={t.img.starred ? 'secondary' : 'default'}
            onClick={() => handleStar(t)}
          >
            {t.img.starred ? (
              <Favorite fontSize='small' />
            ) : (
              <FavoriteBorder fontSize='small' />
            )}
          </IconButton>
          <Typography
            variant='body1'
            color='textSecondary'
            sx={{userSelect: 'none'}}
          >
            {`Similarity: ${(t.score * 100).toFixed(2)}%`}
          </Typography>
          <IconButton
            size='small'
            onClick={e => handleContextMenuWithButton(e, t)}
          >
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
  const containerRef = useRef(null);
  const [appSettings] = useContext(AppSettings);
  const [contextMenu, setContextMenu] = useState<PopoverPosition | null>(null);
  const [contextMenuEl, setContextMenuEl] = useState<HTMLElement | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<SearchResult | null>(
    null
  );
  const [notificationText, setNotificationText] = useState('');
  const [notificationErr, setNotificationErr] = useState(false);

  const contextMenuOpen = !!contextMenu || !!contextMenuEl;

  searchResult.forEach(t => {
    if (t.img.url.startsWith('/')) {
      t.img.url = Environment.ApiUrl + t.img.url;
    }
    if (t.img.thumbnail_url?.startsWith('/')) {
      t.img.thumbnail_url = Environment.ApiUrl + t.img.thumbnail_url;
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    Fancybox.bind(container, '[data-fancybox]', {
      Toolbar: {
        items: {
          similar: {
            tpl: `<button class="f-button">Similar Search</button>`,
            click: () => {
              const index = Fancybox.getInstance()?.getSlide()?.index ?? -1;
              if (index == -1) return;
              onSimilarSearch?.(
                new SimilarSearchQuery(searchResult[index].img)
              );
            },
          },
        },
        display: {
          left: ['infobar'],
          middle: [
            'zoomIn',
            'zoomOut',
            'toggle1to1',
            'rotateCCW',
            'rotateCW',
            'flipX',
            'flipY',
          ],
          right: ['similar', 'download', 'thumbs', 'close'],
        },
      },
    });

    return () => {
      Fancybox.unbind(container);
      Fancybox.close();
    };
  }, [containerRef, searchResult, onSimilarSearch]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: SearchResult) => {
      e.preventDefault();
      setContextMenuItem(item);
      setContextMenu({top: e.clientY - 6, left: e.clientX + 2});
    },
    []
  );

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
        setNotificationText(resp.data.message);
        setNotificationErr(false);
        setSearchResult(
          searchResult.filter(t => t.img.id != contextMenuItem.img.id)
        );
      })
      .catch(err => {
        if (isAxiosError<ErrorProtocol>(err) && err.response?.data.detail) {
          setNotificationText(err.response?.data?.detail);
        } else {
          setNotificationText('Unknown error');
        }

        setNotificationErr(true);
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
          setNotificationText(
            `Image ${item.img.starred ? 'unstarred' : 'starred'}.`
          );
          setNotificationErr(false);

          setSearchResult(s =>
            s!.map(t => {
              if (t.img.id == item.img.id) {
                return {...t, img: {...t.img, starred: !t.img.starred}};
              }
              return t;
            })
          );
        })
        .catch(err => {
          if (isAxiosError<ErrorProtocol>(err) && err.response?.data.detail) {
            setNotificationText(err.response?.data?.detail);
          } else {
            setNotificationText('Unknown error');
          }

          setNotificationErr(true);
        });
    },
    [setSearchResult]
  );

  return (
    <Box
      ref={containerRef}
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
    >
      {searchResult.map(t => (
        <ImageGalleryItem
          key={t.img.id}
          t={t}
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
        />
      )}
      <AlertSnack
        open={!!notificationText}
        text={notificationText}
        severity={notificationErr ? 'error' : 'success'}
        onClose={() => setNotificationText('')}
        autoHideDuration={6000}
      />
    </Box>
  );
}
