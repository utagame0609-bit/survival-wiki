/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TocItem } from '../types';

export interface ParsedSection {
  id: string;
  title: string;
  level: 2 | 3;
  numberPrefix: string;
  contentLines: string[];
}

export function parseMarkdownToTocAndSections(markdown: string): {
  toc: TocItem[];
  sections: ParsedSection[];
} {
  const lines = markdown.split('\n');
  const toc: TocItem[] = [];
  const sections: ParsedSection[] = [];

  let currentH2Index = 0;
  let currentH3Index = 0;
  let currentSection: ParsedSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      currentH2Index++;
      currentH3Index = 0;
      const title = line.replace(/^##\s+/, '').trim();
      const id = `sec-${currentH2Index}`;
      const numberPrefix = `${currentH2Index}`;

      const newSec: ParsedSection = {
        id,
        title,
        level: 2,
        numberPrefix,
        contentLines: []
      };

      currentSection = newSec;
      sections.push(newSec);

      toc.push({
        id,
        text: title,
        level: 2,
        numberPrefix,
        subItems: []
      });
    } else if (line.startsWith('### ')) {
      currentH3Index++;
      const title = line.replace(/^###\s+/, '').trim();
      const id = `sec-${currentH2Index}-${currentH3Index}`;
      const numberPrefix = `${currentH2Index}.${currentH3Index}`;

      const newSec: ParsedSection = {
        id,
        title,
        level: 3,
        numberPrefix,
        contentLines: []
      };

      currentSection = newSec;
      sections.push(newSec);

      const lastH2 = toc[toc.length - 1];
      if (lastH2 && lastH2.level === 2) {
        if (!lastH2.subItems) lastH2.subItems = [];
        lastH2.subItems.push({
          id,
          text: title,
          level: 3,
          numberPrefix
        });
      } else {
        toc.push({
          id,
          text: title,
          level: 3,
          numberPrefix
        });
      }
    } else {
      if (currentSection) {
        currentSection.contentLines.push(line);
      } else {
        // Content before first H2 (if any)
        if (sections.length === 0 && line.trim().length > 0) {
          const introSec: ParsedSection = {
            id: 'sec-intro',
            title: '導入',
            level: 2,
            numberPrefix: '0',
            contentLines: [line]
          };
          currentSection = introSec;
          sections.push(introSec);
        }
      }
    }
  }

  return { toc, sections };
}
