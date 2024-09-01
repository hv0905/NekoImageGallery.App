import {DragEvent, ClipboardEvent} from 'react';

function globFiles(item: FileSystemEntry, base = ''): Promise<File[]> {
  if (item.isFile) {
    return new Promise(resolve => {
      (<FileSystemFileEntry>item).file(file => {
        resolve([file]);
      });
    });
  } else if (item.isDirectory) {
    return new Promise(resolve => {
      const reader = (<FileSystemDirectoryEntry>item).createReader();
      reader.readEntries(async entries => {
        const files = await Promise.all(entries.map(t => globFiles(t, base + item.name + '/')));
        resolve(files.flat());
      });
    });
  } else {
    return Promise.resolve([]);
  }
}

export function useFileDropper(
  fileAccept: string[] = ['*/*'],
  onSuccess?: (files: File[]) => void,
  onIncorrectType?: () => void
) {

  async function processList(items: DataTransferItemList){
    const files = (
      await Promise.all(
        Array.from(items ?? [])
          .map(t => t.webkitGetAsEntry())
          .filter(t => !!t)
          .map(t => globFiles(t))
      )
    )
      .flat()
      .filter(t => fileAccept.includes(t.type));

    if (files.length > 0) {
      onSuccess?.(files);
    } else {
      onIncorrectType?.();
    }
  }

  return {
    async onDrop(e: DragEvent<HTMLElement>) {
      e.preventDefault();
      await processList(e.dataTransfer.items);
    },
    onDragOver(e: DragEvent<HTMLElement>) {
      e.preventDefault();
    },
    async onPaste(e: ClipboardEvent<HTMLDivElement>) {
      await processList(e.clipboardData.items);
    },
  };
}
