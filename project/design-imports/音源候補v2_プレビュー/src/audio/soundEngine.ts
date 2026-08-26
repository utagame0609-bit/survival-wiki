/**
 * Survival Wiki Sound Studio - Audio Engine & Synthesizer
 * 
 * 既存のWeb Audio APIオシレーター構成・再生ロジック・原本定義を100%維持した上で、
 * 新規SE候補（16音）およびWIKI生成NPC3人格専用BGM（3曲）を追加定義。
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyser: AnalyserNode | null = null;

// アクティブなループ / BGM 管理
interface ActiveLoopTrack {
  id: string;
  intervalId: number | null;
  nodes: (AudioNode | { stop: () => void })[];
  stop: () => void;
}

let activeLoop: ActiveLoopTrack | null = null;

// 音量管理 (0.0 ~ 1.0)
let currentMasterVolume = 0.8;
let isMuted = false;

// イベントリスナー
type SoundStateListener = (activeId: string | null, isPlaying: boolean) => void;
const listeners = new Set<SoundStateListener>();

export function subscribeSoundState(fn: SoundStateListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyState(activeId: string | null, isPlaying: boolean): void {
  listeners.forEach(fn => fn(activeId, isPlaying));
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : currentMasterVolume, ctx.currentTime);

    analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

export function getAnalyser(): AnalyserNode | null {
  getAudioContext();
  return analyser;
}

export function setMasterVolume(vol: number): void {
  currentMasterVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : currentMasterVolume, ctx.currentTime, 0.05);
  }
}

export function getMasterVolume(): number {
  return currentMasterVolume;
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : currentMasterVolume, ctx.currentTime, 0.03);
  }
  return isMuted;
}

export function getIsMuted(): boolean {
  return isMuted;
}

function getDestination(): AudioNode | null {
  const c = getAudioContext();
  if (!c) return null;
  return masterGain ?? c.destination;
}

// -------------------------------------------------------------
// 【既存共通関数：100%維持】
// -------------------------------------------------------------
function tone(
  c: AudioContext,
  f: number,
  t: number,
  d: number,
  v: number,
  type: OscillatorType,
  end?: number
): void {
  const dest = getDestination() ?? c.destination;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (end) o.frequency.exponentialRampToValueAtTime(Math.max(1, end), t + d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + d + 0.01);
}

function hiss(
  c: AudioContext,
  t: number,
  d: number,
  v: number,
  type: BiquadFilterType,
  f: number
): void {
  const dest = getDestination() ?? c.destination;
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * d));
  const b = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = b.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const g = c.createGain();
  s.buffer = b;
  filter.type = type;
  filter.frequency.value = f;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(filter);
  filter.connect(g);
  g.connect(dest);
  s.start(t);
  s.stop(t + d);
}

// -------------------------------------------------------------
// 【サウンド候補 プレビュー再生マップ】
// -------------------------------------------------------------
export const PREVIEW_SOUNDS: Record<string, () => void> = {
  // ==========================================
  // 1. 既存音源 (12音 - 既存実装完全維持)
  // ==========================================
  cursor_move: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    tone(c, 1320, t, 0.045, 0.16, 'square', 1980);
    hiss(c, t, 0.045, 0.04, 'highshelf', 3000);
  },
  confirm: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    tone(c, 880, t, 0.08, 0.18, 'square');
    tone(c, 1760, t + 0.045, 0.095, 0.16, 'square');
  },
  cancel: () => {
    const c = getAudioContext();
    if (!c) return;
    tone(c, 659, c.currentTime, 0.11, 0.13, 'square', 330);
  },
  warning: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    tone(c, 116, t, 0.28, 0.18, 'sawtooth');
    tone(c, 123, t, 0.28, 0.14, 'square');
    tone(c, 65, t, 0.16, 0.2, 'triangle', 50);
    hiss(c, t, 0.28, 0.05, 'lowpass', 1200);
  },
  tab_switch: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    tone(c, 950, t, 0.055, 0.15, 'square', 1600);
    hiss(c, t, 0.05, 0.07, 'bandpass', 3200);
  },
  modal_open_close: () => {
    const c = getAudioContext();
    if (!c) return;
    tone(c, 480, c.currentTime, 0.12, 0.22, 'sine', 110);
  },
  dialogue_char: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    [880, 920, 860, 900, 875].forEach((f, i) => tone(c, f, t + i * 0.07, 0.035, 0.09, 'triangle'));
  },
  new_record: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    [1318.51, 1760, 2637.02].forEach((f, i) =>
      tone(c, f, t + i * 0.03, i === 2 ? 0.45 : 0.12, 0.18, 'square')
    );
  },
  chest_open: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    tone(c, 120, t, 0.07, 0.18, 'triangle', 80);
    tone(c, 260, t + 0.04, 0.16, 0.12, 'triangle', 210);
    tone(c, 523.25, t + 0.08, 0.16, 0.11, 'triangle', 1046.5);
    hiss(c, t, 0.07, 0.06, 'lowpass', 900);
  },
  achievement: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51].forEach((f, i) =>
      tone(c, f, t + i * 0.09, 0.22, 0.13, 'square')
    );
  },
  wiki_generating_noise: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    hiss(c, t, 1.2, 0.06, 'bandpass', 1450);
    tone(c, 60, t, 1.2, 0.015, 'sine');
  },
  wiki_complete: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51].forEach((f, i) =>
      tone(c, f, t + i * 0.1, 0.3, 0.11, 'triangle')
    );
    tone(c, 2093, t + 0.82, 0.35, 0.12, 'sine');
  },

  // ==========================================
  // 2. 新規SE候補：優先度【大】 (8音)
  // ==========================================
  footstep: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 軽い低音ステップ + 砂利感の微小ノイズ
    tone(c, 140, t, 0.055, 0.14, 'triangle', 65);
    tone(c, 80, t, 0.04, 0.1, 'sine', 40);
    hiss(c, t, 0.04, 0.035, 'bandpass', 1800);
  },
  hover: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 極めて軽量な高域マイクロパルス (2.2kHz)
    tone(c, 2200, t, 0.022, 0.07, 'square', 2400);
  },
  card_open: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // シャキッとした展開音 (上昇レゾナンススイープ + 高域エアー)
    tone(c, 520, t, 0.09, 0.14, 'square', 1480);
    tone(c, 1040, t + 0.02, 0.08, 0.09, 'triangle', 2080);
    hiss(c, t, 0.065, 0.045, 'highpass', 4200);
  },
  card_close: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 滑らかな閉じ音 (下降スイープ + ローパス着地)
    tone(c, 980, t, 0.085, 0.13, 'triangle', 320);
    tone(c, 490, t + 0.015, 0.07, 0.09, 'sine', 160);
    hiss(c, t, 0.05, 0.03, 'lowpass', 1500);
  },
  add: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 明るく弾む3連アップビート (G5 → C6 → E6)
    [783.99, 1046.5, 1318.51].forEach((f, i) => {
      tone(c, f, t + i * 0.04, 0.085, 0.15, 'square');
    });
    hiss(c, t + 0.08, 0.06, 0.03, 'highshelf', 3500);
  },
  save: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 確信の持てる澄んだ達成チャイム (C6 + G6 和音 + 残響)
    tone(c, 1046.5, t, 0.22, 0.16, 'sine');
    tone(c, 1567.98, t + 0.02, 0.24, 0.13, 'triangle');
    tone(c, 2093.0, t + 0.04, 0.18, 0.08, 'square');
    hiss(c, t, 0.12, 0.025, 'bandpass', 5000);
  },
  toggle: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // パチッとしたメカニカルトグルスイッチ音
    tone(c, 1800, t, 0.035, 0.18, 'square', 900);
    tone(c, 320, t + 0.008, 0.03, 0.15, 'triangle', 120);
    hiss(c, t, 0.028, 0.06, 'bandpass', 2400);
  },
  error: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 重厚だが不快すぎない警告・拒絶音 (F#3 + G3 不協和音 + サブ)
    tone(c, 185.0, t, 0.22, 0.18, 'sawtooth');
    tone(c, 196.0, t, 0.22, 0.16, 'square');
    tone(c, 92.5, t, 0.18, 0.22, 'triangle', 60);
    hiss(c, t, 0.18, 0.05, 'lowpass', 900);
  },

  // ==========================================
  // 3. 新規SE候補：優先度【中】 (8音)
  // ==========================================
  danger_confirm: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 危険な操作を実行する前の重厚な確認音 (サブドロップ 90Hz->45Hz + D4/D#4 緊迫シマー)
    tone(c, 90, t, 0.35, 0.24, 'triangle', 45);
    tone(c, 293.66, t + 0.03, 0.25, 0.12, 'square');
    tone(c, 311.13, t + 0.03, 0.25, 0.1, 'sawtooth');
    tone(c, 1174.66, t + 0.06, 0.15, 0.06, 'sine');
    hiss(c, t, 0.25, 0.04, 'lowpass', 600);
  },
  record_select: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 乾いた軽いクリック・選択音 (カセット/カード選択感)
    tone(c, 680, t, 0.045, 0.15, 'triangle', 340);
    tone(c, 1200, t, 0.02, 0.08, 'square', 800);
    hiss(c, t, 0.03, 0.03, 'bandpass', 2800);
  },
  ai_generate_start: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // サイバーシステム起動・データ解析開始音 (320Hz → 2400Hz チャージスイープ)
    tone(c, 320, t, 0.32, 0.16, 'sawtooth', 2400);
    tone(c, 640, t + 0.05, 0.27, 0.12, 'square', 3200);
    [1200, 1600, 2000, 2400].forEach((f, i) => {
      tone(c, f, t + i * 0.06, 0.04, 0.06, 'triangle');
    });
    hiss(c, t, 0.3, 0.045, 'bandpass', 3600);
  },
  ai_generate_complete: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // AI Wiki記事完成祝福・結晶化音 (E5 - G#5 - B5 - E6 和音 + クリスタルエコー)
    [659.25, 830.61, 987.77, 1318.51, 1661.22, 2637.02].forEach((f, i) => {
      tone(c, f, t + i * 0.065, 0.45, 0.12, 'square');
      tone(c, f * 0.5, t + i * 0.065, 0.35, 0.08, 'triangle');
    });
    hiss(c, t + 0.2, 0.4, 0.03, 'highpass', 4800);
  },
  chest_close: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // チェスト収納・閉め音 (金属ラッチ 1.4kHz + 木箱胴鳴り 180Hz)
    tone(c, 1400, t, 0.04, 0.16, 'square', 600);
    tone(c, 180, t + 0.02, 0.11, 0.18, 'triangle', 70);
    hiss(c, t, 0.08, 0.06, 'lowpass', 1200);
  },
  screen_transition: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // ディープな空間遷移音 (バンドパスノイズ 4.5kHz->600Hz + サブサイン 85Hz)
    hiss(c, t, 0.36, 0.08, 'bandpass', 2400);
    tone(c, 85, t, 0.36, 0.22, 'sine', 35);
    tone(c, 440, t + 0.05, 0.28, 0.09, 'triangle', 180);
  },
  notification: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // ポップアップ通知音 (C6 1046.5Hz → E6 1318.5Hz 丸いチャイム)
    tone(c, 1046.5, t, 0.09, 0.14, 'sine');
    tone(c, 1318.51, t + 0.045, 0.14, 0.16, 'triangle');
    tone(c, 2093.0, t + 0.06, 0.08, 0.05, 'sine');
  },
  input_focus: () => {
    const c = getAudioContext();
    if (!c) return;
    const t = c.currentTime;
    // 入力欄フォーカス極小パルス (1600Hz → 800Hz)
    tone(c, 1600, t, 0.028, 0.08, 'sine', 800);
  },
};

// -------------------------------------------------------------
// 【WIKI生成NPC 3人格専用BGM アルゴリズム音源】
// -------------------------------------------------------------

/**
 * 1. ウタペディア（百科事典・民俗学者）
 * クラシカル × レトロサイバー × 洗練された雰囲気
 * バロック風チェンバロ矩形波アルペジオ + 不穏な半音階ディミニッシュ + 通奏低音
 */
