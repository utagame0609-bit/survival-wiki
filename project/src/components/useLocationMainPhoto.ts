import { useEffect, useRef, useState } from 'react';
import type { LocationPhoto } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';

export function useLocationMainPhoto(existingMainPhoto: LocationPhoto | null) {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    if (!existingMainPhoto) {
      setMainPreview(null);
      return () => {
        active = false;
      };
    }

    getPhotoUrl(existingMainPhoto.storage_path)
      .then((url) => {
        if (active) setMainPreview(url);
        else if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      })
      .catch(() => {
        if (active) setMainPreview(null);
      });

    return () => {
      active = false;
      setMainPreview((current) => {
        if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
        return null;
      });
    };
  }, [existingMainPhoto]);

  const handleMainSelect = (file: File | null) => {
    if (!file) return;
    setMainPreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setMainFile(file);
  };

  const clearMainPreview = () => {
    setMainFile(null);
    setMainPreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    mainFile,
    mainPreview,
    fileInputRef,
    handleMainSelect,
    clearMainPreview,
  };
}
