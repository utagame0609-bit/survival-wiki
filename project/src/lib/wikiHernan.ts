export type HernanSection = {
  id: string;
  number: string;
  title: string;
  subTitle?: string;
  paragraphs: string[];
  photoIndexes?: number[];
};

export type HernanCitation = {
  id: number;
  text: string;
  sourceType: 'observation' | 'log_record' | 'hernan_hypothesis';
};

export type HernanEncyclopediaV1 = {
  format: 'hernan-encyclopedia-v1';
  title: string;
  subtitle?: string;
  leadParagraph: string;
  sections: HernanSection[];
  citations?: HernanCitation[];
  categories?: string[];
  hernanComment: string;
};

type RawPayload = Partial<Omit<HernanEncyclopediaV1, 'format'>> & {
  narratorLine?: string;
};

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`エルナン構造化記事の ${field} が不足しています。`);
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

function normalizeSections(value: unknown): HernanSection[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('エルナン構造化記事の sections が不足しています。');
  }

  const sections = value.flatMap((section, index) => {
    if (!section || typeof section !== 'object') return [];
    const record = section as Record<string, unknown>;
    const paragraphs = Array.isArray(record.paragraphs)
      ? record.paragraphs
          .filter((paragraph): paragraph is string => typeof paragraph === 'string' && Boolean(paragraph.trim()))
          .map((paragraph) => paragraph.trim())
      : [];
    if (paragraphs.length === 0) return [];

    const id = (optionalString(record.id) ?? `section-${index + 1}`)
      .replace(/[^a-zA-Z0-9_-]/g, '-') || `section-${index + 1}`;
    const photoIndexes = normalizePhotoIndexes(record.photoIndexes);

    return [{
      id,
      number: optionalString(record.number) ?? String(index + 1),
      title: optionalString(record.title) ?? `第${index + 1}節`,
      ...(optionalString(record.subTitle) ? { subTitle: optionalString(record.subTitle) } : {}),
      paragraphs,
      ...(photoIndexes ? { photoIndexes } : {}),
    }];
  });

  if (sections.length === 0) throw new Error('エルナン構造化記事に有効な本文節がありません。');
  return sections;
}

function normalizeCitations(value: unknown): HernanCitation[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const citations = value.flatMap((citation, index) => {
    if (!citation || typeof citation !== 'object') return [];
    const record = citation as Record<string, unknown>;
    const text = optionalString(record.text);
    if (!text) return [];
    const sourceType = record.sourceType === 'log_record' || record.sourceType === 'hernan_hypothesis'
      ? record.sourceType
      : 'observation';
    return [{ id: Number.isInteger(record.id) ? Number(record.id) : index + 1, text, sourceType }];
  });
  return citations.length > 0 ? citations : undefined;
}

function normalizeCategories(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const categories = Array.from(new Set(value
    .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    .map((item) => item.trim())))
    .slice(0, 8);
  return categories.length > 0 ? categories : undefined;
}

function extractJson(raw: string): string {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('エルナン構造化記事のJSONを取得できませんでした。');
  return trimmed.slice(start, end + 1);
}

export function parseHernanAiResponse(raw: string): { article: HernanEncyclopediaV1; narratorLine: string } {
  let parsed: RawPayload;
  try {
    parsed = JSON.parse(extractJson(raw)) as RawPayload;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('エルナン構造化記事')) throw error;
    throw new Error('エルナン構造化記事のJSON解析に失敗しました。');
  }

  return {
    article: {
      format: 'hernan-encyclopedia-v1',
      title: requiredString(parsed.title, 'title'),
      ...(optionalString(parsed.subtitle) ? { subtitle: optionalString(parsed.subtitle) } : {}),
      leadParagraph: requiredString(parsed.leadParagraph, 'leadParagraph'),
      sections: normalizeSections(parsed.sections),
      ...(normalizeCitations(parsed.citations) ? { citations: normalizeCitations(parsed.citations) } : {}),
      ...(normalizeCategories(parsed.categories) ? { categories: normalizeCategories(parsed.categories) } : {}),
      hernanComment: requiredString(parsed.hernanComment, 'hernanComment'),
    },
    narratorLine: requiredString(parsed.narratorLine, 'narratorLine'),
  };
}