function createWikipediaBgmEngine(c: AudioContext): ActiveLoopTrack {
  let step = 0;
  const bpm = 112;
  const stepTime = 60 / bpm / 2; // 8分音符単位 (約0.267秒)
  
  // Aマイナー主調 + 皮肉で不穏なディミニッシュ進行
  // 16ステップループ
  const melodyNotes: (number | null)[] = [
    880, 1046.5, 1318.51, 1046.5, // A5, C6, E6, C6 (整然としたAマイナー)
    830.61, 987.77, 1244.51, 987.77, // G#5, B5, D#6, B5 (皮肉なディミニッシュ)
    880, 1174.66, 1396.91, 1174.66, // A5, D6, F6, D6 (学術的な展開)
    1046.5, 987.77, 880, 830.61, // C6, B5, A5, G#5 (不穏な下降半音)
  ];
  
  const bassNotes: (number | null)[] = [
    220, null, 220, null, // A3
    207.65, null, 207.65, null, // G#3
    293.66, null, 293.66, null, // D4
    220, null, 164.81, 207.65, // A3, E3, G#3
  ];

  const interval = window.setInterval(() => {
    if (!ctx || ctx.state === 'suspended') return;
    const t = ctx.currentTime;
    const mNote = melodyNotes[step % melodyNotes.length];
    const bNote = bassNotes[step % bassNotes.length];

    if (mNote) {
      // チェンバロ風矩形波
      tone(ctx, mNote, t, 0.12, 0.08, 'square');
      tone(ctx, mNote * 0.5, t, 0.09, 0.04, 'triangle');
    }

    if (bNote) {
      // 冷静な通奏低音
      tone(ctx, bNote, t, 0.22, 0.1, 'triangle');
    }

    // 4拍ごとの控えめなサイバーパルス
    if (step % 4 === 0) {
      hiss(ctx, t, 0.03, 0.015, 'highshelf', 4000);
    }

    step = (step + 1) % 16;
  }, stepTime * 1000);

  return {
    id: 'npc_bgm_wikipedia',
    intervalId: interval,
    nodes: [],
    stop: () => {
      window.clearInterval(interval);
    },
  };
}

