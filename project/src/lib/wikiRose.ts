export type MadameRoseEditorComment = {
  message: string;
  stampText?: string;
  subNotice?: string;
};

export type MadameRoseTabloidV1 = {
  format: 'madame-rose-tabloid-v1';
  title: string;
  category?: string;
  contentMarkdown: string;
  editorComment: MadameRoseEditorComment;
  tags?: string[];
};

type RawMadameRoseAiPayload = Partial<Omit<MadameRoseTabloidV1, 'format'>> & {
  narratorLine?: string;
};

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`マダム・ロゼ記事の ${field} が不足しています。`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const tags = Array.from(new Set(
    value
      .filter((tag): tag is string => typeof tag === 'string' && Boolean(tag.trim()))
      .map((tag) => tag.trim().replace(/^#+/, ''))
      .filter(Boolean),
  )).slice(0, 6);
  return tags.length > 0 ? tags : undefined;
}

function normalizeEditorComment(value: unknown): MadameRoseEditorComment {
  if (!value || typeof value !== 'object') {
    throw new Error('マダム・ロゼ記事の editorComment が不足しています。');
  }
  const record = value as Record<string, unknown>;
  return {
    message: requiredString(record.message, 'editorComment.message'),
    ...(optionalString(record.stampText) ? { stampText: optionalString(record.stampText) } : {}),
    ...(optionalString(record.subNotice) ? { subNotice: optionalString(record.subNotice) } : {}),
  };
}

function extractJson(raw: string): string {
  const trimmed = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) {
    throw new Error('マダム・ロゼ記事のJSONを取得できませんでした。');
  }
  return trimmed.slice(start, end + 1);
}

export function parseMadameRoseAiResponse(raw: string): {
  article: MadameRoseTabloidV1;
  narratorLine: string;
} {
  let parsed: RawMadameRoseAiPayload;
  try {
    parsed = JSON.parse(extractJson(raw)) as RawMadameRoseAiPayload;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('マダム・ロゼ記事')) throw error;
    throw new Error('マダム・ロゼ記事のJSON解析に失敗しました。');
  }

  return {
    article: {
      format: 'madame-rose-tabloid-v1',
      title: requiredString(parsed.title, 'title'),
      ...(optionalString(parsed.category) ? { category: optionalString(parsed.category) } : {}),
      contentMarkdown: requiredString(parsed.contentMarkdown, 'contentMarkdown'),
      editorComment: normalizeEditorComment(parsed.editorComment),
      ...(normalizeTags(parsed.tags) ? { tags: normalizeTags(parsed.tags) } : {}),
    },
    narratorLine: requiredString(parsed.narratorLine, 'narratorLine'),
  };
}

export function parseStoredMadameRoseArticle(content: string): MadameRoseTabloidV1 | null {
  try {
    const parsed = JSON.parse(content) as Partial<MadameRoseTabloidV1>;
    if (parsed?.format !== 'madame-rose-tabloid-v1') return null;
    return {
      format: 'madame-rose-tabloid-v1',
      title: requiredString(parsed.title, 'title'),
      ...(optionalString(parsed.category) ? { category: optionalString(parsed.category) } : {}),
      contentMarkdown: requiredString(parsed.contentMarkdown, 'contentMarkdown'),
      editorComment: normalizeEditorComment(parsed.editorComment),
      ...(normalizeTags(parsed.tags) ? { tags: normalizeTags(parsed.tags) } : {}),
    };
  } catch {
    return null;
  }
}

export function madameRoseArticleToPlainText(content: string, narratorLine = ''): string | null {
  const article = parseStoredMadameRoseArticle(content);
  if (!article) return null;

  const markdownText = article.contentMarkdown
    .replace(/<!--ROSE_PHOTO:\d+-->/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

  return [
    article.title,
    article.category ? `分類: ${article.category}` : '',
    '',
    markdownText,
    '',
    'LAST CALL ── FROM THE EDITOR',
    narratorLine.trim(),
    article.editorComment.message,
  ].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join('\n');
}

export const MADAME_ROSE_STRUCTURED_OUTPUT_INSTRUCTIONS = `
【マダム・ロゼ / ROSE'S LAST CALL 構造化出力ルール】
この指示は上記のMarkdown出力指定より優先します。返答全体は必ずJSONオブジェクト1個だけにしてください。コードフェンス、前置き、後書きは禁止です。指定外のキーを追加しないでください。

出力スキーマ:
{
  "title": "タブロイド一面に置ける、今回の記録に根拠がある見出し",
  "category": "任意。今回の記事を短く分類する語。入力事実にない事件分類を捏造しない",
  "contentMarkdown": "記事本文。Markdownで見出し・段落・引用・リスト・区切り線を使用可能。写真を掲載する位置には <!--ROSE_PHOTO:1--> のような専用マーカーを単独行で置く",
  "editorComment": {
    "message": "LAST CALL欄に置くマダム・ロゼの編集後記。記事要約ではなく、今回固有の記録へ最後の一刺しと愛情を残す",
    "stampText": "任意。短い編集スタンプ。事実にない危険度・判決・被害額を捏造しない",
    "subNotice": "任意。短い補足。推測の場合は推測と分かる表現にする"
  },
  "tags": ["任意の短いタグ"],
  "narratorLine": "マダム・ロゼ本人の40〜90文字程度の一言。記事冒頭の編纂官通信に使う"
}

必須条件:
- title / contentMarkdown / editorComment.message / narratorLine は必須。
- contentMarkdownの本文は、記事全体の表示文字数上限の中で必ず結論まで完結させる。
- 一面見出し、事件のあらまし、ロゼの寸評、評価できる点、次回の生存予報、編集後記などから、入力内容に必要なものだけを選ぶ。固定テンプレート化しない。
- contentMarkdown内の最上位見出しは ## から始める。記事タイトルはtitleフィールドで別表示するため # タイトルを重複出力しない。
- 引用（>）は赤鉛筆注釈として表示されるため、ロゼの短い寸評や噂・推測の区別に必要な場合だけ使う。
- 写真は入力として実画像が与えられた写真1〜写真5だけを扱う。掲載する場合は対応する <!--ROSE_PHOTO:N--> を単独行で置く。
- 写真マーカーは同じ番号を原則1回だけ使う。均等配置のためだけに写真を置かない。写真に本文で触れる場合は、その近くへ対応マーカーを置く。
- 写真URL、Storageパス、画像IDをJSONへ出さない。
- 入力されたロケーション名は一文字も変更しない。
- UI用の天候、価格、危険度、酒場所在地など、入力にない装飾データを生成しない。
- tagsは0〜6個。入力内容から自然に分類できるものだけを使い、架空の事件や属性をタグ化しない。
- stampTextは演出用の短文に限る。入力にない「死亡」「重傷」「犯罪」「被害総額」等を確定表示しない。
- narratorLineとeditorComment.messageは同じ文章にしない。narratorLineは記事を開いた時の短評、editorCommentは読み終えた後の締めとして役割を分ける。
- 情報不足時の想像補完は正式System Promptのルールを厳守し、推測・噂・ロゼの見立てと分かる形にする。
`;
