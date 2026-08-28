import { NarratorInfo } from '../types';

export const NARRATORS: Record<'wikipedia' | 'scp' | 'ancient', NarratorInfo> = {
  wikipedia: {
    id: 'wikipedia',
    name: '百科事典・民俗学者',
    title: '百科事典・民俗学者',
    avatarEmoji: '🏛️',
    tone: '客観的・学術的・毒舌分析',
    description: '客観的な学術論文に見せかけて、知的にユーモラスにツッコミを入れながら出来事を整理する。',
    sampleVoiceLine: 'ふむ……この記録によれば、ここで無残にも迷走した冒険者は星の数ほどいるようだな。君の生存確率は統計上極めて奇跡的だ。',
    tagline: '事実・毒舌・情報密度：高',
    quote: '「ふむ……この記録によれば、ここで無残にも骨を埋めた冒険者は星の数ほどいるようだな。君の生存確率は統計上極めて奇跡的だ。」',
    styleBadge: '事実・毒舌・情報密度：高',
    bgmId: 'npc_wikipedia',
    themeColors: {
      primary: '#f59e0b',
      border: 'border-amber-500/70',
      bg: 'bg-amber-500/10',
      accent: 'text-amber-400',
    },
  },
  scp: {
    id: 'scp',
    name: '機密報告・上級研究員 (SCP Dr. アーク)',
    title: '機密報告・上級研究員',
    avatarEmoji: '🔬',
    tone: '特別収容プロトコル・冷徹・不穏',
    description: '世界の異常性と君の不可解な行動を、機密の特別収容プロトコル・事案報告書として記録する。',
    sampleVoiceLine: '記録を確認した。残念ながら、今回も君が事象発現の原因である可能性を排除できない。[検閲済]の兆候に厳重警戒せよ。',
    tagline: '機密文書風・冷徹・不穏',
    quote: '「……記録を確認した。残念ながら、今回も君が事象発現の原因である可能性を排除できない。[検閲済]の兆候に注意せよ。」',
    styleBadge: '機密文書風・冷徹・不穏',
    bgmId: 'npc_scp',
    themeColors: {
      primary: '#06b6d4',
      border: 'border-cyan-400/70',
      bg: 'bg-cyan-500/10',
      accent: 'text-cyan-400',
    },
  },
  ancient: {
    id: 'ancient',
    name: '絶望古文書・吟遊詩人',
    title: '絶望古文書・吟遊詩人',
    avatarEmoji: '📜',
    tone: '滅びの叙事詩・悲壮感・神話風',
    description: '泥臭い冒険の足跡を、滅びゆく世界の壮大なる神話と叙事詩へと昇華する。',
    sampleVoiceLine: 'かつて愚かなる旅人がこの荒野を訪れた。彼らが何を求め、何を失ったのか……知る者はもはや吹き荒ぶ風しかいない。',
    tagline: '悲壮感・伝承・叙事詩風',
    quote: '「かつて愚かなる旅人がこの荒野を訪れた。彼らが何を求め、何を失ったのか……知る者はもはや吹き荒ぶ風しかいない。」',
    styleBadge: '悲壮感・伝承・叙事詩風',
    bgmId: 'npc_ancient',
    themeColors: {
      primary: '#f97316',
      border: 'border-orange-500/70',
      bg: 'bg-orange-500/10',
      accent: 'text-orange-400',
    },
  },
};

export const NARRATOR_LIST: NarratorInfo[] = Object.values(NARRATORS);
