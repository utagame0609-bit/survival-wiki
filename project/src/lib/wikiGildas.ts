export type GildasChapter = {
  id: string;
  numeral: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  bardMarginalia?: string;
  keyMoment?: string;
  photoIndexes?: number[];
};

export type GildasChronicleV1 = {
  format: 'gildas-chronicle-v1';
  title: string;
  chronicleCode?: string;
  introduction: string;
  chapters: GildasChapter[];
  gildasComment: {
    commentary: string;
    epilogueNote?: string;
  };
};

type RawGildasAiPayload = Partial<Omit<GildasChronicleV1, 'format'>> & {
  narratorLine?: string;
};

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`ギルダス構造化記事の ${field} が不足しています。`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizePhotoIndexes(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const indexes = Array.from(new Set(value
    .filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 5)
    .map((item) => Number(item))));
  return indexes.length > 0 ? indexes : undefined;
}

function normalizeChapters(value: unknown): GildasChapter[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('ギルダス構造化記事の chapters が不足しています。');
  }

  const chapters = value.flatMap((chapter, index) => {
    if (!chapter || typeof chapter !== 'object') return [];
    const record = chapter as Record<string, unknown>;
    const paragraphs = Array.isArray(record.paragraphs)
      ? record.paragraphs
          .filter((paragraph): paragraph is string => typeof paragraph === 'string' && Boolean(paragraph.trim()))
          .map((paragraph) => paragraph.trim())
      : [];
    if (paragraphs.length === 0) return [];

    const rawId = optionalString(record.id) ?? `chapter-${index + 1}`;
    const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '-') || `chapter-${index + 1}`;
    const photoIndexes = normalizePhotoIndexes(record.photoIndexes);

    return [{
      id,
      numeral: optionalString(record.numeral) ?? String(index + 1),
      title: optionalString(record.title) ?? `第${index + 1}節`,
      ...(optionalString(record.subtitle) ? { subtitle: optionalString(record.subtitle) } : {}),
      paragraphs,
      ...(optionalString(record.bardMarginalia) ? { bardMarginalia: optionalString(record.bardMarginalia) } : {}),
      ...(optionalString(record.keyMoment) ? { keyMoment: optionalString(record.keyMoment) } : {}),
      ...(photoIndexes ? { photoIndexes } : {}),
    }];
  });

  if (chapters.length === 0) {
    throw new Error('ギルダス構造化記事に有効な本文章がありません。');
  }
  return chapters;
}

function normalizeComment(value: unknown): GildasChronicleV1['gildasComment'] {
  if (!value || typeof value !== 'object') {
    throw new Error('ギルダス構造化記事の gildasComment が不足しています。');
  }
  const record = value as Record<string, unknown>;
  return {
    commentary: asString(record.commentary, 'gildasComment.commentary'),
    ...(optionalString(record.epilogueNote) ? { epilogueNote: optionalString(record.epilogueNote) } : {}),
  };
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const start = withoutFence.indexOf('{');
  const end = withoutFence.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('ギルダス構造化記事のJSONを取得できませんでした。');
  return withoutFence.slice(start, end + 1);
}

export function parseGildasAiResponse(raw: string): { chronicle: GildasChronicleV1; narratorLine: string } {
  let parsed: RawGildasAiPayload;
  try {
    parsed = JSON.parse(extractJson(raw)) as RawGildasAiPayload;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('ギルダス構造化記事')) throw error;
    throw new Error('ギルダス構造化記事のJSON解析に失敗しました。');
  }

  return {
    chronicle: {
      format: 'gildas-chronicle-v1',
      title: asString(parsed.title, 'title'),
      ...(optionalString(parsed.chronicleCode) ? { chronicleCode: optionalString(parsed.chronicleCode) } : {}),
      introduction: asString(parsed.introduction, 'introduction'),
      chapters: normalizeChapters(parsed.chapters),
      gildasComment: normalizeComment(parsed.gildasComment),
    },
    narratorLine: asString(parsed.narratorLine, 'narratorLine'),
  };
}

