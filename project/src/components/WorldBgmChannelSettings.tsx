import { Music2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBgmChannelSettings, setBgmChannelEnabled, subscribeToBgmChannelSettings, type BgmChannelSettings } from '@/lib/bgmSettings';
import { playHoverSound, playToggleSound } from '@/lib/sound';

const CHANNEL_ROWS: Array<{ key: keyof BgmChannelSettings; label: string; detail: string }> = [
  { key: 'lead', label: 'メロディ', detail: 'CH1 // PULSE LEAD' },
  { key: 'harmony', label: 'アルペジオ', detail: 'CH2 // ARPEGGIO' },
  { key: 'bass', label: 'ベース', detail: 'CH3 // TRIANGLE BASS' },
  { key: 'drums', label: 'ドラム', detail: 'CH4 // NOISE DRUMS' },
];

export function WorldBgmChannelSettings() {
  const [bgmChannels, setBgmChannels] = useState<BgmChannelSettings>(getBgmChannelSettings());

  useEffect(() => subscribeToBgmChannelSettings(setBgmChannels), []);

  const handleToggle = (channel: keyof BgmChannelSettings) => {
    setBgmChannelEnabled(channel, !bgmChannels[channel]);
    playToggleSound();
  };

  return (
    <section className="border border-slate-800 bg-[#090d16] p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-cyan-400">
          <Music2 className="h-4 w-4" />
          <span>WORLD SELECT BGM</span>
        </div>
        <span className="text-[10px] font-bold text-cyan-300">4 CHANNELS</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CHANNEL_ROWS.map(({ key, label, detail }) => (
          <div key={key} className="flex items-center justify-between gap-2 border border-slate-800 bg-[#050a14] px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-300">{label}</p>
              <p className="mt-0.5 truncate text-[9px] tracking-wider text-slate-600">{detail}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={bgmChannels[key]}
              aria-label={`${label}のオンオフ`}
              onClick={() => handleToggle(key)}
              onMouseEnter={playHoverSound}
              className={`relative flex h-6 w-11 shrink-0 items-center border p-0.5 transition-colors cursor-pointer ${bgmChannels[key] ? 'border-cyan-500 bg-cyan-950 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'border-slate-700 bg-slate-900'}`}
            >
              <span className={`block h-4 w-4 transition-transform ${bgmChannels[key] ? 'translate-x-5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'translate-x-0 bg-slate-600'}`} />
            </button>
          </div>
        ))}
      </div>
      <p className="text-[10px] leading-4 text-slate-500">メロディ・アルペジオ・ベース・ドラムを個別にON/OFFできます。</p>
    </section>
  );
}
