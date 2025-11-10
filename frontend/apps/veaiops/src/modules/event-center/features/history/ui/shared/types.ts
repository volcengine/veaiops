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

import type { Event } from 'api-generate';
import type React from 'react';

/**
 * History event detail drawer component props interface
 */
export interface HistoryDetailDrawerProps {
  visible: boolean;
  selectedRecord: Event | null;
  onClose: () => void;
}

/**
 * Collapsible section component props interface
 */
export interface CollapsibleSectionProps {
  title: string;
  sectionKey: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expandedSections: Set<string>;
  onToggle: (section: string) => void;
  collapsedHint?: string; // Hint text when collapsed
}

/**
 * Event overview component props interface
 */
export interface EventOverviewProps {
  selectedRecord: Event;
}

/**
 * Time info component props interface
 */
export interface TimeInfoProps {
  selectedRecord: Event;
}

/**
 * Raw data component props interface
 */
export interface RawDataProps {
  selectedRecord: Event;
  format: 'json' | 'formatted';
  onFormatChange: (format: 'json' | 'formatted') => void;
}

/**
 * Event type configuration interface
 */
export interface EventTypeConfig {
  color: string;
  text: string;
  icon: string;
  bgColor: string;
  description: string;
}

/**
 * Event level configuration interface
 */
export interface EventLevelConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  priority: number;
}
