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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { useCardTemplateTableConfig } from '@card-template';
import { CustomTable } from '@veaiops/components';
import type { AgentTemplate } from 'api-generate';
import { useEffect, useState } from 'react';
import { CardTemplateGuide } from './components/guide';
import CardTemplateDrawer from './components/modal';

/**
 * Card template management page - Hook aggregation pattern + auto-refresh mechanism
 *
 * 🎯 Best practice implementation after refactoring:
 * - Hook aggregation pattern: All business logic centralized in Hook
 * - Auto-refresh mechanism: Zero-config refresh through operationWrapper
 * - Component responsibility separation: Page only responsible for assembly, business logic handled by Hook
 *
 * @returns Card template management page component
 */
export const CardTemplateManagementConfig: React.FC = () => {
  const [, setData] = useState<AgentTemplate[]>([]);
  const [, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);

  // 🎯 Use aggregated table configuration Hook (contains all business logic)
  const {
    // Table configuration
    customTableProps,
    handleColumns,
    handleFilters,
    renderActions,
    queryFormat,

    // Business logic state
    modalVisible,
    editingTemplate,
    form,

    // Business logic handlers
    handleCancel,
    handleSubmit,
  } = useCardTemplateTableConfig({});

  // Check if guide page needs to be displayed
  useEffect(() => {
    const checkInitialState = async () => {
      try {
        setLoading(true);
        const response =
          await apiClient.agentTemplate.getApisV1ManagerEventCenterAgentTemplate(
            {
              limit: 10,
              skip: 0,
            },
          );

        if (response.data && response.data.length === 0) {
          setShowGuide(true);
          setGuideVisible(true);
        }
        setData(response.data || []);
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : '获取模版列表失败，请重试';
        Message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkInitialState();
  }, []);

  // If initial state and list is empty, display guide page
  if (showGuide && guideVisible) {
    return (
      <div className="page-container">
        <CardTemplateGuide
          visible={guideVisible}
          onClose={() => setGuideVisible(false)}
          onComplete={() => {
            setShowGuide(false);
            setGuideVisible(false);
            // Refresh page data
          }}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <CustomTable
        title="卡片模版管理"
        actions={renderActions({})}
        handleColumns={handleColumns}
        handleFilters={handleFilters}
        {...customTableProps}
        queryFormat={queryFormat}
        isAlertShow={true}
        showReset={false}
        alertType="info"
        alertContent="管理系统中的卡片模版，支持增删改查操作。"
        syncQueryOnSearchParams={true}
        useActiveKeyHook={true}
      />
      <CardTemplateDrawer
        visible={modalVisible}
        editingTemplate={editingTemplate || undefined}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </div>
  );
};
