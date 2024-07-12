import {Fancybox} from '@fancyapps/ui';
import {Box} from '@mui/material';
import {ComponentPropsWithoutRef, useEffect, useRef} from 'react';
import ImageSearch from '../Assets/Icons/ImageSearch.svg?raw';

export function FancyboxWrapper({
  onSimilarClick,
  ...props
}: {
  onSimilarClick?: (id: number) => void;
} & ComponentPropsWithoutRef<typeof Box>) {
  const containerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const container = containerRef.current;
    Fancybox.bind(container, '[data-fancybox]', {
      Toolbar: {
        items: {
          similar: {
            tpl: `<button title="Similar Search" class="f-button f-button-custom">${ImageSearch}</button>`,
            click: () => {
              const index = Fancybox.getInstance()?.getSlide()?.index ?? -1;
              if (index === -1) return;
              onSimilarClick?.(index);
            },
          },
        },
        display: {
          left: ['infobar'],
          middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW', 'flipX', 'flipY'],
          right: ['slideshow', 'similar', 'download', 'thumbs', 'close'],
        },
      },
    });

    return () => {
      Fancybox.unbind(container);
      Fancybox.close();
    };
  }, [onSimilarClick]);
  return <Box ref={containerRef} {...props} />;
}
