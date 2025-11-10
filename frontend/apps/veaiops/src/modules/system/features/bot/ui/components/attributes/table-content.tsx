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

import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useBotAttributesTable } from '@bot/hooks';
import type { BotAttributeFiltersQuery } from '@bot/types';
import { CustomTable } from '@veaiops/components';
import type { BotAttribute } from 'api-generate';
import type React from 'react';
import { BotAttributeFormModal } from '../bot/attribute-form-modal';
import { AttributeDetailModal } from './detail-modal';

/**
 * Attribute table content component Props
 */
export interface AttributesTableContentProps {
  botId?: string;
  channel?: string;
}

/**
 * Attribute table content component
 *
 * Architecture description:
 * - Internally uses useBotAttributesTable Hook to aggregate all table-related functionality (business logic, configuration, state management)
 * - Fully self-contained for all table-related UI and logic: CustomTable, modals, state management
 * - Follows Feature-Based architecture cohesion principle: all table-related content is in this component
 * - Main component only needs to pass necessary props (botId, channel), no need to manage internal state
 */
export const AttributesTableContent: React.FC<AttributesTableContentProps> = ({
  botId,
  channel,
}) => {
  // 🎯 Table-related functionality fully aggregated (business logic, configuration, event handling, state management)
  // All table-related logic is cohesive within this component
  const table = useBotAttributesTable({ botId, channel });

  return (
    <>
      {/* 🎯 CustomTable: Table main body */}
      <CustomTable<BotAttribute, BotAttributeFiltersQuery>
        ref={table.tableRef}
        actions={[
          <Button
            key="create"
            type="primary"
            icon={<IconPlus />}
            onClick={table.logic.handleOpenCreateModal}
          >
            新增关注
          </Button>,
        ]}
        actionClassName="ml-auto"
        handleColumns={table.handleColumns}
        handleFilters={table.handleFilters}
        initQuery={table.initQuery}
        dataSource={table.dataSource}
        tableProps={table.tableProps}
      />

      {/* 🎯 Create/Edit modal (cohesive within table component) */}
      <BotAttributeFormModal
        visible={table.logic.isModalVisible}
        type={table.logic.modalType}
        attribute={table.logic.editingAttribute || undefined}
        loading={table.logic.loading}
        onSubmit={table.handleFormSubmit}
        onCancel={table.logic.handleCloseModal}
      />

      {/* 🎯 View details popup (cohesive within table component) */}
      <AttributeDetailModal
        visible={table.logic.viewModalVisible}
        attribute={table.logic.viewingAttribute || undefined}
        onCancel={table.logic.handleCloseViewModal}
      />
    </>
  );
};