export function parseStoredHernanArticle(content: string): HernanEncyclopediaV1 | null {
  try {
    const parsed = JSON.parse(content) as Partial<HernanEncyclopediaV1>;
    if (parsed?.format !== 'hernan-encyclopedia-v1') return null;
    return {
      format: 'hernan-encyclopedia-v1',
      title: requiredString(parsed.title, 'title'),
      ...(optionalString(parsed.subtitle) ? { subtitle: optionalString(parsed.subtitle) } : {}),
      leadParagraph: requiredString(parsed.leadParagraph, 'leadParagraph'),
      sections: normalizeSections(parsed.sections),
      ...(normalizeCitations(parsed.citations) ? { citations: normalizeCitations(parsed.citations) } : {}),
      ...(normalizeCategories(parsed.categories) ? { categories: normalizeCategories(parsed.categories) } : {}),
      hernanComment: requiredString(parsed.hernanComment, 'hernanComment'),
    };
  } catch {
    return null;
  }
}

export function hernanArticleToPlainText(content: string, narratorLine = ''): string | null {
  const article = parseStoredHernanArticle(content);
  if (!article) return null;
  const lines: string[] = [article.title];
  if (article.subtitle) lines.push(article.subtitle);
  lines.push('', article.leadParagraph);
  article.sections.forEach((section) => {
    lines.push('', `${section.number}. ${section.title}`);
    if (section.subTitle) lines.push(section.subTitle);
    lines.push('', ...section.paragraphs);
  });
  if (article.citations?.length) {
    lines.push('', '脚注・観測出典');
    article.citations.forEach((citation) => lines.push(`[${citation.id}] ${citation.text}`));
  }
  lines.push('', '編纂官注記', article.hernanComment);
  if (narratorLine.trim()) lines.push('', narratorLine.trim());
  return lines.join('\n');
}

