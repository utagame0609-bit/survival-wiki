import { Settings, Volume2, VolumeX, X } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  getSoundVolume,
  isSoundEnabled,
  playCancelSound,
  playModalCloseSound,
  playModalOpenSound,
  playToggleSound,
  setSoundVolume,
  toggleSound,
} from '@/lib/sound';
import { checkR2WorkerAuth, uploadR2Photo, type R2WorkerResult, type R2UploadResult } from '@/lib/r2Worker';

export function SettingsButton() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openSettings = () => {
    playModalOpenSound();
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <>
      <button
        onClick={openSettings}
        aria-label="設定"
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#292b24] text-stone-200 border border-[#3a3d34] shadow-lg shadow-black/30 hover:bg-[#34372e] active:scale-95 transition-all"
      >
        <Settings className="w-6 h-6" />
      </button>
      {settingsOpen && <SettingsModal onClose={closeSettings} />}
    </>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());
  const [soundVolume, setSoundVolumeState] = useState(getSoundVolume());
  const [r2Result, setR2Result] = useState<R2WorkerResult | null>(null);
  const [r2Error, setR2Error] = useState('');
  const [r2Loading, setR2Loading] = useState(false);
  const [r2UploadResult, setR2UploadResult] = useState<R2UploadResult | null>(null);
  const [r2UploadError, setR2UploadError] = useState('');
  const [r2UploadLoading, setR2UploadLoading] = useState(false);
  const [testLocationId, setTestLocationId] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundEnabled(next);
    if (next) playToggleSound();
  };

  const handleVolumeChange = (value: number) => {
    setSoundVolumeState(setSoundVolume(value));
  };

  const handleR2Test = async () => {
    setR2Loading(true);
    setR2Error('');
    setR2Result(null);

    try {
      const result = await checkR2WorkerAuth();
      setR2Result(result);
    } catch (error) {
      setR2Error(error instanceof Error ? error.message : String(error));
    } finally {
      setR2Loading(false);
    }
  };

  const handleR2UploadTest = async (file: File) => {
    setR2UploadLoading(true);
    setR2UploadError('');
    setR2UploadResult(null);

    try {
      const locationId = testLocationId.trim();

      if (!locationId) {
        throw new Error('テスト用Location IDを入力してください');
      }

      if (file.type !== 'image/webp') {
        throw new Error('テスト画像はWebP形式を選択してください');
      }

      const result = await uploadR2Photo(locationId, file);
      setR2UploadResult(result);
    } catch (error) {
      setR2UploadError(error instanceof Error ? error.message : String(error));
    } finally {
      setR2UploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <button aria-label="設定を閉じる" className="absolute inset-0" onClick={() => { playModalCloseSound(); onClose(); }} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-emerald-900/70 bg-gradient-to-b from-zinc-900 to-[#151712] text-zinc-100 shadow-[0_0_40px_rgba(0,0,0,0.55),0_0_24px_rgba(16,185,129,0.08)]">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <p className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase font-mono">OPTIONS</p>
            <h2 className="mt-1 text-lg font-bold">設定</h2>
          </div>
          <button
            onClick={() => {
              playModalCloseSound();
              onClose();
            }}
            aria-label="設定を閉じる"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-zinc-500" />}
                <div>
                  <p className="text-sm font-semibold text-zinc-100">SE</p>
                  <p className="mt-0.5 text-xs text-zinc-500">アプリ内の効果音</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                aria-label="SEのオンオフ"
                onClick={handleSoundToggle}
                className={`relative flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition-colors ${soundEnabled ? 'border-emerald-500/70 bg-emerald-600' : 'border-zinc-700 bg-zinc-800'}`}
              >
                <span className={`block h-5 w-5 rounded-full bg-zinc-100 shadow-sm transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label htmlFor="se-volume" className="text-sm font-semibold text-zinc-200">SE音量</label>
                <span className="font-mono text-sm font-bold text-emerald-400">{soundVolume}</span>
              </div>
              <input
                id="se-volume"
                type="range"
                min="0"
                max="100"
                step="1"
                value={soundVolume}
                onChange={(event) => handleVolumeChange(Number(event.target.value))}
                disabled={!soundEnabled}
                className="mt-3 w-full accent-emerald-500 disabled:opacity-40"
              />
              <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
                <span>0 無音</span>
                <span>50 現在の音量</span>
                <span>100 200%</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-500">50を基準に、0で無音、100で現在の音量の2倍です。</p>
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div>
              <p className="text-sm font-semibold text-zinc-100">R2接続テスト</p>
              <p className="mt-0.5 text-xs text-zinc-500">ログイン中のJWTでWorker認証を確認</p>
            </div>

            <button
              type="button"
              onClick={handleR2Test}
              disabled={r2Loading}
              className="mt-4 w-full rounded-lg border border-emerald-700/70 bg-emerald-900/30 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/50 disabled:opacity-50 active:scale-[0.99] transition-all"
            >
              {r2Loading ? '確認中...' : 'R2接続を確認'}
            </button>

            {r2Result && (
              <div className="mt-3 rounded-lg border border-emerald-900/60 bg-emerald-950/30 p-3 text-xs leading-5 text-emerald-200">
                <p>認証: {r2Result.authenticated ? 'OK' : 'NG'}</p>
                <p>ユーザーID: {r2Result.userId ?? '-'}</p>
                <p>R2: {r2Result.r2 ? 'OK' : 'NG'}</p>
                <p>Object数: {r2Result.objectCount ?? '-'}</p>
              </div>
            )}

            {r2Error && (
              <div className="mt-3 rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-xs leading-5 text-red-200">
                {r2Error}
              </div>
            )}

            <div className="mt-5 border-t border-zinc-800 pt-4">
              <p className="text-sm font-semibold text-zinc-100">R2写真アップロードテスト</p>
              <p className="mt-0.5 text-xs text-zinc-500">実データには触れず、指定したLocation IDへWebPを1枚送信します</p>

              <input
                value={testLocationId}
                onChange={(event) => setTestLocationId(event.target.value)}
                placeholder="テスト用Location ID（UUID）"
                className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-600"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/webp"
                className="mt-3 w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border file:border-zinc-700 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-zinc-200 hover:file:bg-zinc-700"
                disabled={r2UploadLoading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleR2UploadTest(file);
                }}
              />

              {r2UploadLoading && <p className="mt-3 text-xs text-emerald-300">R2へアップロード中...</p>}

              {r2UploadResult && (
                <div className="mt-3 rounded-lg border border-emerald-900/60 bg-emerald-950/30 p-3 text-xs leading-5 text-emerald-200">
                  <p>アップロード: {r2UploadResult.uploaded ? 'OK' : 'NG'}</p>
                  <p>ユーザーID: {r2UploadResult.userId ?? '-'}</p>
                  <p>Location ID: {r2UploadResult.locationId ?? '-'}</p>
                  <p>保存先: {r2UploadResult.storagePath ?? '-'}</p>
                </div>
              )}

              {r2UploadError && (
                <div className="mt-3 rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-xs leading-5 text-red-200">
                  {r2UploadError}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-zinc-800 px-5 py-3">
          <button
            onClick={() => {
              playCancelSound();
              onClose();
            }}
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 active:scale-95 transition-all"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}