/**
 * 2. SCP FOUNDATION（機密報告・特異点研究員）
 * ミリタリー × サイバー × インダストリアル 16bitアンビエント
 * 重厚な低周波ノコギリ波ドローン (55Hz) + ガイガーカウンター風パルス + 金属的ステップ
 */
function createScpBgmEngine(c: AudioContext): ActiveLoopTrack {
  let step = 0;
  const bpm = 96;
  const stepTime = 60 / bpm / 2; // 約0.312秒

  // 冷徹で無機質な単音シーケンス
  const leadNotes: (number | null)[] = [
    440, null, 440, null, // A4
    466.16, null, null, null, // Bb4 (半音の緊張)
    440, null, 554.37, null, // A4, C#5
    523.25, 493.88, 466.16, null, // C5, B4, Bb4
  ];

  const dest = getDestination() ?? c.destination;

  // 持続する低周波インダストリアルドローン (55Hz / A1)
  const droneOsc = c.createOscillator();
  const droneGain = c.createGain();
  const droneFilter = c.createBiquadFilter();

  droneOsc.type = 'sawtooth';
  droneOsc.frequency.setValueAtTime(55, c.currentTime);
  droneFilter.type = 'lowpass';
  droneFilter.frequency.setValueAtTime(220, c.currentTime);

  droneGain.gain.setValueAtTime(0.0001, c.currentTime);
  droneGain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.5);

  droneOsc.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(dest);
  droneOsc.start();

  const interval = window.setInterval(() => {
    if (!ctx || ctx.state === 'suspended') return;
    const t = ctx.currentTime;
    const note = leadNotes[step % leadNotes.length];

    if (note) {
      // 冷たい金属的パルス
      tone(ctx, note, t, 0.16, 0.07, 'sawtooth');
      tone(ctx, note * 2, t, 0.06, 0.03, 'square');
    }

    // ガイガーカウンター風不規則パルス (Dクラス実験室の気配)
    if (Math.random() > 0.4) {
      hiss(ctx, t, 0.015, 0.025, 'bandpass', 3800 + Math.random() * 800);
    }

    // 重いインダストリアル・パルス (4ステップ毎)
    if (step % 4 === 0) {
      tone(ctx, 110, t, 0.14, 0.12, 'triangle', 40);
    }

    step = (step + 1) % 16;
  }, stepTime * 1000);

  return {
    id: 'npc_bgm_scp',
    intervalId: interval,
    nodes: [droneOsc, droneGain, droneFilter],
    stop: () => {
      window.clearInterval(interval);
      if (ctx) {
        droneGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        setTimeout(() => {
          try {
            droneOsc.stop();
            droneOsc.disconnect();
          } catch {}
        }, 350);
      }
    },
  };
}

