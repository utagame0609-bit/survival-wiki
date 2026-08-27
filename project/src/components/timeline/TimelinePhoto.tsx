import { useEffect, useState } from 'react';
import { getPhotoUrl } from '@/lib/db';

type TimelinePhotoProps = {
  storagePath: string;
  alt: string;
  className: string;
};

export function TimelinePhoto({ storagePath, alt, className }: TimelinePhotoProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    getPhotoUrl(storagePath)
      .then((url) => {
        if (active) {
          objectUrl = url.startsWith('blob:') ? url : '';
          setSrc(url);
        } else if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (active) setSrc('');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [storagePath]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}
