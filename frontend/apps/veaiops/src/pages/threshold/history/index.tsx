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

import { useEventHistoryRequest } from '@/hooks/use-event-history-request';
import { HistoryDetailDrawer } from '@/modules/event-center/features/history/ui/components/table';
import type { Event } from '@veaiops/api-client';
import { EventHistoryTable, HistoryModuleType } from '@veaiops/components';
import type React from 'react';
import { useState } from 'react';

/**
 * Intelligent threshold history events page
 * Uses unified history events table component, automatically filters to show only Intelligent Threshold Agent
 */
const History: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Event | null>(null);

  const request = useEventHistoryRequest({
    moduleType: HistoryModuleType.INTELLIGENT_THRESHOLD,
  });

  const handleViewDetail = (record: Event) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const handleCloseDetail = () => {
    setDrawerVisible(false);
    setSelectedRecord(null);
  };

  return (
    <>
      <EventHistoryTable
        moduleType={HistoryModuleType.INTELLIGENT_THRESHOLD}
        title="历史事件"
        request={request}
        onViewDetail={handleViewDetail}
      />

      <HistoryDetailDrawer
        visible={drawerVisible}
        selectedRecord={selectedRecord}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default History;
