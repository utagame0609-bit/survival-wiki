import type { WikiGenerationInput, WikiGenerationResult, WikiProvider } from './wiki';
import { getWikiSystemPrompt } from './wiki';
import { parseScpAiResponse, SCP_STRUCTURED_OUTPUT_INSTRUCTIONS } from './wikiScp';
import { MADAME_ROSE_STRUCTURED_OUTPUT_INSTRUCTIONS, parseMadameRoseAiResponse } from './wikiRose';
import { MADAM_ROSE_SYSTEM_PROMPT } from './wikiRosePrompt';
import { HERNAN_STRUCTURED_OUTPUT_INSTRUCTIONS, parseHernanAiResponse } from './wikiHernan';
import { supabase } from './supabase';
import { WIKI_ARTICLE_CHAR_LIMIT, type WikiCoverageMode, type WikiScopeType } from './wikiScope';

const DEFAULT_MAX_WIKI_AI_PHOTOS = 5;

type WikiPhotoCandidate = {
  key: string;
  storagePath: string;
  createdAt: string;
  locationId: string;
  locationName: string;
};

type WikiPhotoInput = {
  storagePath: string;
  label: string;
};

type WikiPlanSection = {
  title: string;
  primaryRecordKeys: string[];
  supportingRecordKeys: string[];
  purpose: string;
};

type WikiSourcePlan = {
  storyArc: string;
  openingRecordKey: string;
  closingRecordKey: string;
  importantRecordKeys: string[];
  selectedPhotoKeys: string[];
  omittedRecordKeys: string[];
  sections: WikiPlanSection[];
};

export type WikiGenerationContext = {
  scopeType: WikiScopeType;
  scopeKey: string;
  scopeLabel: string;
  mode: WikiCoverageMode;
  maxArticleChars?: number;
  maxAiPhotos?: number;
};

const PLANNING_LENS_BY_STYLE: Record<WikiGenerationInput['style'], string> = {
  wikipedia: '歴史・文化・地理・生活・技術上の変化や発見を重視し、百科事典として整理しやすい節目を選ぶ。',
  scp: '観測上の変化、原因と結果、危険・失敗・反証・管理判断につながる節目を重視する。ただし異常事象を捏造しない。',
  ancient: '行動・判断・浪費・失敗・成功・妙な執着・生還など、マダム・ロゼがタブロイド記事として料理しやすい転機を重視する。事実と噂・推測の境界は崩さない。',
};