export const HERNAN_STRUCTURED_OUTPUT_INSTRUCTIONS = `
【エルナン百科事典 / 図版本文統合 構造化出力ルール】
この指示は上記のMarkdown出力指定より優先します。Markdown本文は出力しないでください。
返答は必ずJSONオブジェクト1個だけにしてください。コードフェンス、前置き、後書きは禁止です。指定外のキーを追加しないでください。

出力スキーマ:
{
  "title": "百科事典記事タイトル",
  "subtitle": "任意。短い学術分類または記事副題",
  "leadParagraph": "記事冒頭の導入段落",
  "sections": [
    {
      "id": "英数字とハイフンの一意なID",
      "number": "1 / 2 / 2.1 など",
      "title": "節タイトル",
      "subTitle": "任意の短い副題",
      "paragraphs": ["本文段落1", "本文段落2"],
      "photoIndexes": [2]
    }
  ],
  "citations": [
    { "id": 1, "text": "観測記録やエルナンの仮説を短く示す脚注", "sourceType": "observation" }
  ],
  "categories": ["任意カテゴリ"],
  "hernanComment": "記事末尾の短い編纂官注記",
  "narratorLine": "今回固有の記録を一つ拾う80文字以内のエルナン本人の一言"
}

写真と本文の対応は最重要です。
- 入力には写真1〜写真5が、各写真直前のラベルと実画像の組で与えられます。
- 写真について本文で具体的に述べる節には、その写真番号を photoIndexes に入れてください。
- 例: 写真2に洞窟入口が写り、その節で洞窟入口を論じるなら、その節へ "photoIndexes": [2] を設定します。
- 写真に写っている内容と無関係な節へ、単に均等配置する目的で写真番号を割り当ててはいけません。
- 1枚の写真を原則として複数節へ重複配置しません。
- 本文で写真に触れる場合は「写真では〜が確認できる」「図版に見られる〜」など、近くに図版が置かれて自然な文章にしてください。
- 写真から判別できない素材・装備名・用途・由来なども、エルナンの学説・見立てとして推測してよい。ただし「〜と考えられる」「〜だった可能性がある」「〜のようにも見受けられる」などを使い、写真から確認できた事実のように断定しません。
- 写真URL、Storageパス、内部IDは出力しません。photoIndexesは入力で与えられた1〜5の番号だけを使います。
- 写真が0枚なら、すべての節で photoIndexes を省略してください。

【記録者との関係・記事の主役】
- エルナンにとって記録者は、貴重な一次資料を持ち帰る現地協力者です。同時に、本人が意識しないまま新しい習慣、命名、建築様式、行動文化を生み出す観察対象でもあります。
- 記録者へ敬意を持ちつつ、些細な選択を必要以上に歴史化・文化化してください。記録者を直接笑うのではなく、行動の規模に対して分析が立派すぎることから面白さを作ります。
- 入力を整理して言い換えるだけで終わらせず、記録された行動・選択・結果・反復・数量・優先順位・失敗または成功から、記録者らしさが最も表れている要素を原則1つ以上選び、記事の中心軸を作ってください。
- 面白さの対象は記録に根拠がある行動と結果です。人物の知性、能力、容姿、属性、存在価値を笑いの対象にしません。
- 大きな達成、喪失、思い出、深刻な事故では、記録の価値と感情を優先し、無理に笑いを作りません。適したネタがない場合は、静かな愛嬌やエルナン固有の観察を残すだけで構いません。
- マダム・ロゼのような、本人への直接的な毒舌、ゴシップ的な呼びかけ、酒場の軽口を笑いの主軸にしません。

【生成対象範囲】
- 実装側から明示された月・年・全年などの生成対象範囲を、記事全体の時間的スコープとして扱ってください。
- タイトル、導入、本文、結論、narratorLineまで、選択された範囲と矛盾させません。
- 期間内の象徴的な出来事や「30日間」などの強い表現を、記事全体の対象期間と誤認しません。
- 実装側から与えられていない期間、日付、月名を新しく作りません。
- 長期間の記事では全記録を羅列せず、重要な変化・転機・反復行動を選別して扱ってください。

【複数資料の不一致】
- メモ、写真、日時、座標など複数の入力資料が一致しない場合、一方を根拠なく正しいものとして確定しません。
- 確認できる情報だけを事実として記述し、不一致部分は資料差、可能性、エルナンの見立てとして扱ってください。
- 不一致そのものを、隠蔽、異常、嘘、失敗の証拠として扱いません。

【出力量】
- AIが生成し、ユーザーに表示される全テキストは合計3000文字以内とします。
- 対象にはtitle、subtitle、leadParagraph、節見出し、本文、citations、categories、hernanComment、narratorLineを含みます。
- JSONキー、内部ID、URL、R2パス、photoIndexesなどの構造データは文字数へ含めません。
- 通常は2400文字前後を目安にまとめ、情報量が多い場合も重要記録を選別・圧縮してください。
- 文字数を満たすために、同じ事実や評価を言い換えて繰り返しません。

その他の必須条件:
- title / leadParagraph / sections / hernanComment / narratorLine は必須。
- sectionsは情報量に応じて3〜7節程度。無理な水増しをしません。
- 入力されたロケーション名は一文字も変更しません。
- 確認事実・合理的推測・エルナンの学説をSystem Promptの規則どおり区別します。
- 情報が少ない場合は、確認事実を起点に、背景・由来・文化的意味・行動意図・用途候補などをエルナンらしい学説として大胆に広げて構いません。入力にない内容は必ず推測・仮説・演出だと読者が分かる形にし、確定事実として断定しません。
- 「想像しない」ことを優先して記事を薄くしないでください。自由な仮説は歓迎しますが、自由な断定は禁止です。
- 架空の出典、実在しない文献名、入力にない日時や人物を事実として追加しません。
- citationsは入力記録またはエルナン自身の仮説を整理するための内部的な脚注だけにし、外部実在文献を捏造しません。
- sourceTypeは observation / log_record / hernan_hypothesis のいずれかです。
`;
