export type ScpObjectClass = 'SAFE' | 'EUCLID' | 'KETER' | 'ANOMALOUS';

export type ScpLogEntry = {
  time: string;
  speaker?: string;
  text: string;
  severity?: 'NORMAL' | 'CAUTION' | 'CRITICAL';
};

export type ScpCallout = {
  type: 'WARNING' | 'PROTOCOL' | 'NOTE' | 'REDACTED';
  label: string;
  text: string;
};

export type ScpSection = {
  id: string;
  number: string;
  title: string;
  subTitle?: string;
  paragraphs: string[];
  callout?: ScpCallout;
  logEntries?: ScpLogEntry[];
};

export type ScpDossierV1 = {
  format: 'scp-dossier-v1';
  title: string;
  itemNumber: string;
  caseId: string;
  objectClass: ScpObjectClass;
  securityClearance: number;
  warningNotice: string;
  containmentProcedure: string;
  executiveSummary: string;
  sections: ScpSection[];
};

type RawScpAiPayload = Partial<Omit<ScpDossierV1, 'format'>> & {
  narratorLine?: string;
};

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`SCP構造化記事の ${field} が不足しています。`);
  }
  return value.trim();
}

function normalizeObjectClass(value: unknown): ScpObjectClass {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (normalized === 'SAFE' || normalized === 'EUCLID' || normalized === 'KETER' || normalized === 'ANOMALOUS') {
    return normalized;
  }
  throw new Error('SCP構造化記事の objectClass が不正です。');
}

function normalizeSecurityClearance(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) throw new Error('SCP構造化記事の securityClearance が不正です。');
  return Math.min(5, Math.max(1, Math.round(numeric)));
}

function normalizeLogEntries(value: unknown): ScpLogEntry[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const entries = value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.text !== 'string' || !record.text.trim()) return [];
    const severity = String(record.severity ?? '').toUpperCase();
    return [{
      time: typeof record.time === 'string' && record.time.trim() ? record.time.trim() : 'TIME_UNVERIFIED',
      ...(typeof record.speaker === 'string' && record.speaker.trim() ? { speaker: record.speaker.trim() } : {}),
      text: record.text.trim(),
      ...(severity === 'NORMAL' || severity === 'CAUTION' || severity === 'CRITICAL'
        ? { severity: severity as ScpLogEntry['severity'] }
        : {}),
    }];
  });
  return entries.length > 0 ? entries : undefined;
}

function normalizeCallout(value: unknown): ScpCallout | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.text !== 'string' || !record.text.trim()) return undefined;
  const type = String(record.type ?? 'NOTE').toUpperCase();
  const normalizedType: ScpCallout['type'] = type === 'WARNING' || type === 'PROTOCOL' || type === 'REDACTED' ? type : 'NOTE';
  return {
    type: normalizedType,
    label: typeof record.label === 'string' && record.label.trim() ? record.label.trim() : normalizedType,
    text: record.text.trim(),
  };
}

function normalizeSections(value: unknown): ScpSection[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('SCP構造化記事の sections が不足しています。');
  }

  const sections = value.flatMap((section, index) => {
    if (!section || typeof section !== 'object') return [];
    const record = section as Record<string, unknown>;
    const paragraphs = Array.isArray(record.paragraphs)
      ? record.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === 'string' && Boolean(paragraph.trim())).map((paragraph) => paragraph.trim())
      : [];
    if (paragraphs.length === 0) return [];

    const idBase = typeof record.id === 'string' && record.id.trim() ? record.id.trim() : `section-${index + 1}`;
    const id = idBase.replace(/[^a-zA-Z0-9_-]/g, '-');
    return [{
      id,
      number: typeof record.number === 'string' && record.number.trim() ? record.number.trim() : `§ ${index + 1}.0`,
      title: typeof record.title === 'string' && record.title.trim() ? record.title.trim() : `観察記録 ${index + 1}`,
      ...(typeof record.subTitle === 'string' && record.subTitle.trim() ? { subTitle: record.subTitle.trim() } : {}),
      paragraphs,
      ...(normalizeCallout(record.callout) ? { callout: normalizeCallout(record.callout) } : {}),
      ...(normalizeLogEntries(record.logEntries) ? { logEntries: normalizeLogEntries(record.logEntries) } : {}),
    }];
  });

  if (sections.length === 0) throw new Error('SCP構造化記事に有効な本文セクションがありません。');
  return sections;
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const start = withoutFence.indexOf('{');
  const end = withoutFence.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('SCP構造化記事のJSONを取得できませんでした。');
  return withoutFence.slice(start, end + 1);
}

