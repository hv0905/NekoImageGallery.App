import {DragEvent, ClipboardEvent} from 'react';

export function useFileDropper(
  fileAccept: string[] = ['*/*'],
  onSuccess?: (files: File[]) => void,
  onIncorrectType?: () => void
) {
  return {
    onDrop(e: DragEvent<HTMLElement>) {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files ?? []).filter(f => fileAccept.includes(f.type));
      if (files.length > 0) {
        onSuccess?.(files);
      } else {
        onIncorrectType?.();
      }
    },
    onDragOver(e: DragEvent<HTMLElement>) {
      e.preventDefault();
    },
    onPaste(e: ClipboardEvent<HTMLDivElement>) {
      const files = Array.from(e.clipboardData.items ?? [])
        .filter(t => t.kind === 'file')
        .map(t => t.getAsFile())
        .filter((t): t is File => !!t && fileAccept.includes(t.type));

      if (files.length > 0) {
        onSuccess?.(files);
      } else {
        onIncorrectType?.();
      }
    },
  };
}
