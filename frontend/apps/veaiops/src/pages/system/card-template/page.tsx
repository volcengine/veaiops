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

// ==================== React ====================
import type React from 'react';

// ==================== Internal packages ====================
import type apiClient from '@/utils/api-client';
import { CustomTable } from '@veaiops/components';

// ✅ Fix: Directly use AgentTemplate type from api-generate (single source of truth principle)
import type { AgentTemplate } from 'api-generate';
// ==================== Relative paths ====================
import { CardTemplateDrawer, CardTemplateGuide } from './components';
import { useCardTemplatePage } from './hooks';

/**
 * Event center - card template management page
 * @description Provides card template creation, management, and configuration functionality
 */
export const CardTemplatePage: React.FC = () => {
  // ✅ Use cohesive page-level Hook, encapsulates all business logic
  const {
    // Table reference
    tableRef,

    // Guide-related state
    shouldShowGuide,
    guideVisible,
    setGuideVisible,

    // Management logic
    managementLogic: {
      modalVisible,
      editingTemplate,
      form,
      handleCancel,
      handleSubmit,
    },

    // Table configuration
    dataSource,
    tableProps,
    handleColumns,
    handleFilters,
    queryFormat,

    // Action button configuration
    actions,
  } = useCardTemplatePage();

  // If in initial state and list is empty, show guide page
  if (shouldShowGuide) {
    return (
      <div className="page-container">
        <CardTemplateGuide
          visible={guideVisible}
          onClose={() => setGuideVisible(false)}
          onComplete={() => {
            setGuideVisible(false);
            // Refresh page data
            // window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <CustomTable<
        AgentTemplate,
        any,
        typeof apiClient.agentTemplate,
        AgentTemplate
      >
        ref={tableRef}
        title="卡片模版管理"
        actions={actions}
        handleColumns={handleColumns}
        handleFilters={handleFilters}
        dataSource={dataSource}
        syncQueryOnSearchParams
        useActiveKeyHook
        tableProps={{
          ...tableProps,
          scroll: { x: 1200 },
          rowKey: '_id',
        }}
        queryFormat={queryFormat}
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

export default CardTemplatePage;
