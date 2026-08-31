/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  HernanArticleData,
  ArticlePhoto,
  ViewportMode,
  PhotoCountVariant,
  MetadataVariant,
  InfoboxPositionMode,
  MobileTocMode
} from './types';
import {
  PRIMARY_ARTICLE_5_PHOTOS,
  ARTICLE_3_PHOTOS,
  ARTICLE_1_PHOTO,
  ARTICLE_0_PHOTO,
  ARTICLE_LONG_METADATA
} from './data/dummyArticles';
import { SurvivalWikiOuterHUD } from './components/SurvivalWikiOuterHUD';
import { HernanArticleBody } from './components/HernanArticleBody';
import { HernanImageViewer } from './components/HernanImageViewer';
import { PreviewDevToolbar } from './components/PreviewDevToolbar';

export default function App() {
  // State for interactive testbench
  const [selectedArticleKey, setSelectedArticleKey] = useState<string>('article-1');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('responsive');
  const [photoVariant, setPhotoVariant] = useState<PhotoCountVariant>('5_photos');
  const [metadataVariant, setMetadataVariant] = useState<MetadataVariant>('all_present');
  const [infoboxMode, setInfoboxMode] = useState<InfoboxPositionMode>('infobox_right');
  const [mobileTocMode, setMobileTocMode] = useState<MobileTocMode>('inline_accordion');
  const [isPreviewToolbarOpen, setIsPreviewToolbarOpen] = useState<boolean>(true);

  // Lightbox Modal state
  const [lightboxPhoto, setLightboxPhoto] = useState<ArticlePhoto | null>(null);

  // Derive base article from selected key
  const baseArticle: HernanArticleData = useMemo(() => {
    switch (selectedArticleKey) {
      case 'article-2':
        return ARTICLE_3_PHOTOS;
      case 'article-long':
        return ARTICLE_LONG_METADATA;
      case 'article-1':
      default:
        return PRIMARY_ARTICLE_5_PHOTOS;
    }
  }, [selectedArticleKey]);

  // Apply Photo Count & Metadata variants dynamically
  const activeArticle: HernanArticleData = useMemo(() => {
    const cloned: HernanArticleData = { ...baseArticle };

    // 1. Photo Variant
    switch (photoVariant) {
      case '0_photos':
        cloned.photos = [];
        break;
      case '1_photo':
        cloned.photos = baseArticle.photos.slice(0, 1);
        break;
      case '3_photos':
        cloned.photos = baseArticle.photos.slice(0, 3);
        break;
      case '5_photos':
      default:
        cloned.photos = PRIMARY_ARTICLE_5_PHOTOS.photos;
        break;
    }

    // 2. Metadata Variant
    switch (metadataVariant) {
      case 'no_coords':
        delete cloned.coordinates;
        break;
      case 'explicit_zero_coords':
        cloned.coordinates = { x: 0, y: 0, z: 0 };
        break;
      case 'no_companions':
        delete cloned.companions;
        break;
      case 'no_timestamp':
        delete cloned.timestamp;
        break;
      case 'all_minimal':
        delete cloned.coordinates;
        delete cloned.companions;
        delete cloned.timestamp;
        delete cloned.locationName;
        delete cloned.memo;
        break;
      case 'all_present':
      default:
        // Use base metadata
        break;
    }

    return cloned;
  }, [baseArticle, photoVariant, metadataVariant]);

  // Helper to handle viewport simulation frame style
  const getViewportContainerStyle = () => {
    switch (viewportMode) {
      case 'desktop-1440':
        return 'w-[1440px] max-w-[1440px] mx-auto shadow-2xl border-x border-zinc-800 my-4 bg-white transition-all';
      case 'pc-1280':
        return 'w-[1280px] max-w-[1280px] mx-auto shadow-2xl border-x border-zinc-800 my-4 bg-white transition-all';
      case 'tablet-1024':
        return 'w-[1024px] max-w-[1024px] mx-auto shadow-2xl border-x border-zinc-800 my-4 bg-white transition-all';
      case 'mobile-390':
        return 'w-[390px] max-w-[390px] mx-auto shadow-2xl border-x border-zinc-800 my-4 bg-white min-h-[844px] transition-all';
      case 'narrow-320':
        return 'w-[320px] max-w-[320px] mx-auto shadow-2xl border-x border-zinc-800 my-4 bg-white min-h-[568px] transition-all';
      case 'responsive':
      default:
        return 'w-full transition-all';
    }
  };

  return (
    <SurvivalWikiOuterHUD
      articleTitle={activeArticle.title}
      onResetArticle={() => {
        setSelectedArticleKey('article-1');
        setPhotoVariant('5_photos');
        setMetadataVariant('all_present');
        setViewportMode('responsive');
      }}
      onOpenPreviewToolbar={() => setIsPreviewToolbarOpen(!isPreviewToolbarOpen)}
      isPreviewToolbarOpen={isPreviewToolbarOpen}
    >
      {/* Viewport Frame Container (supports direct 320px / 390px / 1024px / 1280px / 1440px simulation) */}
      <div className={getViewportContainerStyle()}>
        {viewportMode !== 'responsive' && (
          <div className="bg-zinc-800 text-zinc-300 text-[11px] font-mono py-1 px-3 flex items-center justify-between border-b border-zinc-700">
            <span>シミュレーター幅: {viewportMode.replace('-', ' ').toUpperCase()}</span>
            <button
              type="button"
              onClick={() => setViewportMode('responsive')}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              100% 自由幅に戻す
            </button>
          </div>
        )}

        <HernanArticleBody
          data={activeArticle}
          onOpenLightbox={(photo) => setLightboxPhoto(photo)}
          infoboxMode={infoboxMode}
          mobileTocMode={mobileTocMode}
        />
      </div>

      {/* Lightbox Photo Viewer Modal */}
      <HernanImageViewer
        photos={activeArticle.photos}
        selectedPhoto={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onSelectPhoto={(photo) => setLightboxPhoto(photo)}
      />

      {/* Interactive Reviewer Toolkit / Switcher */}
      <PreviewDevToolbar
        viewportMode={viewportMode}
        onSelectViewport={setViewportMode}
        photoVariant={photoVariant}
        onSelectPhotoVariant={setPhotoVariant}
        metadataVariant={metadataVariant}
        onSelectMetadataVariant={setMetadataVariant}
        infoboxMode={infoboxMode}
        onSelectInfoboxMode={setInfoboxMode}
        mobileTocMode={mobileTocMode}
        onSelectMobileTocMode={setMobileTocMode}
        selectedArticleKey={selectedArticleKey}
        onSelectArticleKey={setSelectedArticleKey}
        isOpen={isPreviewToolbarOpen}
        onClose={() => setIsPreviewToolbarOpen(false)}
      />
    </SurvivalWikiOuterHUD>
  );
}
