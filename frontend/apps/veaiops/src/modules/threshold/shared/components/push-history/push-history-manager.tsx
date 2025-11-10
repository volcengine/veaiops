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

import { HistoryDetailDrawer } from '@/modules/event-center/features/history/ui';
import { detectModuleTypeFromPath } from '@/types/module';
import { useLocation } from '@modern-js/runtime/router';
import type { Event } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { PushHistoryTable } from './push-history-table';
import type { PushHistoryManagerProps, PushHistoryRecord } from './types';

/**
 * Generic push history management component
 * @description Provides push history viewing and management functionality, supports filtering by module type
 *
 * Refactoring notes:
 * - Use PushHistoryTable component from shared directory
 * - Use correct Hooks and configuration
 * - Provide complete event detail viewing functionality
 */
const PushHistoryManager: React.FC<PushHistoryManagerProps> = ({
  moduleType,
  showModuleTypeColumn = true,
  customActions,
}) => {
  const location = useLocation();
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Event | null>(null);

  // Automatically determine module type based on route
  const detectedModuleType = useMemo(() => {
    if (moduleType) {
      return moduleType;
    }

    return detectModuleTypeFromPath(location.pathname);
  }, [moduleType, location.pathname]);

  /**
   * Transform push history record to format processable by event detail component
   */
  const transformPushRecordToEvent = useCallback(
    (pushRecord: PushHistoryRecord) => {
      return {
        event_id:
          pushRecord._id ||
          ((pushRecord as Record<string, unknown>).id as string) ||
          '',
        agent_type: pushRecord.agent_type || 'unknown',
        event_level: pushRecord.event_level || 'P2',
        status: pushRecord.status === 3 ? 1 : 0, // 3 means success, others mean failure
        raw_data: pushRecord.raw_data || pushRecord,
        created_at: pushRecord.created_at,
        updated_at: pushRecord.updated_at,
        datasource_type: pushRecord.datasource_type || pushRecord.agent_type,
        region: pushRecord.region || [],
        project: pushRecord.project || [],
        product: pushRecord.product || [],
        customer: pushRecord.customer || [],
        channel_msg: pushRecord.channel_msg || null,
      };
    },
    [],
  );

  /**
   * View detail
   * 🔧 Use useCallback to avoid creating new function on every render
   */
  const handleViewDetail = useCallback(
    (record: PushHistoryRecord) => {
      const transformedRecord = transformPushRecordToEvent(record);
      setSelectedRecord(transformedRecord as Event);
      setDetailDrawerVisible(true);
    },
    [transformPushRecordToEvent],
  );

  /**
   * Close detail drawer
   * 🔧 Use useCallback to avoid creating new function on every render
   */
  const handleCloseDetail = useCallback(() => {
    setDetailDrawerVisible(false);
    setSelectedRecord(null);
  }, []);

  return (
    <>
      {/* Push history table */}
      <PushHistoryTable
        moduleType={detectedModuleType}
        title="历史事件"
        showModuleTypeColumn={showModuleTypeColumn}
        customActions={customActions}
        onViewDetail={handleViewDetail}
      />

      {/* Event detail drawer */}
      <HistoryDetailDrawer
        visible={detailDrawerVisible}
        selectedRecord={selectedRecord}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export { PushHistoryManager };
