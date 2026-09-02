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
    const callout = normalizeCallout(record.callout);
    const logEntries = normalizeLogEntries(record.logEntries);
    return [{
      id,
      number: typeof record.number === 'string' && record.number.trim() ? record.number.trim() : `§ ${index + 1}.0`,
      title: typeof record.title === 'string' && record.title.trim() ? record.title.trim() : `観察記録 ${index + 1}`,
      ...(typeof record.subTitle === 'string' && record.subTitle.trim() ? { subTitle: record.subTitle.trim() } : {}),
      paragraphs,
      ...(callout ? { callout } : {}),
      ...(logEntries ? { logEntries } : {}),
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

export function scpDossierToPlainText(content: string): string | null {
  const dossier = parseStoredScpDossier(content);
  if (!dossier) return null;

  const lines = [
    dossier.title,
    '',
    `項目番号: ${dossier.itemNumber}`,
    `案件コード: ${dossier.caseId}`,
    `オブジェクトクラス: ${dossier.objectClass}`,
    `セキュリティクリアランス: LV-${dossier.securityClearance}`,
    '',
    `WARNING: ${dossier.warningNotice}`,
    '',
    '特別収容プロトコル',
    dossier.containmentProcedure,
    '',
    '調書要旨',
    dossier.executiveSummary,
  ];

  for (const section of dossier.sections) {
    lines.push('', `${section.number} ${section.title}`);
    if (section.subTitle) lines.push(section.subTitle);
    lines.push(...section.paragraphs);
    if (section.logEntries?.length) {
      lines.push('', '[TRANSCRIPT LOG]');
      for (const log of section.logEntries) {
        lines.push(`${log.time}${log.speaker ? ` / ${log.speaker}` : ''}: ${log.text}`);
      }
    }
    if (section.callout) lines.push('', `${section.callout.label}: ${section.callout.text}`);
  }

  return lines.join('\n');
}

export const SCP_STRUCTURED_OUTPUT_INSTRUCTIONS = `
【SCP A案 / DECLASSIFIED DOSSIER 構造化出力ルール】
この指示は上記のMarkdown出力指定より優先します。Markdown本文は出力しないでください。
返答は必ずJSONオブジェクト1個だけにしてください。コードフェンス、前置き、後書きは禁止です。指定外のキーを追加しないでください。

出力スキーマ:
{
  "title": "文書タイトル",
  "itemNumber": "Dossier内の管理記号",
  "caseId": "今回の記事固有の案件コード",
  "objectClass": "SAFE | EUCLID | KETER | ANOMALOUS のいずれか",
  "securityClearance": 1から5の整数,
  "warningNotice": "機密資料の警告文",
  "containmentProcedure": "組織が管理する場合の仮想・暫定手順。1〜3段落相当",
  "executiveSummary": "事実・主要仮説・現在評価をまとめる150〜300文字程度の調書要旨",
  "sections": [
    {
      "id": "英数字とハイフンの一意なID",
      "number": "§ 1.0",
      "title": "章タイトル",
      "subTitle": "任意の短い副題",
      "paragraphs": ["本文段落1", "本文段落2"],
      "callout": { "type": "WARNING | PROTOCOL | NOTE | REDACTED", "label": "短いラベル", "text": "任意の注記" },
      "logEntries": [
        { "time": "入力に存在する時刻または時系列ラベル", "speaker": "入力に存在する話者または観測記録", "text": "観察ログ", "severity": "NORMAL | CAUTION | CRITICAL" }
      ]
    }
  ],
  "narratorLine": "今回固有の事実を一つ拾い、研究員として筋の通った判断と案件化しすぎの落差を同居させる40〜70文字程度のDr.アークの一言"
}

必須条件:
- title / itemNumber / caseId / objectClass / securityClearance / warningNotice / containmentProcedure / executiveSummary / sections / narratorLine は必須。
- sectionsは2〜6章程度。情報が少ない場合は2〜3章でよく、無理に水増ししない。
- ユーザー入力のロケーション名は一文字も変更しない。
- 記録に存在しない出来事、人物、職員、敵、怪物、会話、調査結果、被害、超常現象を事実として追加しない。
- 情報が少ない場合でも、原因候補・行動意図・異常性・因果関係・潜在リスク・分類候補をDr.アークらしい暫定仮説として大胆に広げて構いません。確認されていない内容は必ず「可能性」「暫定」「現時点では未確認」等で示し、観測事実として断定しません。
- 写真から素材・装備名・アイテム種別・用途などを確定できない場合も、複数の候補や見立てを仮説として提示して構いません。ただし写真で確認できた事実のように断定しません。
- 「想像しない」ことを優先してDossierを薄くしないでください。自由な仮説は歓迎しますが、自由な断定は禁止です。
- 異常仮説、潜在リスク、分類候補、仮想プロトコルは大胆に作ってよいが、「可能性」「暫定」「組織が管理する場合」など事実と区別できる書き方にする。
- 座標、同行者、写真の有無などの実データはUI側でも表示するため、入力にない値をJSON内で捏造しない。
- 写真URL、Storage path、内部IDを本文へ出力しない。

【記録者との関係・記事の主役】
- Dr.アークにとって記録者は、重要な情報を持ち帰る現地観測員です。一方、その反復行動、判断、準備不足、予測不能な選択が調査対象になる場合もあります。
- 記録者を危険人物や異常存在として固定しません。入力に根拠がある行動だけを観測対象とし、正式な調査、分類、反証、管理判断によって乾いた面白さを作ってください。
- 入力を整理して言い換えるだけで終わらせず、記録された行動・選択・結果・反復・数量・優先順位・失敗または成功から、記録者らしさが最も表れている要素を原則1つ以上選び、案件の中心軸を作ってください。
- 面白さの対象は記録に根拠がある行動と結果です。人物の知性、能力、容姿、属性、存在価値を笑いの対象にしません。
- 大きな達成、喪失、思い出、深刻な事故では、記録の価値と危険性を優先し、無理に笑いを作りません。適したネタがない場合は、Dr.アーク固有の冷静な観測と判断だけでも構いません。
- マダム・ロゼのような、本人への直接的な毒舌、ゴシップ的な呼びかけ、酒場の軽口を笑いの主軸にしません。

【生成対象範囲】
- 実装側から明示された月・年・全年などの生成対象範囲を、Dossier全体の時間的スコープとして扱ってください。
- title、warningNotice、containmentProcedure、executiveSummary、sections、narratorLineまで、選択された範囲と矛盾させません。
- 期間内の象徴的な出来事や「30日間」などの強い表現を、案件全体の対象期間と誤認しません。
- 実装側から与えられていない期間、日付、月名を新しく作りません。
- 長期間の記事では全記録を羅列せず、重要な変化・転機・反復行動を選別して扱ってください。

【複数資料の不一致】
- メモ、写真、日時、座標など複数の入力資料が一致しない場合、一方を根拠なく正しいものとして確定しません。
- 確認できる情報だけを観測事実として記述し、不一致部分は資料差、可能性、暫定仮説として扱ってください。
- 不一致そのものを、隠蔽、異常、嘘、違反の証拠として扱いません。

【出力量】
- AIが生成し、ユーザーに表示される全テキストは合計3000文字以内とします。
- 対象にはtitle、itemNumber、caseId、objectClass、securityClearance、warningNotice、containmentProcedure、executiveSummary、section見出し・本文、callout、logEntries、narratorLineを含みます。
- JSONキー、内部ID、URL、R2パスなどの構造データは文字数へ含めません。
- 通常は2400文字前後を目安にまとめ、情報量が多い場合も重要記録を選別・圧縮してください。
- 文字数を満たすために、同じ事実・仮説・評価を言い換えて繰り返しません。

分類・演出の運用:
- objectClassは派手さではなく理解度・予測可能性・管理難度で決める。SAFEは理解され管理容易、EUCLIDは情報不足や条件依存、KETERは入力上継続的かつ重大な管理困難性が確認できる場合、ANOMALOUSは通常分類が適さないか判定保留の場合に使う。
- securityClearanceとseverityを笑いのためだけに最大値へ上げない。毎回KETER / Clearance 5 / CRITICALにしない。
- warningNoticeは入力事実または明確な潜在リスクに基づく。存在しない危険を暗示しない。
- containmentProcedureは「組織が管理する場合」の仮想・暫定手順であり、すでに封鎖・監視・押収等を実施した事実として書かない。
- executiveSummaryは事実・主要仮説・現在評価を簡潔にまとめ、オチを詰め込みすぎない。
- calloutは必要な場合だけ使う。WARNINGは事実または潜在リスク、PROTOCOLは仮想手順、NOTEは普通の説明・反証・研究員注記に使用する。
- REDACTEDは入力上、本当に伏せる対象がある場合だけ使う。情報不足を架空の秘密や隠蔽へ変換しない。
- logEntriesは入力に実際の時刻・順序・話者がある場合だけ使う。架空の時刻、職員、会話を作らない。単なる記録ならspeakerを「観測記録」等の非人物ラベルにできる。

Dr.アークv2の文章運用:
- 通常の小規模記録では「案件化 → 暫定評価 → 過剰だが筋の通った対策 → 反証 → 普通の事情へ着地 → 条件付きで記録を残す」の落差を原則1回使う。
- ただし本当に危険、不気味、重大な記録では、無理にSAFEや通常事象へ格下げしない。入力上の危険性を真面目に継続評価し、笑いを弱める。
- 一記事で脅威評価を何度も上下させない。「解析不能」「異常な執着」「可能性を排除できない」だけで笑いを作らない。
- narratorLineは記事本文の要約ではなく、今回のロケーション名、数量、反復、失敗、未完成、結果など一つの固有事実を拾う。プレイヤーの知性・能力・容姿・人格を否定しない。毎回「監視継続」で終わらせない。
`;