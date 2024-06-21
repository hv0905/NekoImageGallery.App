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
import {useAlertSnack} from '../Hooks/useAlertSnack';
import ImageSearch from '../Assets/Icons/ImageSearch.svg?raw';

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
        href={resultInfo.img.url}
        data-caption={`Similarity: ${(resultInfo.score * 100).toFixed(2)}%`}
      >
        <img
          src={resultInfo.img.thumbnail_url ?? resultInfo.img.url}
          style={{width: '100%'}}
        />
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
            color={resultInfo.img.starred ? 'secondary' : 'default'}
            onClick={() => handleStar(resultInfo)}
          >
            {resultInfo.img.starred ? (
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
            {`Similarity: ${(resultInfo.score * 100).toFixed(2)}%`}
          </Typography>
          <IconButton
            size='small'
            onClick={e => handleContextMenuWithButton(e, resultInfo)}
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

  const [alertProps, fireSnack] = useAlertSnack();

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
            tpl: `<button title="Similar Search" class="f-button f-button-custom">${ImageSearch}</button>`,
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
        fireSnack(resp.data.message, 'success');
        setSearchResult(
          searchResult.filter(t => t.img.id != contextMenuItem.img.id)
        );
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
          fireSnack(
            `Image ${item.img.starred ? 'unstarred' : 'starred'}.`,
            'success'
          );

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
            fireSnack(err.response?.data?.detail, 'error');
          } else {
            fireSnack('Unknown error', 'error');
          }
        });
    },
    [setSearchResult, fireSnack]
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
        />
      )}
      <AlertSnack {...alertProps} />
    </Box>
  );
}
