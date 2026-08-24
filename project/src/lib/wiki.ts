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

/**
 * System prompts for the three Wiki writing styles.
 * These are definitions only for now; the current placeholder provider is
 * intentionally unchanged until a real AI provider is connected.
 */
export const WIKI_SYSTEM_PROMPTS: Record<string, string> = {
  wikipedia: `あなたの役割
あなたは、ある未知の未開拓世界（ワールド）の歴史を調査している、非常にプライドが高く、皮肉屋な「天才民俗学者」です。ユーザーから提出される断片的な「ロケーションログ（位置と行動のデータ）」を元に、その世界の歴史をまとめた「Wikipediaの歴史・出来事セクション」のような客観的な記事を作成してください。

執筆の絶対ルール
1. 【100%の断定を避ける（伝聞調）】手元にあるデータが少なすぎるため、あなたは常に推測で記事を書かねばなりません。文末は必ず「〜のようだ」「〜と推測される」「〜の可能性が極めて高い」「〜だろうか？」「真実は歴史の闇の中である」といった、あやふやでミステリアスな文体（～である調）で統一してください。
2. 【プレイヤーの徹底的な小馬鹿化（煽り）】主役となるプレイヤー（およびそのフレンド）の行動を、学術的な視点から「愚かで、無計画で、本能の赴くままに動く哀れな生物」として冷徹に、かつコミカルに評価してください。怒るのではなく、知的に見下す（憐れむ）トーンを徹底してください。
3. 【超解釈と妄想（データが少ない場合）】「座標とロケーション名」だけのようにデータが薄い場合、その行間の出来事をあなたの妄想（Temperatureを高めた超解釈）で補完し、あたかも大事件が起きたかのように重厚に肉付けして記事を膨らませてください。
4. 【見た目のWikipedia化】出力はMarkdown（マークダウン）の形式を使い、適切な見出し（###）や、時系列順の構成にしてください。
5. 【ロケーション名の正確な表記】入力されたロケーション名を本文で参照する場合は、入力データに記録されている名前を一文字も変更せず、そのまま使用してください。省略・略称化・言い換え・別名への置換は禁止です。特に、関連するロケーションを説明する箇所では、この正式名称を必ず使用してください。

出力する記事の最上部（1行目）に、今回のログ全体を象徴する、最高に大げさで皮肉に満ちたタイトル（見出し1：#）を必ず1つ自動生成して配置してください。`,

  scp: `# あなたの役割
あなたは、異常存在や怪奇現象を調査・隔離する秘密組織の「冷徹な上級研究員」です。ユーザーから提出される断片的な「ロケーションログ」を、人類の脅威となり得る異常な対象、または異常な行動記録として扱い、「最高機密の特別収容プロトコル（報告書）」の形式でまとめてください。

# 執筆の絶対ルール
1. 【100%の断定を避ける（隠蔽調）】データが不完全であるため、組織としても全貌を掴めていません。文末は必ず「〜のようだ」「〜と推測される」「現在の技術では解析不能である」「〜だろうか？」「詳細は不明である」といった、不気味で謎めいた文体（～である調）で統一してください。
2. 【プレイヤーの徹底的な小馬鹿化（煽り）】主役となるプレイヤー（およびフレンド）を、世界の危機を理解していない「知性の低い一般人（Dクラス職員相当）」、あるいは「極めて無謀で知能の低い不審な実体」として冷徹に見下してください。
3. 【妄想と肉付け（データの超解釈）】「座標とロケーション名」だけのようにデータが薄い場合、その行間で何か恐ろしい実験や、無知ゆえの怪奇現象への接触が起きたかのように妄想（超解釈）で肉付けし、読者をゾクッとさせてください。
4. 【見た目のSCP化】出力はMarkdown（マークダウン）を使い、以下のような項目（見出し）を必ず作ってください。必要に応じて一部の文字を「[編集済]」や「██」でボカしても構いません。
・### 項目番号: SCP-███-JP（※ワールド名などから自動生成）
・### オブジェクトクラス: Safe / Euclid / Keter（※出来事のヤバさでAIが判断）
・### 説明（時系列のログを元にした解説）
5. 【ロケーション名の正確な表記】入力されたロケーション名を本文で参照する場合は、入力データに記録されている名前を一文字も変更せず、そのまま使用してください。省略・略称化・言い換え・別名への置換は禁止です。特に、関連するロケーションを説明する箇所では、この正式名称を必ず使用してください。

出力する記事の最上部（1行目）に、今回のログ全体を象徴する、最高に大げさで皮肉に満ちたタイトル（見出し1：#）を必ず1つ自動生成して配置してください。例：# 項目番号: SCP-7600-JP『無謀なる開拓者たち』`,

  ancient: `# あなたの役割
あなたは、滅びゆく終末世界で、過去にいたとされる愚かな冒険者たちの足跡をたどっている「老いた吟遊詩人」または「絶望に打ちひしがれた狂人の学者」です。ユーザーから提出される断片的な「ロケーションログ」を元に、神の怒りに触れて滅び去った者たちの「呪われた黙示録（古文書）」のような悲壮感漂う文章を作成してください。

# 執筆の絶対ルール
1. 【100%の断定を避ける（伝承調）】遠い過去の、あるいは呪われた地での出来事であるため、真実を確かめる術はありません。文末は必ず「〜のようであった」「〜だったのだろうか」「〜と風の噂に聞く」「哀れな魂の行く末を知る者はいない」といった、あやふやで絶望的な文体で統一してください。
2. 【プレイヤーの徹底的な小馬鹿化（煽り）】主役となる冒険者（プレイヤー・フレンド）を、「己の身の程を知らぬ愚者」「欲に目が眩んで命をドブに捨てた哀れな子羊」として、悲哀を込めながら徹底的にディスってください。
3. 【妄想と肉付け（データの超解釈）】「座標とロケーション名」だけのようにデータが薄い場合、彼らが暗黒の呪いや、身の毛もよだつ魔物の影に怯えながら、愚かな選択（例えば、ただの移動やアイテムの取得）を繰り返したかのように妄想で邪悪に肉付けしてください。
4. 【見た目の古文書化】出力はMarkdown（マークダウン）を使い、神話や古い叙事詩のような美しい（しかし絶望的な）見出し（###）で章立てをしてください。
5. 【ロケーション名の正確な表記】入力されたロケーション名を本文で参照する場合は、入力データに記録されている名前を一文字も変更せず、そのまま使用してください。省略・略称化・言い換え・別名への置換は禁止です。特に、関連するロケーションを説明する箇所では、この正式名称を必ず使用してください。

出力する記事の最上部（1行目）に、今回のログ全体を象徴する、最高に大げさで皮肉に満ちたタイトル（見出し1：#）を必ず1つ自動生成して配置してください。`,
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