/**
 * 3. LOST CHRONICLE（絶望古文書・老吟遊詩人）
 * レトロファンタジー × 16bitアンビエント
 * 哀愁のEマイナー三角波リュート + 遠くで鳴る廃墟の鐘 + 狂気と静寂のドローン
 */
function createAncientBgmEngine(c: AudioContext): ActiveLoopTrack {
  let step = 0;
  const bpm = 78;
  const stepTime = 60 / bpm / 2; // 約0.384秒

  // 哀愁のEマイナーペンタトニック旋律
  const luteNotes: (number | null)[] = [
    329.63, null, 392.0, 493.88, // E4, G4, B4
    587.33, null, 523.25, 493.88, // D5, C5, B4
    392.0, null, 329.63, null, // G4, E4
    293.66, 311.13, 329.63, null, // D4, D#4 (狂気の半音), E4
  ];

  const bellSteps = [0, 8]; // 遠くの鐘

  const interval = window.setInterval(() => {
    if (!ctx || ctx.state === 'suspended') return;
    const t = ctx.currentTime;
    const note = luteNotes[step % luteNotes.length];

    if (note) {
      // 哀愁を帯びた古楽器リュート風 (三角波 + 柔らかな減衰)
      tone(ctx, note, t, 0.28, 0.1, 'triangle');
      tone(ctx, note * 0.5, t, 0.32, 0.06, 'sine');
    }

    // 遠くの廃墟で鳴る鐘 (Bell)
    if (bellSteps.includes(step % 16)) {
      tone(ctx, 1046.5, t, 0.8, 0.05, 'sine');
      tone(ctx, 1567.98, t, 0.6, 0.03, 'triangle');
      tone(ctx, 1661.22, t, 0.5, 0.02, 'sine'); // 不気味な倍音
    }

    // 風の唸り (アンビエント)
    if (step % 8 === 0) {
      hiss(ctx, t, 0.6, 0.02, 'bandpass', 850);
    }

    step = (step + 1) % 16;
  }, stepTime * 1000);

  return {
    id: 'npc_bgm_ancient',
    intervalId: interval,
    nodes: [],
    stop: () => {
      window.clearInterval(interval);
    },
  };
}

