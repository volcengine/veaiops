// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Button, Card, Typography } from '@arco-design/web-react';
import { IconClose, IconEye } from '@arco-design/web-react/icon';
// ✅ Optimization: Use shortest path, merge same-source imports
import { type CollapsibleSectionProps, STYLES } from '@ec/shared';
import type React from 'react';

const { Title } = Typography;

/**
 * Collapsible section component
 * Provides expandable/collapsible content area
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  sectionKey,
  children,
  expandedSections,
  onToggle,
  collapsedHint,
}) => {
  const isExpanded = expandedSections.has(sectionKey);

  return (
    <Card
      size="small"
      style={{
        marginBottom: '16px',
        border: STYLES.CARD_BORDER,
        borderRadius: STYLES.SECTION_BORDER_RADIUS,
        boxShadow: STYLES.CARD_SHADOW,
        transition: 'all 0.3s ease',
        background: isExpanded ? '#FFFFFF' : '#F8FAFF',
      }}
      title={
        <div
          className="flex items-center justify-between cursor-pointer"
          style={{
            transition: 'all 0.2s ease',
          }}
          onClick={() => onToggle(sectionKey)}
        >
          <div className="flex items-center gap-3">
            <Title
              heading={6}
              style={{ margin: 0, color: STYLES.TEXT_PRIMARY }}
            >
              {title}
            </Title>
            {!isExpanded && collapsedHint && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] text-[#165DFF] font-medium tracking-wide transition-all duration-300 border border-[#165DFF] bg-[#E8F3FF] shadow-[0_2px_4px_rgba(22,93,255,0.2)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 8px rgba(22, 93, 255, 0.3)';
                  e.currentTarget.style.background = '#D6E8FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 4px rgba(22, 93, 255, 0.2)';
                  e.currentTarget.style.background = '#E8F3FF';
                }}
              >
                <span className="text-[10px]">👆</span>
                <span>{collapsedHint}</span>
                <div
                  className="w-1 h-1 rounded-full bg-[#165DFF]"
                  style={{
                    animation: 'pulse 2s infinite',
                  }}
                />
              </div>
            )}
          </div>
          <Button
            type="text"
            size="small"
            icon={isExpanded ? <IconClose /> : <IconEye />}
            style={{
              color: STYLES.TEXT_SECONDARY,
              transition: 'all 0.2s ease',
            }}
          />
        </div>
      }
    >
      {isExpanded && (
        <div
          style={{
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          {children}
        </div>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `,
        }}
      />
    </Card>
  );
};
