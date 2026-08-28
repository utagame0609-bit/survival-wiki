import { useEffect, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { getPhotoUrl } from '@/lib/db';

type LocationPhotoImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  storagePath: string;
};

export function LocationPhotoImage({ storagePath, alt, className, ...props }: LocationPhotoImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    setSrc(null);
    getPhotoUrl(storagePath)
      .then((url) => {
        if (!active) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url.startsWith('blob:') ? url : null;
        setSrc(url);
      })
      .catch(() => {
        if (active) setSrc(null);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [storagePath]);

  if (!src) return <div className={className} aria-hidden="true" />;
  return <img src={src} alt={alt ?? ''} className={className} {...props} />;
}
