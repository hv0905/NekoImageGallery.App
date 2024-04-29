export const imageFileTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

export function selectFiles(
  multiple = false,
  accept = imageFileTypes
): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept.join(', ');
    input.multiple = multiple;
    input.onchange = e => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        resolve(Array.from(files));
      } else {
        reject();
      }
    };
    input.click();
  });
}

export function selectDirectory(
  accept: string[] | null = imageFileTypes
): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.onchange = e => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        if (accept) {
          resolve(Array.from(files).filter(t => accept.includes(t.type)));
        } else {
          resolve(Array.from(files));
        }
      } else {
        reject();
      }
    };
    input.click();
  });
}
