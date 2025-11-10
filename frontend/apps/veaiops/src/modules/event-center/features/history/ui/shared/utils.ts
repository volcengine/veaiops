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

import { Message } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import type { Event } from 'api-generate';

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (
  text: string,
  label: string,
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    Message.success(`${label} 已复制到剪贴板`);
    return true;
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || '复制失败，请重试';
    logger.error({
      message: '复制失败',
      data: {
        error: errorObj,
        errorMessage,
        text,
        label,
      },
      source: 'copyToClipboard',
      component: 'copyToClipboard',
    });
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Download raw data as JSON file
 */
export const downloadRawData = (selectedRecord: Event): void => {
  if (!selectedRecord.raw_data) {
    Message.warning('没有原始数据可下载');
    return;
  }

  try {
    const dataStr = JSON.stringify(selectedRecord.raw_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-${
      selectedRecord.event_id || 'unknown'
    }-raw-data.json`;
    link.click();
    URL.revokeObjectURL(url);
    Message.success('文件下载已开始');
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || '下载失败，请重试';
    logger.error({
      message: '下载失败',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        errorMessage,
        eventId: selectedRecord.event_id,
      },
      source: 'downloadRawData',
      component: 'downloadRawData',
    });
    Message.error(errorMessage);
  }
};

/**
 * Toggle section expand state
 */
export const toggleSection = (
  expandedSections: Set<string>,
  setExpandedSections: React.Dispatch<React.SetStateAction<Set<string>>>,
  section: string,
): void => {
  const newExpanded = new Set(expandedSections);
  if (newExpanded.has(section)) {
    newExpanded.delete(section);
  } else {
    newExpanded.add(section);
  }
  setExpandedSections(newExpanded);
};

/**
 * Format time display
 */
export const formatTimeDisplay = (timeString?: string): Date | null => {
  return timeString ? new Date(timeString) : null;
};

/**
 * Get event type configuration
 */
export const getEventTypeConfig = (
  agentType: string,
  eventTypeMap: Record<string, any>,
) => {
  return (
    eventTypeMap[agentType] || {
      color: '#86909C',
      text: agentType || '未知类型',
      icon: '❓',
      bgColor: '#F7F8FA',
      description: '未知事件类型',
    }
  );
};

/**
 * Get event level configuration
 */
export const getEventLevelConfig = (
  eventLevel: string,
  eventLevelMap: Record<string, any>,
) => {
  return (
    eventLevelMap[eventLevel] || {
      color: '#86909C',
      bgColor: '#F7F8FA',
      borderColor: '#86909C',
      icon: '⚪',
      priority: 5,
    }
  );
};