export function parseScpAiResponse(raw: string): { dossier: ScpDossierV1; narratorLine: string } {
  let parsed: RawScpAiPayload;
  try {
    parsed = JSON.parse(extractJson(raw)) as RawScpAiPayload;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('SCP構造化記事')) throw error;
    throw new Error('SCP構造化記事のJSON解析に失敗しました。');
  }

  const dossier: ScpDossierV1 = {
    format: 'scp-dossier-v1',
    title: asString(parsed.title, 'title'),
    itemNumber: asString(parsed.itemNumber, 'itemNumber'),
    caseId: asString(parsed.caseId, 'caseId'),
    objectClass: normalizeObjectClass(parsed.objectClass),
    securityClearance: normalizeSecurityClearance(parsed.securityClearance),
    warningNotice: asString(parsed.warningNotice, 'warningNotice'),
    containmentProcedure: asString(parsed.containmentProcedure, 'containmentProcedure'),
    executiveSummary: asString(parsed.executiveSummary, 'executiveSummary'),
    sections: normalizeSections(parsed.sections),
  };

  return {
    dossier,
    narratorLine: asString(parsed.narratorLine, 'narratorLine'),
  };
}

export function parseStoredScpDossier(content: string): ScpDossierV1 | null {
  try {
    const parsed = JSON.parse(content) as Partial<ScpDossierV1>;
    if (parsed?.format !== 'scp-dossier-v1') return null;
    return {
      format: 'scp-dossier-v1',
      title: asString(parsed.title, 'title'),
      itemNumber: asString(parsed.itemNumber, 'itemNumber'),
      caseId: asString(parsed.caseId, 'caseId'),
      objectClass: normalizeObjectClass(parsed.objectClass),
      securityClearance: normalizeSecurityClearance(parsed.securityClearance),
      warningNotice: asString(parsed.warningNotice, 'warningNotice'),
      containmentProcedure: asString(parsed.containmentProcedure, 'containmentProcedure'),
      executiveSummary: asString(parsed.executiveSummary, 'executiveSummary'),
      sections: normalizeSections(parsed.sections),
    };
  } catch {
    return null;
  }
}

export const SCP_STRUCTURED_OUTPUT_INSTRUCTIONS = `
【SCP A案 / DECLASSIFIED DOSSIER 構造化出力ルール】
この指示は上記のMarkdown出力指定より優先します。Markdown本文は出力しないでください。
返答は必ずJSONオブジェクト1個だけにしてください。コードフェンス、前置き、後書きは禁止です。

出力スキーマ:
{
  "title": "文書タイトル",
  "itemNumber": "SCP-XXXX-JP等の項目番号",
  "caseId": "CASE-XXXX等の案件コード",
  "objectClass": "SAFE | EUCLID | KETER | ANOMALOUS のいずれか",
  "securityClearance": 1から5の整数,
  "warningNotice": "機密資料の警告文",
  "containmentProcedure": "特別収容プロトコル。1〜3段落相当の文章",
  "executiveSummary": "調書要旨。150〜300文字程度",
  "sections": [
    {
      "id": "英数字とハイフンの一意なID",
      "number": "§ 1.0",
      "title": "章タイトル",
      "subTitle": "任意の短い副題",
      "paragraphs": ["本文段落1", "本文段落2"],
      "callout": { "type": "WARNING | PROTOCOL | NOTE | REDACTED", "label": "短いラベル", "text": "任意の注記" },
      "logEntries": [
        { "time": "記録時刻または時系列ラベル", "speaker": "任意", "text": "観察ログ", "severity": "NORMAL | CAUTION | CRITICAL" }
      ]
    }
  ],
  "narratorLine": "Dr.アークがプレイヤーへ向ける40〜70文字程度の一言"
}

必須条件:
- title / itemNumber / caseId / objectClass / securityClearance / warningNotice / containmentProcedure / executiveSummary / sections / narratorLine は必須。
- sectionsは3〜6章を基本とし、記録量が少ない場合は無理に水増ししない。
- ユーザー入力のロケーション名は一文字も変更しない。
- 記録に存在しない出来事を事実として断定しない。推測・解釈・世界観演出を加える場合は「推測される」「可能性を排除できない」「記録上は確認不能」等、推測と分かる書き方にする。
- 座標、同行者、写真の有無などの実データはUI側で表示するため、JSON内で捏造しない。
- 写真URLやStorage pathを本文へ出力しない。
- narratorLineは記事本文の要約ではなく、Dr.アークらしい乾いた評価・皮肉とする。
`;