function buildSourcePlanningSystemPrompt(maxAiPhotos: number, context: WikiGenerationContext) {
  const coverageRule = context.mode === 'full'
    ? 'FULL編纂です。入力された全記録を落とさず、各記録を最低1回はsectionsのprimaryRecordKeysまたはsupportingRecordKeysへ含めてください。omittedRecordKeysは空配列にしてください。'
    : `DIGEST編纂です。まず全記録を読んで記事全体の「起・承・転・結」を設計してから、関連性の薄い記録だけを省略候補にしてください。
- 重要度ランキングだけで先に記録を削らないでください。先に物語上の役割を決め、その後に不要記録を省きます。
- openingRecordKey には記事の「起」として機能する記録を1件選び、closingRecordKey には記事の「結」または現在地点として機能する記録を1件選んでください。
- 対象期間の最古記録が自然に「起」として機能するなら、それをopeningRecordKeyに選び、omittedRecordKeysへ入れてはいけません。
- 対象期間の最新記録が自然に「結」または現在地点として機能するなら、それをclosingRecordKeyに選び、omittedRecordKeysへ入れてはいけません。
- 最古・最新という理由だけで無条件に採用する必要はありません。記事の流れと明確に無関係なら別の記録を起点・終点に選んで構いません。
- データが少ない場合ほど過剰に削らず、起承転結の連続性を優先してください。ただし関連性のない単発記録まで無理につなげないでください。
- openingRecordKey と closingRecordKey に選んだ記録は本文に必ず意味のある形で反映させてください。`;

  return `
あなたはSurvival Wikiの記事を書く前段階を担当する資料編集者です。
この段階では記事本文を書きません。対象期間の全記録テキスト、時系列、メイン写真の有無とメタデータだけを読み、最終記事の編集計画と「実画像を確認する価値が高いメイン写真」を選びます。

編纂対象: ${context.scopeLabel}
編纂モード: ${context.mode.toUpperCase()}
${coverageRule}

最優先ルール:
- 入力にない出来事、感情、写真内容を事実として追加しない。
- この段階では写真の実画像は見えていない。写真に何が写っているか推測・断定しない。
- 記録全体の時系列を把握し、記事の導入・展開・転機・着地点が自然につながる大枠を作る。
- importantRecordKeys は、最終記事で特に重点を置く価値がある記録だけを選ぶ。
- sections は、全体を読みやすく整理するための編集設計である。同じ記録を理由なく複数章へ重複させない。
- 写真候補は記事全体を代表できるよう、同じ時期へ不必要に偏らせない。
- 写真候補は最大${maxAiPhotos}枚。候補が存在する場合は1枚以上選ぶ。
- 写真キーは入力に存在する P1, P2... のみ使用する。
- 記録キーは入力に存在する R1, R2... のみ使用する。
- 追加写真・サブ写真は候補として与えられない。存在を推測しない。

次のJSONだけを返す。Markdownコードフェンスや説明文は付けない。
{
  "storyArc": "確認事実だけを土台にした記事全体の起・承・転・結を2〜4文で記述",
  "openingRecordKey": "R1",
  "closingRecordKey": "R7",
  "importantRecordKeys": ["R1", "R4", "R7"],
  "selectedPhotoKeys": ["P1", "P4", "P7"],
  "omittedRecordKeys": [],
  "sections": [
    {
      "title": "章の役割が分かる短い仮タイトル",
      "primaryRecordKeys": ["R1"],
      "supportingRecordKeys": ["R2"],
      "purpose": "この章で何を伝えるかを1文で記述"
    }
  ]
}
`;
}

const NARRATOR_LINE_TONE_INSTRUCTIONS: Record<WikiGenerationInput['style'], string> = {
  wikipedia: `
【生成後のエルナン本人の一言 / 口調固定】
- narratorLine は民俗学者エルナン本人の発話として書く。
- 本文と同じ人格を維持し、落ち着いた「〜である」「〜だ」「〜と考える」「〜と見てよい」等の常体を基本にする。
- 一般的なAI応答・接客文の「〜です」「〜ます」「〜いたします」「〜ございます」へ勝手に丁寧化しない。
- 学者としての自信、学術的な過剰分析、今回固有の小さな事実との落差を短く残す。
`,
  scp: `
【生成後のDr.アーク本人の一言 / 口調固定】
- narratorLine はDr.アーク本人の発話として書く。
- 簡潔で冷静な機密報告・判定口調を維持し、「〜と判断する」「〜で十分だ」「案件は終了する」「記録は残す」等の常体を基本にする。
- 一般的なAI応答・接客文の「〜です」「〜ます」「〜いたします」「〜ございます」へ勝手に丁寧化しない。
- 大声のホラーや感情的な語尾ではなく、真顔の判断と今回固有の事実の落差を短く残す。
`,
  ancient: `
【生成後のマダム・ロゼ本人の一言 / 口調固定】
- narratorLine はマダム・ロゼ本人の発話として書く。
- 標準語で、荒野の酒場マスター兼タブロイド編集長らしい短く辛口な常体を基本にする。
- 今回固有の行動・判断・成功・失敗のどれか一つを拾い、愛情のある毒舌と「また生きて帰ってこい」という温度を残す。
- 入力にない失敗や危険を作らない。推測を入れる場合は噂・見立て・可能性だと分かる表現にする。
- エルナンの学術解説、Dr.アークの機密判定、旧吟遊詩人の英雄譚へ寄せない。
`,
};

