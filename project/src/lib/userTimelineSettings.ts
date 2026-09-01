import { supabase } from './supabase';

export type TimelineSortOrder = 'oldest' | 'newest';

let timelineSortSaveQueue: Promise<void> = Promise.resolve();

export async function loadUserTimelineSortOrder(): Promise<TimelineSortOrder> {
  await timelineSortSaveQueue;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 'oldest';

  const { data, error } = await supabase
    .from('user_settings')
    .select('timeline_sort_order')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data?.timeline_sort_order === 'newest' ? 'newest' : 'oldest';
}

export function saveUserTimelineSortOrder(sortOrder: TimelineSortOrder): Promise<void> {
  timelineSortSaveQueue = timelineSortSaveQueue.catch(() => undefined).then(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          timeline_sort_order: sortOrder,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (error) throw error;
  });

  return timelineSortSaveQueue;
}
