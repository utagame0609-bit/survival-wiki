import { useEffect, useState } from 'react';
import { Calendar, Clock, Edit3, Play, Plus, Search, Sparkles, Trash2, Users } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import type { WorldMeta } from '@/lib/worldMeta';
import { useWorldCardPhotos } from '@/hooks/useWorldCardPhotos';
import { SfcDPad } from '@/components/sfc/SfcDPad';

type SfcWorldListProps = {
  gameName: string;
  worlds: WorldWithMembers[];
  worldMeta: Record<string, WorldMeta>;
  onLoadWorld: (world: WorldWithMembers) => void;
  onCreateWorld: () => void;
  onEditWorld: (world: WorldWithMembers) => void;
  onDeleteWorld: (world: WorldWithMembers) => void;
};

export function SfcWorldList({
  gameName,
  worlds,
  worldMeta,
  onLoadWorld,
  onCreateWorld,
  onEditWorld,
  onDeleteWorld,
}: SfcWorldListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(worlds[0]?.id ?? null);

  useEffect(() => {
    if (selectedSlot && worlds.some((world) => world.id === selectedSlot)) return;
    setSelectedSlot(worlds[0]?.id ?? null);
  }, [selectedSlot, worlds]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredWorlds = worlds.filter((world) => {
    if (!normalizedQuery) return true;
    return (
      world.name.toLowerCase().includes(normalizedQuery) ||
      (world.player ?? '').toLowerCase().includes(normalizedQuery) ||
      (world.memo ?? '').toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-4 sm:px-6 sm:py-6">
      <div className="sfc-panel flex flex-col items-start justify-between gap-4 p-4 sm:p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-[var(--border-main)] bg-[var(--surface-recessed)] shadow-inner">
            <span className="font-dot text-lg font-bold text-[var(--accent-blue)]">ROM</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[var(--accent-blue)] px-2 py-0.5 font-dot text-[10px] font-bold text-white">
                ACTIVE TITLE
              </span>
              <span className="font-dot text-xs font-bold text-[var(--text-muted)]">
                16-BIT MEMORY CARD
              </span>
            </div>
            <h2 className="font-sfc-title mt-0.5 text-base font-bold text-[var(--text-main)] sm:text-xl">
              {gameName}
            </h2>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="冒険の書を検索..."
              className="w-full rounded border-2 border-[var(--border-main)] bg-[var(--surface-recessed)] py-1.5 pl-8 pr-3 font-dot text-xs text-[var(--text-main)] shadow-inner focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onCreateWorld}
            className="sfc-btn sfc-btn-convex sfc-btn-b flex w-full items-center justify-center gap-2 px-4 py-2 font-dot text-xs shadow-md sm:w-auto sm:text-sm"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">B</span>
            <Plus className="h-4 w-4" />
            <span>新規ワールド作成 (NEW SLOT)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-black bg-[var(--accent-green)]" />
              <h3 className="font-dot text-sm font-bold tracking-wider text-[var(--text-main)]">
                冒険の書スロット選択 (SELECT SAVE CARTRIDGE)
              </h3>
            </div>
            <span className="font-dot text-xs text-[var(--text-muted)]">
              SLOTS: {filteredWorlds.length} / 10
            </span>
          </div>

          {filteredWorlds.length === 0 ? (
            <div className="sfc-panel space-y-3 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[var(--border-main)] bg-[var(--surface-recessed)]">
                <Sparkles className="h-6 w-6 text-[var(--text-muted)]" />
              </div>
              <p className="font-dot text-sm font-bold text-[var(--text-main)]">
                該当する冒険の書（セーブデータ）が見つかりません
              </p>
              <button
                type="button"
                onClick={onCreateWorld}
                className="sfc-btn sfc-btn-convex sfc-btn-b px-4 py-1.5 font-dot text-xs"
              >
                新しいスロットを作成
              </button>
            </div>
          ) : (
            filteredWorlds.map((world) => {
              const slotNumber = worlds.findIndex((item) => item.id === world.id) + 1;
              return (
                <SfcWorldSlot
                  key={world.id}
                  world={world}
                  meta={worldMeta[world.id]}
                  slotNumber={slotNumber}
                  selected={selectedSlot === world.id}
                  onSelect={() => setSelectedSlot(world.id)}
                  onLoad={() => onLoadWorld(world)}
                  onEdit={() => onEditWorld(world)}
                  onDelete={() => onDeleteWorld(world)}
                />
              );
            })
          )}
        </div>

        <div className="sticky top-20 hidden space-y-4 lg:col-span-4 lg:block">
          <div className="sfc-panel space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-2">
              <span className="font-dot text-xs font-bold text-[var(--text-main)]">CONTROLLER HUD</span>
              <div className="flex items-center gap-1">
                <span className="sfc-led-green h-2 w-2 rounded-full" />
                <span className="font-dot text-[10px] text-[var(--text-muted)]">READY</span>
              </div>
            </div>

            <div className="flex items-center justify-center py-2">
              <SfcDPad size="md" />
            </div>

            <div className="space-y-2 border-t border-[var(--border-main)] pt-2 font-dot text-xs">
              <ControllerGuide button="X" tone="blue" label="LOAD WORLD" detail="決定 / 突入" />
              <ControllerGuide button="Y" tone="yellow" label="EDIT / SEARCH" detail="情報変更" />
              <ControllerGuide button="B" tone="green" label="NEW SLOT" detail="新規作成" />
              <ControllerGuide button="A" tone="red" label="DELETE SLOT" detail="消去 / 警告" />
            </div>

            <div className="rounded border border-[var(--border-main)] bg-[var(--surface-label)] p-2.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
              💡 <strong>HINT:</strong> 冒険の書（ワールド）をLOADすると、タイムライン記録の蓄積や3人の編纂官によるAI Wiki生成機能が解放されます。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SfcWorldSlot({
  world,
  meta,
  slotNumber,
  selected,
  onSelect,
  onLoad,
  onEdit,
  onDelete,
}: {
  world: WorldWithMembers;
  meta?: WorldMeta;
  slotNumber: number;
  selected: boolean;
  onSelect: () => void;
  onLoad: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { playerPhotoUrl } = useWorldCardPhotos(world);
  const playerName = world.player?.trim() || '開拓者';
  const createdDate = new Date(world.created_at).toLocaleDateString('ja-JP');
  const lastRecordDate = meta?.lastLocationDate
    ? new Date(meta.lastLocationDate).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '---';

  return (
    <div
      onClick={onSelect}
      className={`sfc-cartridge cursor-pointer transition-all duration-150 ${
        selected ? 'scale-[1.01] ring-2 ring-[var(--accent-blue)]' : 'hover:scale-[1.005]'
      }`}
    >
      <div className="sfc-cartridge-grooves h-4 w-full rounded-t-[10px] border-b border-[var(--border-main)] opacity-70" />

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--border-groove)] pb-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded border border-white/30 bg-[var(--border-dark)] px-2.5 py-1 font-dot text-xs font-bold text-white shadow">
              SLOT {String(slotNumber).padStart(2, '0')}
            </div>
            <h4 className="truncate font-dot text-base font-bold text-[var(--text-main)] sm:text-lg">
              {world.name}
            </h4>
          </div>

          <div className="flex items-center gap-3 font-dot text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {createdDate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
          <div className="flex items-center gap-3 text-center sm:col-span-3 sm:flex-col sm:items-center">
            <div className="relative h-14 w-14 overflow-hidden rounded-lg border-2 border-[var(--border-dark)] bg-black shadow-[inset_1px_1px_2px_rgba(0,0,0,0.6)]">
              {playerPhotoUrl ? (
                <img src={playerPhotoUrl} alt={playerName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 font-dot text-xs text-white">
                  {playerName.slice(0, 2)}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center font-dot text-[9px] text-white">
                LEADER
              </div>
            </div>
            <div className="text-left sm:text-center">
              <span className="block font-dot text-xs font-bold text-[var(--text-main)]">{playerName}</span>
              <span className="font-dot text-[10px] text-[var(--text-muted)]">
                生存日数: {meta?.dayCount ?? 0} DAYS
              </span>
            </div>
          </div>

          <div className="space-y-2.5 sm:col-span-9">
            <p className="line-clamp-2 rounded border border-[var(--border-main)] bg-[var(--surface-label)] p-2.5 text-xs leading-relaxed text-[var(--text-main)] shadow-inner">
              {world.memo || '（ワールドメモ未設定）'}
            </p>

            {world.members.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 font-dot text-[10px] text-[var(--text-muted)]">
                  <Users className="h-3 w-3" />
                  同行者:
                </span>
                {world.members.map((member) => (
                  <span
                    key={member.id}
                    className="rounded border border-[var(--border-main)] bg-[var(--surface-2)] px-2 py-0.5 font-dot text-[10px] text-[var(--text-main)]"
                  >
                    {member.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="font-dot text-[10px] text-[var(--text-muted)]">同行者: 単独サバイバル</span>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-[var(--border-groove)] pt-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-dot text-xs">
            <span className="rounded border border-[var(--border-main)] bg-[var(--surface-recessed)] px-2 py-0.5 text-[var(--text-main)]">
              RECORDS: <strong className="text-[var(--accent-blue)]">{meta?.recordCount ?? 0}</strong>
            </span>
            <span className="hidden items-center gap-1 rounded border border-[var(--border-main)] bg-[var(--surface-recessed)] px-2 py-0.5 text-[var(--text-muted)] xs:inline-flex">
              <Clock className="h-3 w-3" />
              最終: {lastRecordDate}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className="sfc-btn sfc-btn-convex sfc-btn-y flex items-center gap-1 px-2.5 py-1.5 font-dot text-xs"
              title="スロット編集 (Y: EDIT)"
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black/10 text-[9px] font-bold">Y</span>
              <Edit3 className="h-3 w-3" />
              <span className="hidden sm:inline">編集</span>
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className="sfc-btn sfc-btn-convex sfc-btn-a flex items-center gap-1 px-2.5 py-1.5 font-dot text-xs"
              title="スロット削除 (A: DELETE)"
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">A</span>
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">削除</span>
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onLoad();
              }}
              className="sfc-btn sfc-btn-convex sfc-btn-x flex items-center gap-1.5 px-4 py-1.5 font-dot text-xs shadow-md sm:text-sm"
              title="冒険の書をロード (X: LOAD)"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">X</span>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span className="font-bold">LOAD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControllerGuide({
  button,
  tone,
  label,
  detail,
}: {
  button: 'X' | 'Y' | 'B' | 'A';
  tone: 'blue' | 'yellow' | 'green' | 'red';
  label: string;
  detail: string;
}) {
  const toneClass = {
    blue: 'bg-[var(--accent-blue)] text-white',
    yellow: 'bg-[var(--accent-yellow)] text-black',
    green: 'bg-[var(--accent-green)] text-white',
    red: 'bg-[var(--accent-red)] text-white',
  }[tone];

  return (
    <div className="flex items-center justify-between rounded bg-[var(--surface-recessed)] p-1.5">
      <div className="flex items-center gap-2">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${toneClass}`}>
          {button}
        </span>
        <span className="font-bold text-[var(--text-main)]">{label}</span>
      </div>
      <span className="text-[10px] text-[var(--text-muted)]">{detail}</span>
    </div>
  );
}