function chronologicalLocations(input: WikiGenerationInput) {
  return [...input.locations].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function collectWikiPhotoCandidates(input: WikiGenerationInput): WikiPhotoCandidate[] {
  return chronologicalLocations(input)
    .flatMap((location) => location.photos
      .filter((photo) => photo.is_main)
      .map((photo) => ({ location, photo })))
    .filter((entry, index, list) => list.findIndex((item) => item.photo.storage_path === entry.photo.storage_path) === index)
    .sort((a, b) => a.photo.created_at.localeCompare(b.photo.created_at))
    .map(({ location, photo }, index) => ({
      key: `P${index + 1}`,
      storagePath: photo.storage_path,
      createdAt: photo.created_at,
      locationId: location.id,
      locationName: location.name,
    }));
}

function buildSourcePlanningMessage(
  input: WikiGenerationInput,
  candidates: WikiPhotoCandidate[],
  context: WikiGenerationContext,
) {
  const locations = chronologicalLocations(input);
  const candidateByLocation = new Map(candidates.map((candidate) => [candidate.locationId, candidate]));

  return [
    `記事スタイル: ${input.style}`,
    `編纂対象: ${context.scopeLabel}`,
    `編纂モード: ${context.mode.toUpperCase()}`,
    `スタイル別の編集観点: ${PLANNING_LENS_BY_STYLE[input.style]}`,
    `ワールド名: ${input.world.name}`,
    `ワールド概要: ${input.world.memo || 'なし'}`,
    `プレイヤー: ${input.world.player || 'なし'}`,
    `総記録数: ${locations.length}`,
    `AI参照候補のメイン写真数: ${candidates.length}`,
    context.mode === 'digest' && locations.length > 0
      ? `時系列アンカー候補: 最古 R1 (${locations[0].created_at}) / 最新 R${locations.length} (${locations[locations.length - 1].created_at})`
      : '',
    '',
    ...locations.map((location, index) => {
      const photo = candidateByLocation.get(location.id);
      return [
        `【記録R${index + 1}】`,
        `ロケーション名: ${location.name}`,
        `座標: ${location.has_coordinates ? `${location.x}, ${location.y}, ${location.z}` : '未入力'}`,
        `詳細メモ: ${location.detail_memo || 'なし'}`,
        `作成日時: ${location.created_at}`,
        `関連メンバー: ${location.members.map((member) => member.name).join('・') || 'なし'}`,
        photo
          ? `メイン写真候補 ${photo.key}: 撮影記録日時 ${photo.createdAt}`
          : 'メイン写真候補: なし',
        '',
      ].join('\n');
    }),
  ].filter(Boolean).join('\n');
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function parseSourcePlan(raw: string): WikiSourcePlan | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;

  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Partial<WikiSourcePlan>;
    const sections = Array.isArray(parsed.sections)
      ? parsed.sections
        .filter((section): section is WikiPlanSection => Boolean(section) && typeof section === 'object')
        .map((section) => ({
          title: typeof section.title === 'string' ? section.title.trim() : '',
          primaryRecordKeys: stringArray(section.primaryRecordKeys),
          supportingRecordKeys: stringArray(section.supportingRecordKeys),
          purpose: typeof section.purpose === 'string' ? section.purpose.trim() : '',
        }))
        .filter((section) => section.title || section.purpose || section.primaryRecordKeys.length > 0)
      : [];

    return {
      storyArc: typeof parsed.storyArc === 'string' ? parsed.storyArc.trim() : '',
      openingRecordKey: typeof parsed.openingRecordKey === 'string' ? parsed.openingRecordKey.trim() : '',
      closingRecordKey: typeof parsed.closingRecordKey === 'string' ? parsed.closingRecordKey.trim() : '',
      importantRecordKeys: stringArray(parsed.importantRecordKeys),
      selectedPhotoKeys: stringArray(parsed.selectedPhotoKeys),
      omittedRecordKeys: stringArray(parsed.omittedRecordKeys),
      sections,
    };
  } catch {
    return null;
  }
}

