import { useEffect, useState } from 'react';
import type { WorldWithMembers } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';

export function useWorldCardPhotos(world: WorldWithMembers) {
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');
  const [memberPhotoUrls, setMemberPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    let objectUrls: string[] = [];

    const loadPhotos = async () => {
      const paths = [world.player_photo_path, ...world.members.map((member) => member.photo_path)].filter(
        (path): path is string => Boolean(path),
      );

      if (paths.length === 0) {
        if (active) {
          setPlayerPhotoUrl('');
          setMemberPhotoUrls({});
        }
        return;
      }

      const urls = await Promise.all(
        paths.map(async (path) => {
          try {
            return [path, await getPhotoUrl(path)] as const;
          } catch {
            return [path, ''] as const;
          }
        }),
      );

      if (!active) {
        urls.forEach(([, url]) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        return;
      }

      objectUrls = urls.map(([, url]) => url).filter((url) => url.startsWith('blob:'));
      const urlMap = new Map(urls);
      setPlayerPhotoUrl(world.player_photo_path ? urlMap.get(world.player_photo_path) ?? '' : '');
      setMemberPhotoUrls(
        Object.fromEntries(
          world.members.map((member) => [member.id, member.photo_path ? urlMap.get(member.photo_path) ?? '' : '']),
        ),
      );
    };

    void loadPhotos();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [world.player_photo_path, world.members]);

  return { playerPhotoUrl, memberPhotoUrls };
}
