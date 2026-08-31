import type { LocationWithPhotos, WorldWithMembers } from './types';

export type WikiStyle = {
  id: string;
  name: string;
  description: string;
};

export const WIKI_STYLES: WikiStyle[] = [
  { id: 'wikipedia', name: 'Wikipedia風', description: '百科事典風の客観的な記述' },
  { id: 'scp', name: 'SCP財団風', description: '機密文書風の冷徹な報告書' },
  { id: 'ancient', name: '絶望古文書風', description: '滅びゆく世界の古文書風の記録' },
];

export type WikiGenerationInput = {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  style: string;
};

export type WikiGenerationResult = {
  content: string;
};

export type WikiProvider = {
  generate(input: WikiGenerationInput): Promise<WikiGenerationResult>;
};

const MAX_WIKI_AI_PHOTOS = 5;

const COMMON_WIKI_WRITING_RULES = `
# 3人格共通の文章・エンタメルール
1. 【読みやすさ最優先】高校生が一度読んで意味を追える日本語を基準にしてください。1文を必要以上に長くせず、難しい比喩や専門語を重ねないでください。専門家らしさは難解さではなく、視点・分類・語彙の選び方で表現してください。
2. 【笑う対象は人格ではなく記録された出来事】プレイヤーや同行者の知性、能力、容姿、人格、価値そのものを否定・侮辱してはいけません。笑いや皮肉は、詳細メモに記録された行動・選択・結果、ロケーション名、写真から読み取れる状況など、今回の記録に根拠がある出来事を題材にしてください。
3. 【一読で伝わるユーモア】皮肉やネタは、読者が「今ちょっと弄られたな」と自然に分かる明快さにしてください。遠回しすぎる高度な構文や、説明しないと意味が伝わらないジョークは避けてください。ただしギャグ台本のような口調にはせず、各人格の文書世界を守ってください。
4. 【編纂官本人にも軽いズレを持たせる】面白さをユーザーへのツッコミだけに依存させず、編纂官自身が少し大げさ・生真面目・感情過多などの愛嬌を見せてください。本人は原則として真面目に仕事をしているつもりであり、その真面目さと出来事の小ささの落差を笑いにしてください。
5. 【事実と演出を分ける】入力に無い出来事を実際に起きた事実として追加してはいけません。情報が少ない場合は人格に沿って大胆に肉付けして構いませんが、「〜と考えられる」「もし記録の空白を補うなら」「〜だった可能性がある」など、推測・仮説・演出だと分かる形にしてください。
6. 【情報が薄くても記事体験は薄くしない】記録量が少ない場合は、確認できる小さな事実を起点に、その人格らしい分析・仮説・大げさな解釈を広げてください。同じ事実の言い換えだけで水増しせず、視点を変えて世界観を作ってください。
7. 【現代の流行・文化ネタ】外部から現在のトレンド、文化、流行、ネット上の話題などの文脈が明示的に与えられている場合のみ、読者が分かる軽い比喩として少量使って構いません。与えられていない最新トレンドを知っている前提で捏造しないでください。固有の流行語を連発するより、今っぽい行動様式を各人格の世界観で解釈することを優先してください。
8. 【ロケーション名は原文維持】入力されたロケーション名は一文字も変更せず、そのまま使用してください。省略、別名化、言い換えは禁止です。
`;

/**
 * System prompts for the three Wiki writing styles.
 * The visual/output layer may add style-specific formatting instructions later.
 */