function protectDigestStoryAnchors(
  plan: WikiSourcePlan,
  input: WikiGenerationInput,
  context: WikiGenerationContext,
): WikiSourcePlan {
  if (context.mode !== 'digest') return plan;

  const validRecordKeys = new Set(chronologicalLocations(input).map((_, index) => `R${index + 1}`));
  const openingRecordKey = validRecordKeys.has(plan.openingRecordKey) ? plan.openingRecordKey : '';
  const closingRecordKey = validRecordKeys.has(plan.closingRecordKey) ? plan.closingRecordKey : '';
  const protectedKeys = new Set([openingRecordKey, closingRecordKey].filter(Boolean));

  return {
    ...plan,
    openingRecordKey,
    closingRecordKey,
    importantRecordKeys: Array.from(new Set([
      ...(openingRecordKey ? [openingRecordKey] : []),
      ...plan.importantRecordKeys.filter((key) => validRecordKeys.has(key)),
      ...(closingRecordKey ? [closingRecordKey] : []),
    ])),
    omittedRecordKeys: plan.omittedRecordKeys
      .filter((key) => validRecordKeys.has(key) && !protectedKeys.has(key)),
  };
}

async function invokeWikiAi(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('wiki-ai-test', { body });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || 'AIから正常な応答がありません。');
  return String(data.message || '').trim();
}

async function selectWikiSources(
  input: WikiGenerationInput,
  candidates: WikiPhotoCandidate[],
  context: WikiGenerationContext,
) {
  const maxAiPhotos = context.maxAiPhotos ?? DEFAULT_MAX_WIKI_AI_PHOTOS;
  const needsPlanner = context.mode === 'digest' || candidates.length > maxAiPhotos;
  if (!needsPlanner) {
    return { photos: candidates.slice(0, maxAiPhotos), plan: null as WikiSourcePlan | null };
  }

  try {
    const raw = await invokeWikiAi({
      task: 'photo_selection',
      systemPrompt: buildSourcePlanningSystemPrompt(maxAiPhotos, context),
      message: buildSourcePlanningMessage(input, candidates, context),
    });
    const parsedPlan = parseSourcePlan(raw);
    if (!parsedPlan) throw new Error('資料編集計画を解析できませんでした。');
    const plan = protectDigestStoryAnchors(parsedPlan, input, context);

    const candidateByKey = new Map(candidates.map((candidate) => [candidate.key, candidate]));
    const selected = Array.from(new Set(plan.selectedPhotoKeys))
      .map((key) => candidateByKey.get(key))
      .filter((candidate): candidate is WikiPhotoCandidate => Boolean(candidate))
      .slice(0, maxAiPhotos)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    if (candidates.length > 0 && selected.length === 0) {
      throw new Error('資料編集計画に有効なメイン写真がありませんでした。');
    }
    return { photos: selected, plan };
  } catch (error) {
    console.warn('[wiki] source planning failed; using chronological main-photo fallback', error);
    return { photos: candidates.slice(0, maxAiPhotos), plan: null as WikiSourcePlan | null };
  }
}

