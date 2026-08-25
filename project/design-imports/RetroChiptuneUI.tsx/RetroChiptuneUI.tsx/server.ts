import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy Google GenAI initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please set your Gemini API key in AI Studio Settings > Secrets.');
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Music Generation endpoint using Lyria
app.post('/api/generate-music', async (req, res) => {
  try {
    const { 
      prompt, 
      model = 'lyria-3-clip-preview', // 'lyria-3-clip-preview' or 'lyria-3-pro-preview'
      stylePreset,
      tempo,
      mood,
      isLoop = true 
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();

    // Construct enriched prompt for high quality 8bit/16bit synthwave retro game music
    let fullPrompt = prompt.trim();
    const tags: string[] = [];
    
    if (stylePreset) tags.push(stylePreset);
    if (tempo) tags.push(`${tempo} tempo`);
    if (mood) tags.push(mood);
    if (isLoop) tags.push('seamless audio loop, video game background music');

    if (tags.length > 0) {
      fullPrompt = `${fullPrompt}, ${tags.join(', ')}`;
    }

    console.log(`[Lyria API] Generating music with model: ${model}, Prompt: "${fullPrompt}"`);

    const responseStream = await ai.models.generateContentStream({
      model: model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview',
      contents: fullPrompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({ 
        error: 'No audio data was returned by the Lyria model. Please verify your prompt or try again.' 
      });
    }

    return res.json({
      success: true,
      audioBase64,
      mimeType,
      lyrics,
      prompt: fullPrompt,
      model,
      createdAt: Date.now(),
    });
  } catch (error: any) {
    console.error('[Lyria API Error]:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate music track with Lyria API.',
      details: error.toString(),
    });
  }
});

// Prompt Idea Assistant
app.post('/api/suggest-prompts', async (req, res) => {
  try {
    const { category = 'save_menu' } = req.body;
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Generate 4 creative and evocative music generation prompts specifically for retro 8-bit chiptune, 16-bit video game BGM, and neon synthwave music. Category: "${category}". 
Return a strict JSON array of objects with keys: "title" (short track title), "prompt" (detailed prompt string emphasizing instruments like 2A03 square wave, triangle bass, FM synth, tempo, mood, save menu ambiance), "tempo" (e.g. "Medium 112 BPM"), "tags" (array of 3-4 strings like ["8-bit", "Save Menu", "Synthwave"]). Output ONLY JSON.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    let suggestions = [];
    try {
      suggestions = JSON.parse(text);
    } catch {
      suggestions = [
        {
          title: "Memory Card 01 - Save Room",
          prompt: "8-bit chiptune, retro game save menu theme, tranquil arpeggio, soft square wave melody, calming neon synthwave bassline, medium tempo, seamless loop",
          tempo: "Medium 108 BPM",
          tags: ["8-bit", "Save Menu", "Tranquil", "Loop"]
        }
      ];
    }

    return res.json({ suggestions });
  } catch (error: any) {
    console.error('[Prompt Suggestion Error]:', error);
    // Fallback static suggestions if API key is not ready
    return res.json({
      suggestions: [
        {
          title: "Memory Card 01 - Safe Haven Save Point",
          prompt: "8-bit chiptune, retro game save menu theme, nostalgic NES square wave arpeggios, warm triangle bass, calming neon synthwave chords, seamless loop, 16-bit video game BGM, medium tempo 110 BPM",
          tempo: "Medium 110 BPM",
          tags: ["8-bit", "Save Menu", "Nostalgic", "Loop"]
        },
        {
          title: "Neon Sanctuary - Cyberpunk Rest Station",
          prompt: "Neon synthwave, 16-bit video game BGM, mysterious atmospheric pads, catchy electronic melody, analog pulse wave synth, shimmering chorus, medium tempo, seamless loop",
          tempo: "Medium 118 BPM",
          tags: ["Synthwave", "16-bit", "Atmospheric", "Catchy"]
        },
        {
          title: "Crystal Cavern - Level Select & Menu",
          prompt: "8-bit chiptune, mysterious atmospheric video game menu theme, sparkling glass bell arpeggios, fast pulsing pulse wave, medium tempo, smooth loop, catchy electronic melody",
          tempo: "Medium 124 BPM",
          tags: ["8-bit", "Mysterious", "Electronic", "Menu"]
        },
        {
          title: "Midnight Floppy - Retro Title Screen",
          prompt: "16-bit SNES style chiptune, rich Yamaha FM synth brass, catchy electronic lead, retro game inventory and save menu theme, neon synthwave drums, medium tempo",
          tempo: "Medium 115 BPM",
          tags: ["16-bit", "FM Synth", "Save Theme", "Loop"]
        }
      ]
    });
  }
});

async function startServer() {
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
    console.log(`Chiptune & Retro Game Music Studio running at http://localhost:${PORT}`);
  });
}

startServer();
