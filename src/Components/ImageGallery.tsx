import {
  Alert,
  Box,
  IconButton,
  Paper,
  PopoverPosition,
  Snackbar,
  Typography,
} from '@mui/material';
import {SearchResult} from '../Models/SearchResult';
import {Environment} from '../environment';
import {useContext, useEffect, useRef, useState} from 'react';
import {Fancybox} from '@fancyapps/ui';
import {SearchQuery, SimilarSearchQuery} from '../Services/SearchQuery';
import {ImageOperationMenu} from './ImageOperationMenu';
import {deleteImage, updateOpt} from '../Services/AdminApi';
import {isAxiosError} from 'axios';
import {ErrorProtocol} from '../Models/ApiResponse';
import {AppSettings} from './Contexts';
import {Favorite, FavoriteBorder, MoreVert} from '@mui/icons-material';

export function ImageGallery({
  searchResult,
  setSearchResult,
  onSimilarSearch,
}: {
  searchResult: SearchResult[];
  setSearchResult: (result: SearchResult[]) => void;
  onSimilarSearch?: (query: SearchQuery) => void;
}) {
  const containerRef = useRef(null);
  const [appSettings] = useContext(AppSettings);
  const [contextMenu, setContextMenu] = useState<PopoverPosition | null>(null);
  const [contextMenuEl, setContextMenuEl] = useState<HTMLElement | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<SearchResult | null>(
    null
  );
  const [notificationOpen, setNotificationOpen] = useState(false);
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

  function handleContextMenu(e: React.MouseEvent, item: SearchResult) {
    e.preventDefault();
    if (contextMenuOpen) return;
    setContextMenuItem(item);
    setContextMenu({top: e.clientY - 6, left: e.clientX + 2});
  }

  // onclick event
  function handleContextMenuWithButton(
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    item: SearchResult
  ) {
    if (contextMenuOpen) return;
    setContextMenuItem(item);
    setContextMenuEl(e.currentTarget);
  }

  function handleDelete() {
    if (!contextMenuItem) return;
    deleteImage(contextMenuItem.img.id)
      .then(resp => {
        setNotificationText(resp.data.message);
        setNotificationErr(false);
        setNotificationOpen(true);
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
        setNotificationOpen(true);
      });
  }

  function handleSimilarSearch() {
    if (!contextMenuItem) return;
    onSimilarSearch?.(new SimilarSearchQuery(contextMenuItem.img));
  }

  function handleStar(item: SearchResult): void {
    updateOpt(item.img.id, !item.img.starred)
      .then(() => {
        setNotificationText(
          `Image ${item.img.starred ? 'unstarred' : 'starred'}.`
        );
        setNotificationErr(false);
        setNotificationOpen(true);

        setSearchResult(
          searchResult.map(t => {
            if (t.img.id == item.img.id) {
              t.img.starred = !t.img.starred;
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
        setNotificationOpen(true);
      });
  }

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
        <Paper
          key={t.img.id}
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
            <img
              src={t.img.thumbnail_url ?? t.img.url}
              style={{width: '100%'}}
            />
          </Box>
          {appSettings.showInfoBar && (
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
      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={() => setNotificationOpen(false)}
      >
        <Alert
          onClose={() => setNotificationOpen(false)}
          severity={notificationErr ? 'error' : 'success'}
          sx={{width: '100%'}}
        >
          {notificationText}
        </Alert>
      </Snackbar>
    </Box>
  );
}