function buildArticleMessage(
  input: WikiGenerationInput,
  selectedPhotos: WikiPhotoCandidate[],
  plan: WikiSourcePlan | null,
  context: WikiGenerationContext,
) {
  const locations = chronologicalLocations(input);
  const allMainPhotoCandidates = collectWikiPhotoCandidates(input);
  const mainPhotoByLocation = new Map(allMainPhotoCandidates.map((photo) => [photo.locationId, photo]));
  const photoNumberByPath = new Map(selectedPhotos.map((photo, index) => [photo.storagePath, index + 1]));
  const selectedByLocation = new Map(selectedPhotos.map((photo) => [photo.locationId, photo]));
  const maxArticleChars = context.maxArticleChars ?? WIKI_ARTICLE_CHAR_LIMIT;

  const planningContext = plan
    ? [
        '【第1段階の資料編集計画】',
        `記事全体の大枠: ${plan.storyArc || '指定なし'}`,
        context.mode === 'digest'
          ? `起点記録: ${plan.openingRecordKey || '指定なし'} / 終点記録: ${plan.closingRecordKey || '指定なし'}`
          : '',
        `重点記録候補: ${plan.importantRecordKeys.join('・') || '指定なし'}`,
        context.mode === 'digest'
          ? `個別掲載を省略してよい記録候補: ${plan.omittedRecordKeys.join('・') || 'なし'}`
          : 'FULL編纂のため、全記録を記事内で最低1回は意味のある形で扱ってください。',
        ...(plan.sections.length > 0
          ? [
              '章構成案:',
              ...plan.sections.map((section, index) => [
                `  ${index + 1}. ${section.title || '無題'}`,
                `     主記録: ${section.primaryRecordKeys.join('・') || 'なし'}`,
                `     補助記録: ${section.supportingRecordKeys.join('・') || 'なし'}`,
                `     目的: ${section.purpose || '指定なし'}`,
              ].join('\n')),
            ]
          : []),
        context.mode === 'digest'
          ? '起点記録と終点記録が指定されている場合は、個別の章にする必要はありませんが、記事の始まりと現在地点・着地点が読者に伝わるよう本文へ必ず意味のある形で反映してください。関連性の薄い省略候補を無理につなげる必要はありません。'
          : '',
        'この計画は実画像を見る前の編集案です。入力事実と実画像で確認できる内容を最優先し、人格固有の正式出力構造に合わせて必要なら章名や配分を調整してください。',
        '',
      ].filter(Boolean)
    : [];

  return [
    `【今回の編纂範囲】${context.scopeLabel}`,
    `【編纂モード】${context.mode.toUpperCase()}`,
    `【記事本文の上限】日本語の表示本文は最大${maxArticleChars}文字。途中で切らず、この文字数内で必ず結論まで完結させること。`,
    context.mode === 'full'
      ? '【情報密度】対象期間の全記録を最低1回は意味のある形で扱う。重複説明を避け、必要なら短く圧縮する。'
      : '【情報密度】対象期間の全記録を理解した上で、まず起承転結を作り、その流れに必要な記録・転機・重要事実を優先する。関連性の薄い記録は省略してよいが、起点と終点として選ばれた記録は落とさない。全件を個別列挙する必要はない。',
    '',
    `ワールド名: ${input.world.name}`,
    `ワールド概要: ${input.world.memo || 'なし'}`,
    `プレイヤー: ${input.world.player || 'なし'}`,
    `ロケーション数: ${locations.length}`,
    `AI参照候補のメイン写真数: ${allMainPhotoCandidates.length}`,
    `AIへ実画像として添付する選定メイン写真数: ${selectedPhotos.length}`,
    selectedPhotos.length > 0
      ? `実画像は写真1〜写真${selectedPhotos.length}として添付します。本文のphotoIndexes等で写真へ言及する場合は、この番号だけを使用してください。`
      : '添付写真はありません。',
    '追加写真・サブ写真はAI資料として扱いません。入力に存在すると推測したり、本文で言及したりしないでください。',
    '',
    ...planningContext,
    ...locations.map((location, locationIndex) => {
      const mainPhoto = mainPhotoByLocation.get(location.id);
      const selectedPhoto = selectedByLocation.get(location.id);
      return [
        `【記録R${locationIndex + 1}】`,
        `ロケーション名: ${location.name}`,
        `座標: ${location.has_coordinates ? `${location.x}, ${location.y}, ${location.z}` : '未入力'}`,
        `詳細メモ: ${location.detail_memo || 'なし'}`,
        `作成日時: ${location.created_at}`,
        `関連メンバー: ${location.members.map((member) => member.name).join('・') || 'なし'}`,
        `AI参照対象のメイン写真: ${mainPhoto ? 'あり' : 'なし'}`,
        selectedPhoto
          ? `今回実画像を確認するメイン写真: 写真${photoNumberByPath.get(selectedPhoto.storagePath)} / 撮影記録日時 ${selectedPhoto.createdAt}`
          : '今回実画像を確認するメイン写真: なし',
        '',
      ].join('\n');
    }),
  ].join('\n');
}

