import { supabase } from './supabase';
import type { WikiArticle } from './types';
import type { WikiScopeType } from './wikiScope';

export type ScopedWikiArticle = WikiArticle & {
  scope_type: WikiScopeType;
  scope_key: string;
};

export async function fetchScopedWikiArticles(worldId: string): Promise<ScopedWikiArticle[]> {
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('world_id', worldId)
    .order('generated_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as ScopedWikiArticle[];
}

export function findScopedWikiArticle(
  articles: ScopedWikiArticle[],
  style: string,
  scopeType: WikiScopeType,
) {
  return articles.find((article) => article.style === style && article.scope_type === scopeType) ?? null;
}

export async function saveScopedWikiArticle(
  worldId: string,
  style: string,
  scopeType: WikiScopeType,
  scopeKey: string,
  content: string,
): Promise<ScopedWikiArticle> {
  const { data: existing, error: existingError } = await supabase
    .from('wiki_articles')
    .select('id')
    .eq('world_id', worldId)
    .eq('style', style)
    .eq('scope_type', scopeType)
    .maybeSingle();
  if (existingError) throw existingError;

  const generatedAt = new Date().toISOString();
  if (existing) {
    const { data, error } = await supabase
      .from('wiki_articles')
      .update({ content, scope_key: scopeKey, generated_at: generatedAt, updated_at: generatedAt })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as ScopedWikiArticle;
  }

  const { data, error } = await supabase
    .from('wiki_articles')
    .insert({ world_id: worldId, style, scope_type: scopeType, scope_key: scopeKey, content, generated_at: generatedAt })
    .select()
    .single();
  if (error) throw error;
  return data as ScopedWikiArticle;
}

export async function resetScopedWikiArticle(
  worldId: string,
  style: string,
  scopeType: WikiScopeType,
): Promise<void> {
  const { error } = await supabase
    .from('wiki_articles')
    .delete()
    .eq('world_id', worldId)
    .eq('style', style)
    .eq('scope_type', scopeType);
  if (error) throw error;
}
