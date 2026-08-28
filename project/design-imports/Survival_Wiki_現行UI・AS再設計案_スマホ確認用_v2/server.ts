import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Wiki Generator Endpoint
  app.post('/api/generate-wiki', async (req, res) => {
    try {
      const { world, logs, style } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!world || !logs || !Array.isArray(logs)) {
        return res.status(400).json({ error: 'world and logs array are required' });
      }

      if (!apiKey) {
        // Fallback generator when API key is not configured
        const fallbackContent = generateFallbackWiki(world, logs, style);
        return res.json({ content: fallbackContent, source: 'offline-synthesizer' });
      }

      const ai = new GoogleGenAI({ apiKey });

      let styleInstruction = '';
      if (style === 'wikipedia') {
        styleInstruction = `
あなたは「ウタペディア（Utapedia）」の学術的かつ客観的な民俗学者・主任編纂官です。
Wikipediaの百科事典スタイルを踏襲し、見出し（## 概要、## 主な探検地点・記録、## タイムライン、## 特筆すべき出来事・考察、## 関連項目）で構造化してください。
知的で客観的な文体の中に、冒険者の奇妙な行動に対する鋭い観察眼とユーモア（客観的に見せかけて知的に刺す）を交えて記述してください。
`;
      } else if (style === 'scp') {
        styleInstruction = `
あなたは機密組織財団の上級研究員（Dr. アーク）です。
SCP機密報告書／調査プロトコル形式で出力してください。
見出し（## アイテム番号 / 事象コード、## 特別収容プロトコル（観察指針）、## 探索記録 / 実地ログ、## 特異点分析・結論）を作成してください。
冷徹・科学的・不可解な事象に対するドライな報告トーンで、記録者のサバイバル能力や異常行動を機密データとして精査してください。
`;
      } else if (style === 'ancient') {
        styleInstruction = `
あなたは滅びゆく世界を歩く老吟遊詩人・古文書の編纂者です。
古風で叙事詩的、哀愁とロマンに満ちた絶望古文書形式（「かつてこの地を訪れた愚かな旅人がいた……」のような荘厳な語り口）で記述してください。
見出し（## 旅路の始まり、## 記された幻影の地、## 刻まれた過酷なる試練、## 後世に遺された叙事詩）を用いて、胸を打つ神話・伝説の書として仕上げてください。
`;
      }

      const prompt = `
世界・旅の名前: 「${world.name}」
プレイヤー / 主人公: 「${world.player || '名無しの探索者'}」
同行メンバー: ${world.members && world.members.length ? world.members.map((m: any) => m.name).join(', ') : '単独'}
ワールド概要・メモ: 「${world.memo || 'なし'}」

記録ログデータ (${logs.length} 件):
${logs
  .map(
    (log: any, i: number) => `
[記録 #${i + 1}]
日時: ${log.timestamp || log.date || '不明'} (DAY ${log.dayNumber || i + 1})
地点名: ${log.locationName || log.name || '未命名'}
座標/エリア: ${log.coordinates ? `X:${log.coordinates.x} Y:${log.coordinates.y} Z:${log.coordinates.z}` : log.area || '未記録'}
同行者: ${log.members && log.members.length ? log.members.join(', ') : '単独'}
体験メモ: ${log.memo || log.detail_memo || 'メモなし'}
添付写真枚数: ${log.photos ? log.photos.length : 0}枚
`
  )
  .join('\n---\n')}

指示:
上記の実記録ログを詳細に読み込み、各地点や出来事、メンバーの言動を反映させて、リッチで読み応えのあるMarkdown記事を作成してください。
${styleInstruction}

マークダウンのみを出力してください（余計な挨拶は不要です）。
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const content = response.text || generateFallbackWiki(world, logs, style);
      res.json({ content, source: 'gemini-2.5-flash' });
    } catch (err: any) {
      console.error('Wiki generation error:', err);
      // Fallback on error so the UX never breaks
      const { world, logs, style } = req.body;
      const fallbackContent = generateFallbackWiki(world, logs, style);
      res.json({ content: fallbackContent, source: 'fallback-on-error', error: err.message });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Survival Wiki Server] running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackWiki(world: any, logs: any[], style: string): string {
  const worldName = world?.name || '無名の世界';
  const player = world?.player || '探索者';
  const memberList = world?.members?.map((m: any) => m.name).join('、') || '単独';
  const logCount = logs?.length || 0;

  if (style === 'scp') {
    return `# 機密報告書: SCP-UT-${worldName.replace(/[^a-zA-Z0-9]/g, '') || '404'}
**指定クラス:** Safe / Euclid (実地観測中)
**主任調査員:** Dr. アーク (特異点研究員)

## 特別収容プロトコル
対象事象群「${worldName}」は、探索者「${player}」および同行者（${memberList}）による行動ログとして端末内に常時蓄積・監視される。現在までに全${logCount}件の特異地点が観測されており、すべての座標データは暗号化通信によって保存されている。

## 探索記録および時系列ログ
${logs
  .map(
    (l, i) => `### 事象記録 #${i + 1}: ${l.locationName || l.name || '地点' + (i + 1)}
- **観測日時:** ${l.timestamp || l.date || 'DAY 01'}
- **座標値:** ${l.coordinates ? `X:${l.coordinates.x} Y:${l.coordinates.y} Z:${l.coordinates.z}` : '観測中'}
- **担当員所見:** ${l.memo || l.detail_memo || '特異行動なし。'}
`
  )
  .join('\n')}

## 特異点分析
探索者「${player}」の生存本能および採取活動は極めて高い効率を示している。各地点の踏破データは更なる解析のためアーカイブされる。`;
  }

  if (style === 'ancient') {
    return `# 絶望古文書: 「${worldName}」の叙事詩
*――かつてこの荒野を歩き、土を掘り、星を仰いだ者たちの記録である。*

## 第一章: 彷徨える探索者たち
滅びの兆し漂う世界にて、旅人「${player}」は立ち上がった。
その傍らには、過酷な道を共にする仲間たち（${memberList}）の影があった。
彼らは全${logCount}の地に足跡を刻み、風化する前にその記憶を石板に刻んだ。

## 第二章: 遺された足跡と試練の地
${logs
  .map(
    (l, i) => `### 【其の${i + 1}】 ${l.locationName || l.name} にて
*刻限: ${l.timestamp || l.date || '悠久の時'}*
「${l.memo || l.detail_memo || '言葉少なに旅人は先を急いだ。'}」
この地に眠る証拠は、今も静かに次の来訪者を待っている。
`
  )
  .join('\n')}

## 終章: 語り継がれる記憶
旅人が歩んだ軌跡は、風に消えることなく、この旅の書の中に永遠の輝きを宿し続ける。`;
  }

  // Wikipedia Style default
  return `# ${worldName}

『**${worldName}**』（英: *${worldName} Archive*）は、探検者**${player}**および関係者（${memberList}）によって開拓・記録された領域および体験の総称である。

## 概要
本記録は、全${logCount}箇所の拠点・活動ログに基づいて体系的に編纂された。初期の拠点設営から探索、物資の調達、未知の領域への進出まで、幅広いサバイバル活動の変遷を記録している。

## 主要活動地点およびタイムライン
${logs
  .map(
    (l, i) => `### ${i + 1}. ${l.locationName || l.name || '地点' + (i + 1)}
- **記録日時**: ${l.timestamp || l.date || '初期'} (DAY ${l.dayNumber || i + 1})
- **所在地**: ${l.coordinates ? `X:${l.coordinates.x}, Y:${l.coordinates.y}, Z:${l.coordinates.z}` : l.area || '広域'}
- **記録内容**:
> ${l.memo || l.detail_memo || '特記事項なし。探索が継続されている。'}
`
  )
  .join('\n')}

## 考察と総括
開拓初期から現在に至るまで、探索者たちは綿密な地理的把握と効率的な資源管理を行っていることが伺える。今後も新たな地平への進出が期待される。

## 関連項目
- [[探検記録]]
- [[地理学]]
- [[サバイバル年代記]]
`;
}

startServer();