function toWikiPhotoInputs(selectedPhotos: WikiPhotoCandidate[]): WikiPhotoInput[] {
  return selectedPhotos.map((photo, index) => ({
    storagePath: photo.storagePath,
    label: `写真${index + 1} / ロケーション「${photo.locationName}」 / メイン写真 / 撮影記録日時 ${photo.createdAt}`,
  }));
}

function withPhotoPathMarker(content: string, selectedPhotos: WikiPhotoCandidate[]) {
  if (selectedPhotos.length === 0) return content;
  return `${content}\n\n<!--WIKI_PHOTO_PATHS:${JSON.stringify(selectedPhotos.map((photo) => photo.storagePath))}-->`;
}

export async function generateWikiArticle(
  input: WikiGenerationInput,
  context: WikiGenerationContext,
): Promise<WikiGenerationResult> {
  const { style } = input;
  const allPhotoCandidates = collectWikiPhotoCandidates(input);
  const { photos: selectedPhotos, plan } = await selectWikiSources(input, allPhotoCandidates, context);
  const wikiPhotos = toWikiPhotoInputs(selectedPhotos);

  const structuredInstructions = style === 'scp'
    ? SCP_STRUCTURED_OUTPUT_INSTRUCTIONS
    : style === 'ancient'
      ? MADAME_ROSE_STRUCTURED_OUTPUT_INSTRUCTIONS
      : HERNAN_STRUCTURED_OUTPUT_INSTRUCTIONS;

  const personalityPrompt = style === 'ancient' ? MADAM_ROSE_SYSTEM_PROMPT : getWikiSystemPrompt(style);
  const systemPrompt = `${personalityPrompt}\n\n${structuredInstructions}\n\n${NARRATOR_LINE_TONE_INSTRUCTIONS[style]}`;
  const raw = await invokeWikiAi({
    task: 'article',
    systemPrompt,
    message: buildArticleMessage(input, selectedPhotos, plan, context),
    imageInputs: wikiPhotos,
  });

  if (style === 'scp') {
    const { dossier, narratorLine } = parseScpAiResponse(raw);
    return {
      content: withPhotoPathMarker(`${JSON.stringify(dossier)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`, selectedPhotos),
    };
  }

  if (style === 'ancient') {
    const { article, narratorLine } = parseMadameRoseAiResponse(raw);
    return {
      content: withPhotoPathMarker(`${JSON.stringify(article)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`, selectedPhotos),
    };
  }

  const { article, narratorLine } = parseHernanAiResponse(raw);
  return {
    content: withPhotoPathMarker(`${JSON.stringify(article)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`, selectedPhotos),
  };
}

export const openRouterTestProvider: WikiProvider = {
  async generate(input: WikiGenerationInput): Promise<WikiGenerationResult> {
    return generateWikiArticle(input, {
      scopeType: 'world',
      scopeKey: 'all',
      scopeLabel: 'ワールド全体',
      mode: 'digest',
      maxArticleChars: WIKI_ARTICLE_CHAR_LIMIT,
      maxAiPhotos: DEFAULT_MAX_WIKI_AI_PHOTOS,
    });
  },
};