import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Clock, BookOpen, Sliders } from 'lucide-react';
import { playToggleSound } from '@/lib/sound';

export type NavigateFn = (route: { name: string; gameId?: string; gameName?: string; worldId?: string; worldName?: string }) => void;

export function Header({
  title,
  onBack,
  version = '[Node_ID: TAC-4096] [Link: STABLE]',
  status = 'LOG OPEN',
  system = 'ONLINE',
  onOpenSettings,
}: {
  title: string;
  onBack?: () => void;
  version?: string;
  status?: string;
  system?: string;
  onOpenSettings?: () => void;
}) {
  const initial = title ? title.charAt(0).toUpperCase() : 'A';
  const [uptime, setUptime] = useState('12:45:09');

  useEffect(() => {
    const startTime = Date.now() - 45909000;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const hours = String(Math.floor(diff / 3600) % 24).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');
      setUptime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-20 border-b border-slate-800 bg-[#0f172a]/70 backdrop-blur-sm text-slate-300 px-4 sm:px-6 py-2.5 select-none font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left / Back + Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1.5 rounded-sm bg-[#090d16] border border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400 active:scale-95 transition-all text-[11px] font-bold font-mono shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>[WORLD SELECT]</span>
            </button>
          )}

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-sm bg-amber-500 text-black flex items-center justify-center font-bold text-base shrink-0 shadow-lg shadow-amber-500/20">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-amber-500 truncate tracking-wide uppercase">
                  {title}
                </h1>
              </div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tight truncate">
                {version}
              </p>
            </div>
          </div>
        </div>

        {/* Right / Uptime + Status + System Config */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono shrink-0 self-end md:self-auto">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-500">UPTIME:</span>
            <span className="text-emerald-400 font-bold">{uptime}</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">STATUS</div>
              <div className="text-emerald-400 text-[11px] font-bold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span>{status}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">SYSTEM</div>
              <div className="text-amber-400 text-[11px] font-bold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                <span>{system}</span>
              </div>
            </div>
          </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-[11px] font-mono text-slate-300 hover:border-sky-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3 h-3 text-sky-400" />
              <span>[SYSTEM_CONFIG]</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function TabNav({
  activeTab,
  onSelectTab,
}: {
  activeTab: 'locations' | 'timeline' | 'wiki';
  onSelectTab: (tab: 'locations' | 'timeline' | 'wiki') => void;
}) {
  return (
    <div className="relative z-10 border-b border-slate-800 bg-[#06090e] px-4 sm:px-6 py-2.5 select-none font-mono">
      <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto">
        {/* Tab 1: Locations */}
        <button
          type="button"
          onClick={() => {
            if (activeTab !== 'locations') {
              playToggleSound();
              onSelectTab('locations');
            }
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer border ${
            activeTab === 'locations'
              ? 'bg-[#090d16] text-emerald-400 border-slate-800 border-l-2 border-l-emerald-400 shadow-md'
              : 'bg-[#06090e] text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          {activeTab === 'locations' && <span className="text-emerald-400 text-xs">▶</span>}
          <MapPin className={`w-3.5 h-3.5 ${activeTab === 'locations' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>ロケーション (LOCATIONS)</span>
        </button>

        {/* Tab 2: Timeline */}
        <button
          type="button"
          onClick={() => {
            if (activeTab !== 'timeline') {
              playToggleSound();
              onSelectTab('timeline');
            }
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer border ${
            activeTab === 'timeline'
              ? 'bg-[#090d16] text-amber-400 border-slate-800 border-l-2 border-l-amber-400 shadow-md'
              : 'bg-[#06090e] text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          {activeTab === 'timeline' && <span className="text-amber-400 text-xs">▶</span>}
          <Clock className={`w-3.5 h-3.5 ${activeTab === 'timeline' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>タイムライン (TIMELINE)</span>
        </button>

        {/* Tab 3: Wiki */}
        <button
          type="button"
          onClick={() => {
            if (activeTab !== 'wiki') {
              playToggleSound();
              onSelectTab('wiki');
            }
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer border ${
            activeTab === 'wiki'
              ? 'bg-[#090d16] text-sky-400 border-slate-800 border-l-2 border-l-sky-400 shadow-md'
              : 'bg-[#06090e] text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          {activeTab === 'wiki' && <span className="text-sky-400 text-xs">▶</span>}
          <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'wiki' ? 'text-sky-400' : 'text-slate-500'}`} />
          <span>Wiki 旅の書</span>
        </button>
      </div>
    </div>
  );
}