// -------------------------------------------------------------
// 【再生・停止 外部API】
// -------------------------------------------------------------

export function stopActiveAudio(): void {
  if (activeLoop) {
    activeLoop.stop();
    activeLoop = null;
  }
  notifyState(null, false);
}

export function playSoundCandidatePreview(id: string): void {
  const c = getAudioContext();
  if (!c) return;

  // もし既に別のループやBGMが鳴っていれば停止
  if (activeLoop) {
    const isSame = activeLoop.id === id;
    stopActiveAudio();
    if (isSame) {
      // トグル停止
      return;
    }
  }

  // 1. NPC専用BGMの再生
  if (id === 'npc_bgm_wikipedia') {
    activeLoop = createWikipediaBgmEngine(c);
    notifyState(id, true);
    return;
  }
  if (id === 'npc_bgm_scp') {
    activeLoop = createScpBgmEngine(c);
    notifyState(id, true);
    return;
  }
  if (id === 'npc_bgm_ancient') {
    activeLoop = createAncientBgmEngine(c);
    notifyState(id, true);
    return;
  }

  // 2. ループSE（wiki_generating_noise）の再生
  if (id === 'wiki_generating_noise') {
    const interval = window.setInterval(() => {
      if (PREVIEW_SOUNDS[id]) PREVIEW_SOUNDS[id]();
    }, 1100);
    PREVIEW_SOUNDS[id]();
    activeLoop = {
      id,
      intervalId: interval,
      nodes: [],
      stop: () => window.clearInterval(interval),
    };
    notifyState(id, true);
    return;
  }

  // 3. ワンショットSEの再生
  const playFn = PREVIEW_SOUNDS[id];
  if (playFn) {
    playFn();
    notifyState(id, true);
    // ワンショット用の一時アクティブ表示（300ms）
    setTimeout(() => {
      if (activeLoop === null) {
        notifyState(null, false);
      }
    }, 300);
  }
}

export function isAudioPlaying(id?: string): boolean {
  if (!id) return activeLoop !== null;
  return activeLoop?.id === id;
}
