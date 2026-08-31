import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const R2_WORKER_URL = "https://survival-wiki-r2-api.uta-game-0609.workers.dev";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-3.7-flash";
const MAX_AI_RETRIES = 2;
const AI_RETRY_DELAYS_MS = [1000, 2000];
const AI_TIMEOUT_MS = 12000;
const AI_TOTAL_BUDGET_MS = 30000;
const MAX_IMAGE_INPUTS = 5;

type ImageInput = {
  storagePath?: string;
  imageUrl?: string;
  label?: string;
};

type RequestBody = {
  message?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  imageInputs?: ImageInput[];
  systemPrompt?: string;
};

function safeBodyLog(body: RequestBody) {
  return {
    keys: Object.keys(body),
    messageLength: typeof body.message === "string" ? body.message.length : 0,
    hasImageUrl: typeof body.imageUrl === "string" && body.imageUrl.length > 0,
    hasImageStoragePath: typeof body.imageStoragePath === "string" && body.imageStoragePath.length > 0,
    imageInputCount: Array.isArray(body.imageInputs) ? Math.min(body.imageInputs.length, MAX_IMAGE_INPUTS) : 0,
    hasSystemPrompt: typeof body.systemPrompt === "string" && body.systemPrompt.length > 0,
  };
}

async function fetchR2Image(storagePath: string, authorization: string) {
  const response = await fetch(
    `${R2_WORKER_URL}?path=${encodeURIComponent(storagePath)}`,
    { headers: { Authorization: authorization } },
  );

  if (!response.ok) {
    let details = "";
    try {
      details = await response.text();
    } catch {
      details = "Unable to read R2 error response body";
    }
    throw new Error(`R2 image fetch failed: ${response.status} ${details}`);
  }

  return response;
}

async function imagePartFromResponse(imageResponse: Response) {
  const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
  let binary = "";
  for (let index = 0; index < imageBytes.length; index += 0x8000) {
    binary += String.fromCharCode(...imageBytes.subarray(index, index + 0x8000));
  }

  return {
    type: "image_url",
    image_url: {
      url: `data:${imageResponse.headers.get("content-type") || "image/webp"};base64,${btoa(binary)}`,
    },
  };
}

async function appendImageInput(
  content: Array<Record<string, unknown>>,
  input: ImageInput,
  authorization: string,
  index: number,
) {
  const label = input.label?.trim() || `写真${index + 1}`;
  content.push({ type: "text", text: `\n【${label}】\nこのラベル直後の実画像を写真${index + 1}として扱ってください。` });

  if (input.storagePath) {
    content.push(await imagePartFromResponse(await fetchR2Image(input.storagePath, authorization)));
    return;
  }

  if (input.imageUrl) {
    const imageResponse = await fetch(input.imageUrl);
    if (!imageResponse.ok) throw new Error(`画像${index + 1}の取得に失敗しました。`);
    content.push(await imagePartFromResponse(imageResponse));
  }
}

async function buildMessages(body: RequestBody, authorization: string) {
  const instruction = [
    body.systemPrompt ?? "あなたはWiki記事を作成するAIです。",
    "",
    "重要: 安全性確認や分類結果だけを返さず、必ず依頼されたWiki記事本文だけを指定された形式で返してください。",
    "",
    body.message ?? "接続テストです。短く返答してください。",
  ].join("\n");

  const content: Array<Record<string, unknown>> = [{ type: "text", text: instruction }];
  const imageInputs = Array.isArray(body.imageInputs)
    ? body.imageInputs.slice(0, MAX_IMAGE_INPUTS).filter((input) => input?.storagePath || input?.imageUrl)
    : [];

  if (imageInputs.length > 0) {
    for (let index = 0; index < imageInputs.length; index += 1) {
      await appendImageInput(content, imageInputs[index], authorization, index);
    }
  } else if (body.imageStoragePath) {
    await appendImageInput(content, { storagePath: body.imageStoragePath, label: "代表写真" }, authorization, 0);
  } else if (body.imageUrl) {
    await appendImageInput(content, { imageUrl: body.imageUrl, label: "代表写真" }, authorization, 0);
  }

  return [{ role: "user", content }];
}

async function callOpenRouterWithRetry(apiKey: string, messages: Array<Record<string, unknown>>) {
  const startedAt = Date.now();

  for (let attempt = 0; attempt <= MAX_AI_RETRIES; attempt += 1) {
    const remainingBudget = AI_TOTAL_BUDGET_MS - (Date.now() - startedAt);
    if (remainingBudget <= 0) throw new Error("AI request timed out: total retry budget exceeded");

    const controller = new AbortController();
    const timeoutMs = Math.min(AI_TIMEOUT_MS, remainingBudget);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://survival-wiki.app",
          "X-Title": "Survival Wiki",
        },
        body: JSON.stringify({ model: OPENROUTER_MODEL, messages }),
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        console.warn("[wiki-ai-test] OpenRouter request timed out", { attempt: attempt + 1, timeoutMs });
        throw new Error(`AI request timed out after ${timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    console.log("[wiki-ai-test] OpenRouter response", {
      status: response.status,
      ok: response.ok,
      attempt: attempt + 1,
      elapsedMs: Date.now() - startedAt,
    });

    if (response.ok || (response.status !== 503 && response.status !== 504)) return response;

    if (attempt < MAX_AI_RETRIES) {
      const delay = AI_RETRY_DELAYS_MS[attempt];
      const remainingAfterResponse = AI_TOTAL_BUDGET_MS - (Date.now() - startedAt);
      if (remainingAfterResponse <= delay) throw new Error("AI request timed out: insufficient retry budget");
      console.warn("[wiki-ai-test] OpenRouter transient error; retrying", {
        status: response.status,
        nextAttempt: attempt + 2,
        delayMs: delay,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("AI request failed after retries");
}

Deno.serve(async (req: Request) => {
  console.log("[wiki-ai-test] request", { method: req.method, url: req.url });

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: RequestBody;
  try {
    body = await req.json();
    console.log("[wiki-ai-test] body received", safeBodyLog(body));
  } catch (error) {
    console.error("[wiki-ai-test] request body parse failed", error);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    console.log("[wiki-ai-test] OPENROUTER_API_KEY configured", Boolean(apiKey));
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

    console.log("[wiki-ai-test] calling OpenRouter", {
      model: OPENROUTER_MODEL,
      ...safeBodyLog(body),
    });

    const messages = await buildMessages(body, authorization);
    const aiResponse = await callOpenRouterWithRetry(apiKey, messages);
    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return new Response(JSON.stringify({ error: "OpenRouter request failed", details: data }), {
        status: aiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      message: data.choices?.[0]?.message?.content ?? "",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[wiki-ai-test] unhandled error", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : "AI request failed",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
