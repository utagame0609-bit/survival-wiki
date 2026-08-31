/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HernanArticleData, ArticlePhoto } from '../types';
import { HernanFigure } from './HernanFigure';

interface HernanInfoboxProps {
  data: HernanArticleData;
  onOpenLightbox?: (photo: ArticlePhoto) => void;
  className?: string;
}

export const HernanInfobox: React.FC<HernanInfoboxProps> = ({
  data,
  onOpenLightbox,
  className = ''
}) => {
  // Check if we have ANY valid data for the infobox
  const hasCoordinates = data.coordinates !== undefined;
  const hasCompanions = Boolean(data.companions && data.companions.length > 0);
  const hasLocation = Boolean(data.locationName && data.locationName.trim().length > 0);
  const hasTimestamp = Boolean(data.timestamp && data.timestamp.trim().length > 0);
  const hasPhoto = Boolean(data.photos && data.photos.length > 0);
  const hasClassification = Boolean(data.subtitle && data.subtitle.trim().length > 0);

  // If there are literally no items to display, return null (never render an empty table)
  if (!hasCoordinates && !hasCompanions && !hasLocation && !hasTimestamp && !hasPhoto && !hasClassification) {
    return null;
  }

  const primaryPhoto = hasPhoto ? data.photos[0] : null;

  return (
    <aside
      id="hernan-infobox"
      aria-label="基本情報表"
      className={`bg-[#f8f9fa] border border-[#eaecf0] text-neutral-800 rounded-xs p-1.5 sm:p-2.5 mb-6 text-[13px] leading-snug font-sans ${className}`}
    >
      {/* Header Banner */}
      <div className="bg-[#eaecf0] text-neutral-900 font-serif font-bold text-center py-1 px-2 mb-1.5 rounded-2xs text-[13px] tracking-tight">
        {data.title}
      </div>

      {/* Primary Photo if present */}
      {primaryPhoto && (
        <div className="mb-2">
          <HernanFigure
            photo={primaryPhoto}
            onOpenLightbox={onOpenLightbox}
            variant="infobox-media"
          />
        </div>
      )}

      {/* Key-Value Table */}
      <table className="w-full border-collapse text-[12px] sm:text-[12.5px]">
        <tbody>
          {hasClassification && (
            <tr className="border-b border-[#eaecf0]">
              <th scope="row" className="w-[32%] py-1.5 px-2 font-medium text-neutral-600 bg-[#f0f2f5] text-left align-top">
                学術分類
              </th>
              <td className="py-1.5 px-2 text-neutral-800 align-top">
                {data.subtitle}
              </td>
            </tr>
          )}

          {hasLocation && (
            <tr className="border-b border-[#eaecf0]">
              <th scope="row" className="w-[32%] py-1.5 px-2 font-medium text-neutral-600 bg-[#f0f2f5] text-left align-top">
                観測地点
              </th>
              <td className="py-1.5 px-2 text-neutral-800 font-medium align-top">
                {data.locationName}
              </td>
            </tr>
          )}

          {hasCoordinates && data.coordinates && (
            <tr className="border-b border-[#eaecf0]">
              <th scope="row" className="w-[32%] py-1.5 px-2 font-medium text-neutral-600 bg-[#f0f2f5] text-left align-top">
                空間座標
              </th>
              <td className="py-1.5 px-2 text-neutral-700 font-mono text-[11.5px] align-top">
                X: {data.coordinates.x.toFixed(2)}, Y: {data.coordinates.y.toFixed(2)}, Z: {data.coordinates.z.toFixed(2)}
              </td>
            </tr>
          )}

          {hasTimestamp && (
            <tr className="border-b border-[#eaecf0]">
              <th scope="row" className="w-[32%] py-1.5 px-2 font-medium text-neutral-600 bg-[#f0f2f5] text-left align-top">
                観測日時
              </th>
              <td className="py-1.5 px-2 text-neutral-700 font-mono text-[11.5px] align-top">
                {data.timestamp}
              </td>
            </tr>
          )}

          {hasCompanions && data.companions && (
            <tr className="border-b border-[#eaecf0]">
              <th scope="row" className="w-[32%] py-1.5 px-2 font-medium text-neutral-600 bg-[#f0f2f5] text-left align-top">
                同行記録者
              </th>
              <td className="py-1.5 px-2 text-neutral-800 align-top">
                {data.companions.join('、')}
              </td>
            </tr>
          )}

          {data.lastEditedDate && (
            <tr>
              <th scope="row" className="w-[32%] py-1.5 px-2 font-medium text-neutral-600 bg-[#f0f2f5] text-left align-top">
                編纂改訂
              </th>
              <td className="py-1.5 px-2 text-neutral-600 font-mono text-[11px] align-top">
                {data.lastEditedDate}（第{data.revisionNumber || 1}版）
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </aside>
  );
};
