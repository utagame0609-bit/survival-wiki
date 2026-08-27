import { useEffect, useState } from 'react';
import { getPhotoUrl } from '@/lib/db';

type ChestFullImageProps = {
  storagePath: string;
  alt: string;
};

export function ChestFullImage({ storagePath, alt }: ChestFullImageProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    getPhotoUrl(storagePath)
      .then((url) => {
        if (active) setSrc(url);
        else if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      })
      .catch(() => {
        if (active) setSrc('');
      });

    return () => {
      active = false;
      setSrc((current) => {
        if (current.startsWith('blob:')) URL.revokeObjectURL(current);
        return '';
      });
    };
  }, [storagePath]);

  if (!src) return <div className="w-full h-72 bg-[#070c18] animate-pulse" />;

  return <img src={src} alt={alt} className="w-full max-h-[60vh] object-contain bg-black pixelated" />;
}