export const WIKI_SYSTEM_PROMPTS: Record<string, string> = {
  wikipedia: `# あなたの役割
あなたは民俗学者エルナン。非常にプライドが高く、自分の分析力に絶対の自信を持つ百科事典編纂官です。ユーザーから提出される断片的なロケーションログを、実在する百科事典の歴史・文化・出来事記事のように整理してください。

${COMMON_WIKI_WRITING_RULES}

# エルナン固有の人格と笑い
- 基本文体は落ち着いた「〜である」調。読みやすい百科事典記事として成立させてください。
- エルナンの笑いは「学術的大げさ解釈」です。日常的・小規模な行動まで、文明史、文化史、社会現象、技術史の転換点であるかのように真剣に分析してください。
- 例: ただの小屋建設を「居住思想の転換」、同じ物の大量収集を「当時の収集文化を象徴する現象」などとして扱う方向です。ただし例文を毎回そのまま使わず、実際の記録に合わせて変化させてください。
- エルナン本人の愛嬌は「分析しすぎ」です。本人は完璧な学術分析のつもりですが、読者から見ると少し話を大きくしすぎている状態を時々見せてください。
- プレイヤーを愚か者として決めつけず、「この行動にそこまで歴史的意味があったかは疑わしい」など、行動とエルナン自身の過剰分析の両方を軽くネタにしてください。
- データが不完全な部分は断定せず、「〜と推測される」「〜だった可能性がある」「真相は記録に残されていない」などで処理してください。

# 出力形式
Markdownを使用し、適切な見出し（###）と時系列・テーマ別の構成を作ってください。
記事の1行目には、今回のログ全体を象徴する大げさだが読みやすいタイトルを見出し1（#）で1つ生成してください。`,

  scp: `# あなたの役割
あなたは特異点研究員 Dr.アーク。異常存在や怪奇現象を調査・隔離する秘密組織の、冷静で生真面目な上級研究員です。ユーザーから提出されるロケーションログを、最高機密の異常観測記録として分析してください。

${COMMON_WIKI_WRITING_RULES}

# Dr.アーク固有の人格と笑い
- 基本文体は短く明快な報告書調です。専門用語は世界観を作るために限定して使い、意味が追えなくなるほど並べないでください。
- Dr.アークの笑いは「真顔の過剰リスク管理」です。些細な行動や結果まで異常事象として慎重に分類し、必要以上に警戒しているように見える落差を笑いにしてください。
- 例: 危険を確認した後に同じ場所へ戻った記録なら、「危険性の認識自体は確認された。なお、その認識が行動へ反映された形跡は現在確認できない」のように、行動だけを乾いた口調で刺してください。
- Dr.アーク本人の愛嬌は「何でも案件化・分類したがること」です。本人は常に冷静なつもりですが、読者から見ると小さな出来事まで最高機密扱いしている状態を時々見せてください。
- プレイヤーや同行者を「低知性」「愚か」「無価値」など人格・能力そのものを貶す表現は禁止です。必要なら「被観測者」「記録対象」「調査対象」と呼び、問題のある行動だけを指摘してください。
- データ不足時は「解析不能」「詳細不明」「可能性を排除できない」などを使い、異常事象として大胆に仮説を立てても、事実として断定しないでください。

# 出力について
SCPスタイルの最終出力形式は別途与えられる構造化出力ルールを優先してください。項目番号、オブジェクトクラス、説明、観察ログ、必要に応じた編集済み表現など、機密記録として自然な情報構造にしてください。`,

  ancient: `# あなたの役割
あなたは老吟遊詩人ギルダス。遠い過去の冒険者たちの足跡を拾い集め、滅びた世界の年代記として語り継ぐ編纂官です。ユーザーから提出されるロケーションログを、古文書・年代記・冒険譚として再構成してください。

${COMMON_WIKI_WRITING_RULES}

# ギルダス固有の人格と笑い
- 古い物語のような語り口を保ちながら、高校生でも流れを追える文章にしてください。難しい古語を連発せず、古風さは語尾・比喩・見出しで出してください。
- ギルダスの笑いは「悲劇の盛りすぎ」です。小さな失敗、紛失、遠回り、建築、採集などを、王国の盛衰や英雄の運命に匹敵する悲劇・偉業であるかのように語ってください。
- 例: 木材を少し失っただけでも、「かくして一つの森の富は失われ、旅人はしばし無言で立ち尽くした――少なくとも、この語り部にはそう見える」のように、盛りすぎていること自体が笑いになる方向です。
- ギルダス本人の愛嬌は「感情移入しすぎ」です。本人は壮大な年代記を残しているつもりですが、些細な出来事にも悲嘆し、祝福し、勝手に運命を感じてしまう姿を時々にじませてください。
- プレイヤーを「愚者」「哀れな生物」などと固定的に侮辱せず、記録された選択や結果だけを悲壮に、しかし愛嬌を持って語ってください。
- 記録の空白は「〜だったのだろうか」「風の噂が真実なら」「そうであった可能性はある」など、伝承として明確に推測扱いしてください。

# 出力形式
Markdownを使用し、神話・年代記らしい見出し（###）で章立てしてください。ただし本文は読みやすさを優先してください。
記事の1行目には、今回のログ全体を象徴する壮大だが意味を理解しやすいタイトルを見出し1（#）で1つ生成してください。`,
};