export function parseStoredGildasChronicle(content: string): GildasChronicleV1 | null {
  try {
    const parsed = JSON.parse(content) as Partial<GildasChronicleV1>;
    if (parsed?.format !== 'gildas-chronicle-v1') return null;
    return {
      format: 'gildas-chronicle-v1',
      title: asString(parsed.title, 'title'),
      ...(optionalString(parsed.chronicleCode) ? { chronicleCode: optionalString(parsed.chronicleCode) } : {}),
      introduction: asString(parsed.introduction, 'introduction'),
      chapters: normalizeChapters(parsed.chapters),
      gildasComment: normalizeComment(parsed.gildasComment),
    };
  } catch {
    return null;
  }
}

export function gildasChronicleToPlainText(content: string, narratorLine = ''): string | null {
  const chronicle = parseStoredGildasChronicle(content);
  if (!chronicle) return null;

  const lines: string[] = [chronicle.title, '', chronicle.introduction];
  for (const chapter of chronicle.chapters) {
    lines.push('', `第${chapter.numeral}節 ${chapter.title}`);
    if (chapter.subtitle) lines.push(chapter.subtitle);
    if (chapter.keyMoment) lines.push('', `「${chapter.keyMoment}」`);
    lines.push('', ...chapter.paragraphs);
    if (chapter.bardMarginalia) lines.push('', `ギルダスの余白書き: ${chapter.bardMarginalia}`);
  }

  lines.push('', '吟遊詩人の言葉');
  if (narratorLine.trim()) lines.push(narratorLine.trim());
  lines.push(chronicle.gildasComment.commentary);
  if (chronicle.gildasComment.epilogueNote) lines.push(chronicle.gildasComment.epilogueNote);
  return lines.join('\n');
}

export const GILDAS_STRUCTURED_OUTPUT_INSTRUCTIONS = `
【ギルダス A案 / THE TRAVELER'S CHRONICLE 構造化出力ルール】
この指示は上記のMarkdown出力指定より優先します。Markdown本文は出力しないでください。
返答は必ずJSONオブジェクト1個だけにしてください。コードフェンス、前置き、後書きは禁止です。指定外のキーを追加しないでください。

出力スキーマ:
{
  "title": "記事全体を象徴する、意味を理解しやすいタイトル",
  "chronicleCode": "任意。演出上必要な場合だけ使う短い管理記号。架空年代・架空日付は禁止",
  "introduction": "土地・確認事実・物語の主題を示す2〜4文の導入",
  "chapters": [
    {
      "id": "英数字とハイフンの一意なID",
      "numeral": "壱 / 弐 / 参 / 四 / 五 などの短い章番号表記",
      "title": "章タイトル",
      "subtitle": "任意の短い副題",
      "paragraphs": ["本文段落1", "本文段落2"],
      "keyMoment": "任意。章の核となる短い一節。入力事実か、詩的解釈と分かる表現にする",
      "bardMarginalia": "任意。ギルダスの短い余白書き。本文にない新事実は追加しない",
      "photoIndexes": [1]
    }
  ],
  "gildasComment": {
    "commentary": "記事を読み終えた後に置く短い後書き。要約ではなく記録への愛着・祝福・余韻を示す",
    "epilogueNote": "任意。ごく短い締めの一節"
  },
  "narratorLine": "今回固有の記録を一つ拾う40〜90文字程度のギルダス本人の一言"
}

必須条件:
- title / introduction / chapters / gildasComment.commentary / narratorLine は必須。
- chaptersは2〜6章程度。情報量に応じて増減し、無理に水増ししない。
- ユーザー入力のロケーション名は一文字も変更しない。
- chronicleCodeを出す場合も、皇歴・星暦・架空の年号・入力にない日時を作らない。
- 星、夜空、天体、滅亡、終末を固定モチーフにしない。入力に根拠がある場合だけ使う。
- keyMoment / bardMarginalia は毎章必須ではない。ない場合は空文字ではなくキー自体を省略してよい。
- 確認事実と詩的解釈・仮想伝承の境界はSystem Promptの規則を厳守する。
- 写真URL、Storageパス、画像IDをJSONへ出さない。
- 入力には写真1〜写真5が各ラベルと実画像の組で与えられる。章本文で具体的に扱う写真番号だけを photoIndexes に設定する。
- 写真と無関係な章へ均等配置目的で番号を割り当てない。同じ写真を原則として複数章へ重複配置しない。
- 写真について本文で語る場合は、対応する photoIndexes を同じ章へ必ず付ける。写真が0枚なら photoIndexes を省略する。
- narratorLineは記事本文の要約にせず、ギルダス本人が最後まで本気で記録価値を認める一言にする。
`;
