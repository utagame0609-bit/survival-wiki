import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client helper
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Wiki Chronicle Generation Endpoint
  app.post('/api/wiki/generate', async (req, res) => {
    const { world, records, style } = req.body;

    if (!world || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'world and records are required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on this server (client fallback will be used)',
      });
    }

    try {
      let systemPrompt = '';
      if (style === 'wikipedia') {
        systemPrompt = `あなたは百科事典・民俗学者の編纂者「ウタペディア」です。
ユーザーから提供された冒険・旅行・体験の記録（日付、場所、座標、メモ、同行者）を元に、客観的で高密度かつ学術的なWikipedia風の百科事典記事（Markdown形式）を日本語で執筆してください。
文体は学術的・知性的でありながら、ユーザーの泥臭い行動や珍妙な判断を軽妙にツッコミ・分析するウィットに富んだトーンにしてください。
見出し（## 1. 概要, ## 2. 地理と主要事象, ## 3. 民俗学的評価）、箇条書き、引用ブロックを活用してください。`;
      } else if (style === 'scp') {
        systemPrompt = `あなたはSCP財団の特異点上級研究員「Dr. アーク」です。
ユーザーの記録を元に、極秘のSCP特別収容プロトコル・事案報告書（Markdown形式）を日本語で執筆してください。
アイテム番号（SCP-LOG-XXXX）、オブジェクトクラス（Euclid等）、特別収容プロトコル、説明、事案タイムライン、研究主任の冷徹な所感を構築してください。
ユーザー自身が異常現象を引き起こしているかのような、不穏で知的な機密文書トーンにしてください。`;
      } else {
        systemPrompt = `あなたは滅びゆく世界の記憶を歌い継ぐ「名無しの老吟遊詩人」です。
ユーザーの記録を元に、壮大なダークファンタジー神話・叙事詩（Markdown形式）を日本語で執筆してください。
序詩、各日/各章の踏破詩節、終詩で構成し、美しくも切ない文体で、旅人の足跡を永遠の伝説へと昇華させてください。`;
      }

      const promptData = {
        worldName: world.name,
        player: world.player,
        genre: world.genre,
        memo: world.memo,
        members: world.members,
        records: records.map((r: any) => ({
          day: r.dayNumber,
          date: r.recordedAt,
          location: r.locationName,
          coords: r.coords,
          category: r.category,
          memo: r.memo,
          photoCaptions: r.photos?.map((p: any) => p.caption),
        })),
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `以下の記録データを元に、指定のスタイルで旅の書（Wiki記事）を執筆してください。\n\nデータ: ${JSON.stringify(promptData, null, 2)}`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.8,
        },
      });

      const text = response.text || '';
      const firstLine = text.split('\n')[0].replace(/^#+\s*/, '') || `${world.name} 旅の書`;

      res.json({
        title: firstLine,
        content: text,
        summary: `${world.name}の全${records.length}件の記録をAIが解析し編纂した公式クロニクル。`,
      });
    } catch (err: any) {
      console.error('Gemini generate error:', err);
      res.status(500).json({ error: err.message || 'Generation failed' });
    }
  });

  // Vite middleware in dev, static serving in prod
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
    console.log(`Utapedia Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