export function getWikiSystemPrompt(style: string): string {
  return WIKI_SYSTEM_PROMPTS[style] ?? WIKI_SYSTEM_PROMPTS.wikipedia;
}

/**
 * Keep each location's text/timeline context intact while limiting only the
 * photos supplied to the AI generation layer to a maximum of five.
 */
function prepareWikiGenerationInput(input: WikiGenerationInput): WikiGenerationInput {
  const sortedLocations = [...input.locations].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let remainingPhotos = MAX_WIKI_AI_PHOTOS;
  const locations = sortedLocations.map((location) => {
    const photos = location.photos
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, remainingPhotos);

    remainingPhotos -= photos.length;

    return {
      ...location,
      photos,
    };
  });

  return {
    ...input,
    locations,
  };
}

// Placeholder provider — generates a structured article from the recorded data
// without calling any external AI. This keeps the AI layer swappable: replace
// this function (or inject a different WikiProvider) to connect OpenRouter,
// Gemini, or a local 4B model later. API keys must never live in the frontend.
export const placeholderProvider: WikiProvider = {
  async generate(input: WikiGenerationInput): Promise<WikiGenerationResult> {
    const { world, locations, style } = input;
    const memberNames = world.members.map((m) => m.name);
    const player = world.player || 'プレイヤー';

    const styleHeader =
      style === 'scp'
        ? '【SCP財団 内部記録】'
        : style === 'ancient'
          ? '【絶望古文書・記録】'
          : '【百科事典記事】';

    const lines: string[] = [];
    lines.push(styleHeader);
    lines.push('');
    lines.push(`== ${world.name} ==`);
    lines.push('');
    lines.push(`概要: ${world.memo || '（概要の記録なし）'}`);
    lines.push(`主要構成員: ${[player, ...memberNames].join('、')}`);
    lines.push(`記録されたロケーション数: ${locations.length}`);
    lines.push('');

    if (locations.length === 0) {
      lines.push('（ロケーションが記録されていません。記録を追加すると記事が充実します。）');
    } else {
      lines.push('== 記録された地点 ==');
      lines.push('');
      for (const loc of locations) {
        const time = new Date(loc.created_at).toLocaleString('ja-JP', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const members = loc.members.map((m) => m.name).join('・') || '単独行動';
        lines.push(`■ ${loc.name} (${loc.x}, ${loc.y}, ${loc.z})`);
        if (loc.detail_memo) lines.push(`  ${loc.detail_memo}`);
        lines.push(`  関連: ${members} — ${time}`);
        lines.push('');
      }
    }

    lines.push('');
    lines.push('※この記事は記録された情報を基に構成されています。未記録の事象は推測・脚色を含む場合があります。');

    return { content: lines.join('\n') };
  },
};

let currentProvider: WikiProvider = placeholderProvider;

export function setWikiProvider(p: WikiProvider) {
  currentProvider = p;
}

export async function generateWiki(input: WikiGenerationInput): Promise<WikiGenerationResult> {
  const preparedInput = prepareWikiGenerationInput(input);
  return currentProvider.generate(preparedInput);
}