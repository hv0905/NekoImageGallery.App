function preserveAspectRatio(
  providedSize: [number, number],
  actualSize: [number, number]
): [number, number] {
  let [x, y] = providedSize;
  const [width, height] = actualSize;
  if (x >= width && y >= height) {
    return [width, height];
  }

  const aspect = width / height;
  if (x / y >= aspect) {
    x = Math.max(Math.ceil(y * aspect), 1);
  } else {
    y = Math.max(Math.ceil(x / aspect), 1);
  }
  return [x, y];
}

export function thumbnail(blobUrl: string, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const [newWidth, newHeight] = preserveAspectRatio(
        [maxWidth, maxHeight],
        [img.width, img.height]
      );

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2d context'));
        return;
      }
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Could not create blob'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    };
    img.src = blobUrl;
  });
}
