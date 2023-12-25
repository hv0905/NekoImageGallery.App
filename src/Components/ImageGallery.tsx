import { Alert, Box, Paper, PopoverPosition, Snackbar } from '@mui/material';
import { SearchResult } from '../Models/SearchResult';
import { Environment } from '../environment';
import { useEffect, useRef, useState } from 'react';
import { Fancybox } from '@fancyapps/ui';
import { SearchQuery, SimilarSearchQuery } from '../Services/SearchQuery';
import { ImageOperationMenu } from './ImageOperationMenu';
import { deleteImage } from '../Services/AdminApi';
import { isAxiosError } from 'axios';
import { NekoProtocol } from '../Models/ApiResponse';

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
  const [contextMenu, setContextMenu] = useState<PopoverPosition | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<SearchResult | null>(
    null
  );
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [notificationErr, setNotificationErr] = useState(false);

  searchResult.forEach(t => {
    if (t.img.url.startsWith('/')) {
      t.img.url = Environment.ApiUrl + t.img.url;
    }
    if (t.img.thumbnail_url && t.img.thumbnail_url.startsWith('/')) {
      t.img.thumbnail_url = Environment.ApiUrl + t.img.thumbnail_url;
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    const midToolbar =
      window.innerWidth > 750
        ? [
            'zoomIn',
            'zoomOut',
            'toggle1to1',
            'rotateCCW',
            'rotateCW',
            'flipX',
            'flipY',
          ]
        : [];
    Fancybox.bind(container, '[data-fancybox]', {
      Toolbar: {
        items: {
          similar: {
            tpl: `<button class="f-button">Similar Search</button>`,
            click: () => {
              const index = Fancybox.getInstance()?.getSlide()?.index ?? -1;
              if (index == -1) return;
              onSimilarSearch?.(
                new SimilarSearchQuery(searchResult[index].img.id)
              );
            },
          },
        },
        display: {
          left: ['infobar'],
          middle: midToolbar,
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
    if (contextMenu) return;
    setContextMenuItem(item);
    setContextMenu({ top: e.clientY - 6, left: e.clientX + 2 });
  }

  function handleDelete() {
    if (!contextMenuItem) return;
    deleteImage(contextMenuItem.img.id)
      .then(resp => {
        setNotificationText(resp.data.message);
        setNotificationErr(false);
        setNotificationOpen(true);
        setSearchResult(searchResult.filter(t => t.img.id != contextMenuItem.img.id));
      })
      .catch(err => {
        if (isAxiosError<NekoProtocol>(err) && err.response?.data.message) {
          setNotificationText(err.response?.data?.message);
        } else {
          setNotificationText('Unknown error');
        }

        setNotificationErr(true);
        setNotificationOpen(true);
      });
  }

  function handleSimilarSearch() {
    if (!contextMenuItem) return;
    onSimilarSearch?.(new SimilarSearchQuery(contextMenuItem.img.id));
  }

  return (
    <Box
      ref={containerRef}
      onContextMenu={e => {
        if (contextMenu) {
          e.preventDefault();
          setContextMenu(null);
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
      {searchResult.map(t => {
        return (
          <Paper
            key={t.img.id}
            component="a"
            data-fancybox="gallery"
            data-caption={`Similarity: ${(t.score * 100).toFixed(2)}%`}
            href={t.img.url}
            onContextMenu={e => handleContextMenu(e, t)}
            sx={{
              margin: 1,
              display: 'flex',
              alignItems: 'center',
              overflow: 'Hidden',
              width: '100%',
              maxHeight: '500px',
            }}
          >
            <img
              src={t.img.thumbnail_url ?? t.img.url}
              style={{ width: '100%' }}
            />
          </Paper>
        );
      })}
      {contextMenuItem && (
        <>
          <ImageOperationMenu
            open={!!contextMenu}
            anchorReference="anchorPosition"
            anchorPosition={contextMenu ?? undefined}
            context={contextMenuItem}
            onClose={() => setContextMenu(null)}
            onDelete={handleDelete}
            onSimilarSearch={handleSimilarSearch}
          />
          <Snackbar open={notificationOpen} autoHideDuration={6000} onClose={() => setNotificationOpen(false)}>
            <Alert
              onClose={() => setNotificationOpen(false)}
              severity={notificationErr ? "error" : "success"}
              sx={{ width: '100%' }}
            >
              {notificationText}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}
