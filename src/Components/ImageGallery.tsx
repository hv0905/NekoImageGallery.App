import { Box, Paper } from '@mui/material';
import { SearchResult } from '../Models/SearchResult';
import { Environment } from '../environment';
import { useEffect, useRef } from 'react';
import { Fancybox } from '@fancyapps/ui';
import { SearchQuery, SimilarSearchQuery } from '../Services/SearchQuery';

export function ImageGallery({
  searchResult,
  onSimilarSearch,
}: {
  searchResult: SearchResult[];
  onSimilarSearch?: (query: SearchQuery) => void;
}) {
  const containerRef = useRef(null);
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

  return (
    <Box
      ref={containerRef}
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
    </Box>
  );
}
