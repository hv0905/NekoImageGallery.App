import {Fancybox} from '@fancyapps/ui';

export function viewImageFile(file: File) {
  const url = URL.createObjectURL(file);
  const box = Fancybox.show([
    {
      src: url,
    },
  ]);

  box.on('destroy', () => {
    URL.revokeObjectURL(url);
  });
}
