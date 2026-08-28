import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // AI Wiki Generation endpoint
  app.post('/api/gemini/wiki', async (req, res) => {
    try {
      const { worldName, player, members, locations, style } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          fallback: true,
          content: generateFallbackWiki(worldName, player, members, locations, style),
        });
      }

      let systemPrompt = '';
      if (style === 'wikipedia') {
        systemPrompt = `あなたは百科事典「ウタペディア」の知的で少し毒舌・ユーモアを交える民俗学者です。
提供されたゲーム/日常の冒険記録データをもとに、Wikipedia風の客観的かつ学術的で読み応えのある百科事典記事（Markdown形式）を編纂してください。
構成例:
# ${worldName}
## 概要
（地理的環境、探検開始の経緯、プレイヤーの行動傾向など）
## 開拓と調査の歴史
（日付順にどのような場所が発見・開拓されたか）
## 主な登録拠点
（各拠点の詳細と座標データ、事件・エピソード）
## 関連人物
（プレイヤーや仲間たちの役割・珍エピソード）
## 評価と今後の展望
`;
      } else if (style === 'scp') {
        systemPrompt = `あなたはSCP財団の上級研究員（Dr.アーク）です。
提供された探検記録を「異常事象調査報告書（SCP報告書／確保・収容・保護ログ）」風の機密文書（Markdown形式）として執筆してください。
冷徹、事務的、かつどこか不穏でSFテイストなトーンにしてください。
構成例:
# アイテム番号: SCP-${Math.floor(1000 + Math.random() * 9000)}-JP "${worldName}"
**オブジェクトクラス:** Euclid / Safe
## 特別収容プロトコル:
## 説明:
## 探査・発見ログ記録（タイムスタンプ・座標付き）:
## 付録: 対象調査員の心理プロファイルと特記事項:
`;
      } else {
        // ancient
        systemPrompt = `あなたは遥かなる滅びの未来から過去の遺構を詠み継ぐ「絶望古文書の吟遊詩人」です。
提供された冒険記録をもとに、ダークファンタジーの伝説、失われた神話、抒情詩的な叙事詩（Markdown形式）を執筆してください。
重厚で詩的、美しくも切ない文体にしてください。
構成例:
# 滅びし世界年代記: 《${worldName}の遺訓》
## 第一章: はじまりの夜と放浪者
## 第二章: 刻まれし座標と失われし拠点群
## 第三章: 友と紡ぎし旅の残照
## 終章: 名もなき冒険者へ捧ぐ詩
`;
      }

      const locationsText = (locations || [])
        .map(
          (loc: any, idx: number) =>
            `- 拠点${idx + 1}: 【${loc.name}】 (座標: X:${loc.x ?? 0}, Y:${loc.y ?? 0}, Z:${loc.z ?? 0}) 日時:${loc.created_at || '不明'}\n  記録メモ: ${loc.detail_memo || 'なし'}`
        )
        .join('\n');

      const userPrompt = `
ワールド名: ${worldName}
記録者(プレイヤー): ${player || '名もなき探検家'}
同行メンバー: ${(members || []).join(', ') || '単独行'}
総記録拠点数: ${(locations || []).length}件

【記録一覧】
${locationsText}

上記の記録をすべて参照し、物語や百科事典として魅力的に作品化してください。
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.8,
        },
      });

      const content = response.text || generateFallbackWiki(worldName, player, members, locations, style);
      res.json({ content, fallback: false });
    } catch (err: any) {
      console.error('Gemini Wiki Generation Error:', err);
      // Return high quality fallback instead of breaking the UI
      const { worldName, player, members, locations, style } = req.body;
      res.json({
        content: generateFallbackWiki(worldName, player, members, locations, style),
        fallback: true,
        error: err.message,
      });
    }
  });

  // AI Hashtag & SNS Copy generator endpoint
  app.post('/api/gemini/sns-generate', async (req, res) => {
    try {
      const { locationName, memo, x, y, z, worldName } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          text: `【冒険記録】${locationName}${x !== undefined ? ` (X:${x} Y:${y} Z:${z})` : ''}\n${memo || '新たな発見を記録した。'}\n\n#${worldName.replace(/[\s-]/g, '')} #サバイバル日記 #冒険の書 #UTAPEDIA`,
          hashtags: [`#${worldName.replace(/[\s-]/g, '')}`, '#サバイバル日記', '#拠点開拓', '#UTAPEDIA', '#冒険の記録'],
        });
      }

      const prompt = `
以下のゲーム冒険記録から、X (Twitter) への共有に最適な魅力的な投稿文（140文字程度）とハッシュタグ（4〜5個）を生成してください。
ワールド名: ${worldName}
ロケーション: ${locationName}
座標: X:${x}, Y:${y}, Z:${z}
体験メモ: ${memo}

JSON形式で返してください:
{
  "text": "投稿文本文（ハッシュタグを含む）",
  "hashtags": ["#タグ1", "#タグ2", "#タグ3", "#タグ4"]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      try {
        const json = JSON.parse(response.text || '{}');
        res.json(json);
      } catch {
        res.json({
          text: `【冒険記録】${locationName}\n${memo}\n\n#${worldName} #サバイバル日記 #UTAPEDIA`,
          hashtags: ['#サバイバル日記', '#冒険の記録', '#UTAPEDIA'],
        });
      }
    } catch (err: any) {
      console.error('SNS generate error:', err);
      const { locationName, memo, worldName } = req.body;
      res.json({
        text: `【冒険記録】${locationName}\n${memo || '新しい拠点を記録！'}\n\n#${worldName || '冒険'} #サバイバル記録 #UTAPEDIA`,
        hashtags: ['#サバイバル日記', '#冒険の記録', '#UTAPEDIA'],
      });
    }
  });

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function generateFallbackWiki(
  worldName: string,
  player: string,
  members: string[] = [],
  locations: any[] = [],
  style: string = 'wikipedia'
): string {
  const memberList = members.length > 0 ? members.join('、') : '単独調査員';
  const locCount = locations.length;
  const nowStr = new Date().toLocaleDateString('ja-JP');

  if (style === 'wikipedia') {
    return `# ${worldName}
**${worldName}**（英: *${worldName} Expedition*）は、探検者**${player || '名もなき生存者'}**および同行者（${memberList}）によって開拓・記録されたサバイバル領域である。${nowStr}時点で全${locCount}箇所の重要拠点が確認されている。

---

## 概要
本領域は多様な地形と未踏のダンジョン、天然資源を有する開拓地である。記録者**${player || '調査員'}**の初期活動は生存基盤の確保から始まり、段階的に広域探査網が構築された。

## 開拓と調査の歴史
${locations
  .map(
    (loc, i) => `### ${i + 1}. ${loc.name}（座標: X:${loc.x} Y:${loc.y} Z:${loc.z}）
- **記録日時:** ${loc.created_at ? new Date(loc.created_at).toLocaleDateString('ja-JP') : '記録初期'}
- **概要:** ${loc.detail_memo || '探検ログが保存されている重要地点。周囲の資源状況および安全性が確認された。'}
`
  )
  .join('\n')}

## 参加調査員・メンバー
- **主開拓者:** ${player || '名もなき生存者'}
- **協力開拓員:** ${memberList}

## 学術的総括
現在までに登録された${locCount}箇所の座標データは、この世界における生存戦略の確固たる足跡を示している。今後の深部探査とさらなる遺構調査が期待される。
`;
  } else if (style === 'scp') {
    return `# アイテム番号: SCP-7729-JP "${worldName}"
**オブジェクトクラス:** Euclid

**特別収容プロトコル:**
SCP-7729-JPは現在、指定調査員**[${player || 'REDACTED'}]**および随伴班（${memberList}）による現地調査下に置かれています。記録された全${locCount}箇所の特異座標群は定期的な監視下に置かれ、事象の拡大が抑止されています。

---

## 説明:
SCP-7729-JPは、未知のアルゴリズムに従って自己拡張を続ける開拓空間です。内部には複数の人工的・自然発生的特異地点が存在し、調査員による定期的なログ収集が行われています。

## 観測・探査ログ要約:
${locations
  .map(
    (loc, i) => `### [事象記録 #${i + 1}] 観測地点: 【${loc.name}】
- **座標値:** [X:${loc.x} / Y:${loc.y} / Z:${loc.z}]
- **事象メモ:** ${loc.detail_memo || '現地における異常性および生体反応の調査が完了。'}
`
  )
  .join('\n')}

## 付録 7729-A: 主任研究員コメント
「観測ログが示す通り、この世界における調査員の適応能力は極めて高い。これ以上の変異がない限り、現在の観測体制を維持する。」
`;
  } else {
    // ancient
    return `# 滅びし世界年代記: 《${worldName}の遺訓》

遥かなる時が流れ、星々がその輝きを失う頃、かつて**${player || '巡礼者'}**と呼ばれし者が踏み固めた大地**【${worldName}】**の記録がここに残された。

${memberList !== '単独調査員' ? `その傍らには、過酷なる風雪を共にした同胞たち（${memberList}）の足跡も確かに刻まれている。\n` : ''}

---

## 第一章: 刻まれし${locCount}の座標
${locations
  .map(
    (loc, i) => `### 其の${i + 1}: 【${loc.name}】の章
*「彼らは座標 [X:${loc.x}, Y:${loc.y}, Z:${loc.z}] へと至り、土を掘り、火を灯した。」*
${loc.detail_memo ? `> *${loc.detail_memo}*` : '> *静寂のなかに築かれた小さき砦よ。*'}
`
  )
  .join('\n')}

## 終章: 冒険者へ捧ぐ祈り
風は拠点の跡を吹き抜け、かつて燃え盛った松明の灰を散らす。
しかし、この冒険の書に刻まれた記憶は、世界が何度滅びようとも色褪せることはない。
`;
  }
}

startServer();
