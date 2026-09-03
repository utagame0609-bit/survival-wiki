/**
 * Survival Wiki - 16-bit Retro Console (SFC Style) Light Theme Edition
 * Based on Survival Wiki Piping Architecture & Non-Destructive Theme System
 */

import React, { useState } from 'react';
import { Screen, Tab, World, RecordItem, WikiCompilerStyle, WikiScope, WikiArticle, AppSettings } from './types';
import { MOCK_WORLDS, MOCK_RECORDS, MOCK_COMPILERS, MOCK_ARTICLES } from './data/mockData';
import { Header } from './components/common/Header';
import { MobileBottomHud } from './components/common/MobileBottomHud';
import { WorldListScreen } from './components/world/WorldListScreen';
import { WorldHeader } from './components/world/WorldHeader';
import { WorldTabs } from './components/world/WorldTabs';
import { RecordsScreen } from './components/records/RecordsScreen';
import { WikiCompilerScreen } from './components/wiki/WikiCompilerScreen';
import { WikiArticleModal } from './components/wiki/WikiArticleModal';
import { WorldCreateModal } from './components/modals/WorldCreateModal';
import { WorldDeleteConfirmModal } from './components/modals/WorldDeleteConfirmModal';
import { LocationFormModal } from './components/modals/LocationFormModal';
import { LocationDetailModal } from './components/modals/LocationDetailModal';
import { ChestModal } from './components/modals/ChestModal';
import { SnsShareModal } from './components/modals/SnsShareModal';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  // Navigation State (Piping Map standard)
  const [currentScreen, setCurrentScreen] = useState<Screen>({
    name: 'worldList',
    gameId: 'survival-01',
    gameName: 'SURVIVAL FRONTIER 16-BIT',
  });

  const [activeTab, setActiveTab] = useState<Tab>('records');
  const [historyStack, setHistoryStack] = useState<Screen[]>([]);

  // Data Store (State representation)
  const [worlds, setWorlds] = useState<World[]>(MOCK_WORLDS);
  const [records, setRecords] = useState<RecordItem[]>(MOCK_RECORDS);
  const [savedArticles, setSavedArticles] = useState<Record<string, WikiArticle>>(MOCK_ARTICLES);

  // App Settings
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    bgmVolume: 75,
    seVolume: 85,
    crtScanlines: true,
    hapticFeedback: true,
    theme: 'sfc',
  });

  // Modal States
  const [isWorldCreateOpen, setIsWorldCreateOpen] = useState(false);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [deletingWorld, setDeletingWorld] = useState<World | null>(null);

  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordItem | null>(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<RecordItem | null>(null);

  const [isChestOpen, setIsChestOpen] = useState(false);
  const [shareRecord, setShareRecord] = useState<RecordItem | null>(null);
  const [activeArticleModal, setActiveArticleModal] = useState<WikiArticle | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

  // Current active world (if inside World screen)
  const activeWorld = currentScreen.name === 'world'
    ? worlds.find((w) => w.id === currentScreen.worldId) || worlds[0]
    : null;

  // Filter records for active world
  const currentWorldRecords = activeWorld
    ? records.filter((r) => r.world_id === activeWorld.id)
    : [];

  // Navigation Handlers (Conforming to Piping Map Section 5)
  const navigateTo = (newScreen: Screen) => {
    setHistoryStack((prev) => [...prev, currentScreen]);
    setCurrentScreen(newScreen);
    if (newScreen.name === 'world' && newScreen.initialTab) {
      setActiveTab(newScreen.initialTab);
    }
  };

  const handleBack = () => {
    // If active article modal is open, close it first
    if (activeArticleModal) {
      setActiveArticleModal(null);
      return;
    }

    // Inside world: if in Wiki tab, return to Records tab
    if (currentScreen.name === 'world' && activeTab === 'wiki') {
      setActiveTab('records');
      return;
    }

    // Otherwise, step back in screen history or go to World List
    if (historyStack.length > 0) {
      const prevScreen = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, -1));
      setCurrentScreen(prevScreen);
    } else if (currentScreen.name === 'world') {
      setCurrentScreen({
        name: 'worldList',
        gameId: 'survival-01',
        gameName: 'SURVIVAL FRONTIER 16-BIT',
      });
    }
  };

  const handleHome = () => {
    setHistoryStack([]);
    setCurrentScreen({
      name: 'worldList',
      gameId: 'survival-01',
      gameName: 'SURVIVAL FRONTIER 16-BIT',
    });
  };

  // World Actions
  const handleLoadWorld = (world: World) => {
    navigateTo({
      name: 'world',
      gameId: world.game_id,
      worldId: world.id,
      worldName: world.name,
      initialTab: 'records',
    });
  };

  const handleSaveWorld = (worldData: Partial<World>) => {
    if (editingWorld) {
      setWorlds((prev) =>
        prev.map((w) => (w.id === editingWorld.id ? { ...w, ...worldData, updated_at: '2026/08/30' } : w))
      );
      setEditingWorld(null);
    } else {
      const newWorld: World = {
        id: `world-${Date.now()}`,
        game_id: 'survival-01',
        slotNumber: worlds.length + 1,
        name: worldData.name || '新規ワールド',
        player: worldData.player || 'COMMANDER',
        playerPhotoUrl: worldData.playerPhotoUrl,
        memo: worldData.memo || '',
        created_at: '2026/08/30',
        daysCount: 1,
        recordsCount: 0,
        lastRecordDate: '2026/08/30 12:00',
        members: worldData.members || [],
      };
      setWorlds((prev) => [...prev, newWorld]);
    }
  };

  const handleConfirmDeleteWorld = () => {
    if (!deletingWorld) return;
    setWorlds((prev) => prev.filter((w) => w.id !== deletingWorld.id));
    if (currentScreen.name === 'world' && currentScreen.worldId === deletingWorld.id) {
      handleHome();
    }
    setDeletingWorld(null);
  };

  // Record Actions
  const handleSaveRecord = (recordData: Partial<RecordItem>) => {
    if (!activeWorld) return;

    if (editingRecord) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? { ...r, ...recordData } as RecordItem : r))
      );
      setEditingRecord(null);
    } else {
      const newRecord: RecordItem = {
        id: `rec-${Date.now()}`,
        world_id: activeWorld.id,
        name: recordData.name || '拠点探査記録',
        x: recordData.x,
        y: recordData.y,
        z: recordData.z,
        has_coordinates: !!recordData.has_coordinates,
        detail_memo: recordData.detail_memo || '',
        date: recordData.date || '2026/08/30',
        time: recordData.time || '15:30',
        category: recordData.category || 'base',
        members: recordData.members || [],
        photos: (recordData.photos as any) || [],
        created_at: new Date().toISOString(),
      };
      setRecords((prev) => [newRecord, ...prev]);

      // Update world records count
      setWorlds((prev) =>
        prev.map((w) =>
          w.id === activeWorld.id
            ? {
                ...w,
                recordsCount: w.recordsCount + 1,
                lastRecordDate: `${newRecord.date} ${newRecord.time}`,
              }
            : w
        )
      );
    }
  };

  const handleDeleteRecord = (record: RecordItem) => {
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
    if (selectedRecordDetail?.id === record.id) {
      setSelectedRecordDetail(null);
    }
    if (activeWorld) {
      setWorlds((prev) =>
        prev.map((w) =>
          w.id === activeWorld.id ? { ...w, recordsCount: Math.max(0, w.recordsCount - 1) } : w
        )
      );
    }
  };

  // Wiki Compilation Generator Trigger
  const handleGenerateWikiArticle = (
    style: WikiCompilerStyle,
    scope: WikiScope,
    periodLabel: string
  ) => {
    if (!activeWorld) return;
    setIsGeneratingArticle(true);

    setTimeout(() => {
      const compiler = MOCK_COMPILERS.find((c) => c.id === style) || MOCK_COMPILERS[0];
      const key = `${activeWorld.id}-${style}-${scope}`;

      const generatedArticle: WikiArticle = {
        id: `art-${Date.now()}`,
        world_id: activeWorld.id,
        compiler_style: style,
        compiler_name: compiler.name,
        scope,
        period_label: periodLabel,
        title:
          style === 'wikipedia'
            ? `${activeWorld.name} 開拓史・地理体系査定書`
            : style === 'scp'
            ? `事象記録ログ: AREA-${activeWorld.slotNumber}「${activeWorld.name}」異常監査報告`
            : `荒野の叙事詩 〜${activeWorld.player}と開拓隊が刻んだ不滅の記憶〜`,
        subtitle:
          style === 'wikipedia'
            ? `${periodLabel}における全${currentWorldRecords.length}件の測位記録および生存戦略の総括`
            : style === 'scp'
            ? `脅威度査定: EUCLID / 収容プロトコル・オメガ施行確認済み`
            : `血と汗と勇気で紡がれた、大地に捧げるサバイバル讃歌`,
        lead_text:
          style === 'wikipedia'
            ? `本稿は指揮官${activeWorld.player}によって主導された開拓活動を体系的に記録し、現地の自然環境、採掘鉱脈、および防衛線の構築経過を学術的に報告する。`
            : style === 'scp'
            ? `【機密指定】AREA-${activeWorld.slotNumber}において生存者部隊が遭遇した各種生体活動、および構造物構築事象に関する監査結果を機密文書として分類保存する。`
            : `荒れ狂う風が吹き抜けるこの大地で、${activeWorld.player}たちは武器を手に立ち上がった。彼らが遺した軌跡は永遠の伝説となるだろう！`,
        sections: [
          {
            heading: '第1項：主要防衛拠点および補給線の確立',
            body: `期間中、計${currentWorldRecords.length}箇所の重要地点が確保された。北東部における高低差を活かした監視網の構築により、夜間防衛成功率は著しく向上している。`,
            quote: '「我々の足跡は、決して地図から消え去ることはない」',
          },
          {
            heading: '第2項：重要鉱物採取と原生生物との遭遇事象',
            body: `資源採掘ラインの延伸に伴い、深層坑道および危険地帯への探査が遂行された。防具の損壊トラブルを乗り越え、越冬用資材の充足が完了した。`,
          },
        ],
        verdict_or_classification:
          style === 'wikipedia'
            ? '【査定評価: Sランク完了】'
            : style === 'scp'
            ? '【特別収容ステータス: 安定維持】'
            : '【魂の伝説度: ★★★★★】',
        generated_at: new Date().toLocaleString('ja-JP'),
      };

      setSavedArticles((prev) => ({
        ...prev,
        [key]: generatedArticle,
      }));

      setIsGeneratingArticle(false);
      setActiveArticleModal(generatedArticle);
    }, 1200);
  };

  const canGoBack = currentScreen.name === 'world' || historyStack.length > 0;

  return (
    <div
      data-theme={settings.theme}
      className={`min-h-screen flex flex-col bg-[var(--app-bg)] text-[var(--text-main)] transition-colors duration-200 ${
        settings.crtScanlines ? 'sfc-scanlines' : ''
      }`}
    >
      {/* Global SFC App Header */}
      <Header
        currentScreen={currentScreen}
        onBack={handleBack}
        onHome={handleHome}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onToggleTheme={() =>
          setSettings((s) => ({ ...s, theme: s.theme === 'sfc' ? 'fc_dark' : 'sfc' }))
        }
        canGoBack={canGoBack}
      />

      {/* Main Container */}
      <main className="flex-1 pb-24 sm:pb-12">
        {currentScreen.name === 'worldList' ? (
          /* SCREEN 1: World List (冒険の書一覧) */
          <WorldListScreen
            gameName={currentScreen.gameName}
            worlds={worlds}
            onLoadWorld={handleLoadWorld}
            onCreateWorld={() => {
              setEditingWorld(null);
              setIsWorldCreateOpen(true);
            }}
            onEditWorld={(world) => {
              setEditingWorld(world);
              setIsWorldCreateOpen(true);
            }}
            onDeleteWorld={(world) => {
              setDeletingWorld(world);
            }}
          />
        ) : (
          /* SCREEN 2: World Shell (WorldHeader + Tabs + Records/Wiki) */
          activeWorld && (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
              {/* World Status HUD Header */}
              <WorldHeader
                world={activeWorld}
                onEditWorld={() => {
                  setEditingWorld(activeWorld);
                  setIsWorldCreateOpen(true);
                }}
              />

              {/* Desktop Tabs */}
              <WorldTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                recordsCount={currentWorldRecords.length}
              />

              {/* Tab 1: Records (冒険の記録 / Timeline) */}
              {activeTab === 'records' && (
                <RecordsScreen
                  records={currentWorldRecords}
                  onAddRecord={() => {
                    setEditingRecord(null);
                    setIsLocationFormOpen(true);
                  }}
                  onSelectRecord={(record) => {
                    setSelectedRecordDetail(record);
                  }}
                  onEditRecord={(record) => {
                    setEditingRecord(record);
                    setIsLocationFormOpen(true);
                  }}
                  onDeleteRecord={handleDeleteRecord}
                  onOpenChest={() => setIsChestOpen(true)}
                  onShareSns={(record) => setShareRecord(record)}
                />
              )}

              {/* Tab 2: Wiki (旅の書 / AI Wiki Compiler) */}
              {activeTab === 'wiki' && (
                <WikiCompilerScreen
                  world={activeWorld}
                  compilers={MOCK_COMPILERS}
                  savedArticles={savedArticles}
                  onGenerateArticle={handleGenerateWikiArticle}
                  onReadArticle={(article) => setActiveArticleModal(article)}
                  isGenerating={isGeneratingArticle}
                />
              )}
            </div>
          )
        )}
      </main>

      {/* Mobile Gamepad-Style Bottom HUD */}
      <MobileBottomHud
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onBack={handleBack}
        onHome={handleHome}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        soundEnabled={settings.soundEnabled}
        canGoBack={canGoBack}
        isWorldScreen={currentScreen.name === 'world'}
      />

      {/* GLOBAL MODALS */}
      {/* 1. World Create/Edit Modal */}
      <WorldCreateModal
        isOpen={isWorldCreateOpen}
        onClose={() => {
          setIsWorldCreateOpen(false);
          setEditingWorld(null);
        }}
        onSave={handleSaveWorld}
        editWorld={editingWorld}
      />

      {/* 2. World Delete Confirm Modal */}
      <WorldDeleteConfirmModal
        isOpen={!!deletingWorld}
        world={deletingWorld}
        onClose={() => setDeletingWorld(null)}
        onConfirm={handleConfirmDeleteWorld}
      />

      {/* 3. Location / Record Form Modal */}
      <LocationFormModal
        isOpen={isLocationFormOpen}
        onClose={() => {
          setIsLocationFormOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        editRecord={editingRecord}
        worldMembers={activeWorld?.members || []}
      />

      {/* 4. Location Detail Modal */}
      <LocationDetailModal
        record={selectedRecordDetail}
        onClose={() => setSelectedRecordDetail(null)}
        onEdit={(rec) => {
          setSelectedRecordDetail(null);
          setEditingRecord(rec);
          setIsLocationFormOpen(true);
        }}
        onDelete={(rec) => {
          handleDeleteRecord(rec);
          setSelectedRecordDetail(null);
        }}
        onShareSns={(rec) => {
          setShareRecord(rec);
        }}
      />

      {/* 5. Chest (Photo Gallery) Modal */}
      <ChestModal
        isOpen={isChestOpen}
        onClose={() => setIsChestOpen(false)}
        records={currentWorldRecords}
        onSelectRecord={(rec) => {
          setIsChestOpen(false);
          setSelectedRecordDetail(rec);
        }}
      />

      {/* 6. SNS Share Modal */}
      <SnsShareModal
        isOpen={!!shareRecord}
        onClose={() => setShareRecord(null)}
        record={shareRecord}
        world={activeWorld}
      />

      {/* 7. Wiki Article Reader Modal */}
      <WikiArticleModal
        article={activeArticleModal}
        onClose={() => setActiveArticleModal(null)}
      />

      {/* 8. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
      />
    </div>
  );
}
