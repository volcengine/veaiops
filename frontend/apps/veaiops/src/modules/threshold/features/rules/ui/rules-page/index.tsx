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

import { Button, Space, Table, Typography } from '@arco-design/web-react';
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import type React from 'react';
import { useEffect } from 'react';
import { createTableColumns } from '../../lib/columns';
import { useRulesLogic, useRulesState } from './hooks';
import { RuleDetailModal, RuleFormModal } from './sections';

const { Title } = Typography;

/**
 * Intelligent threshold rules configuration page
 * Note: Since the backend API structure does not match the frontend's expected ThresholdRule,
 * empty data is temporarily used here, waiting for the backend to provide the corresponding threshold rules API
 */
const ThresholdRulesPage: React.FC = () => {
  const state = useRulesState();
  const {
    loading,
    rules,
    modalVisible,
    detailModalVisible,
    editingRule,
    selectedRule,
    form,
    setModalVisible,
    setDetailModalVisible,
    setEditingRule,
    setSelectedRule,
  } = state;

  const {
    handleFetchRules,
    handleDeleteRule,
    handleToggleRule,
    handleCopyRule,
    openEditModal,
    viewRuleDetail,
    handleSubmit,
  } = useRulesLogic(state);

  // Table column configuration
  const columns = createTableColumns({
    onEdit: openEditModal,
    onDelete: handleDeleteRule,
    onToggle: handleToggleRule,
    onCopy: handleCopyRule,
    onViewDetail: viewRuleDetail,
  });

  useEffect(() => {
    handleFetchRules();
  }, [handleFetchRules]);

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingRule(null);
  };

  const handleDetailCancel = () => {
    setDetailModalVisible(false);
    setSelectedRule(null);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Title heading={5} className="m-0">
          智能阈值规则
        </Title>
        <Space>
          <Button
            icon={<IconRefresh />}
            onClick={handleFetchRules}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => {
              setEditingRule(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建规则
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        data={rules}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1600 }}
        pagination={{
          showTotal: true,
          sizeOptions: [10, 20, 50],
        }}
      />

      {/* Create/Edit rule modal */}
      <RuleFormModal
        visible={modalVisible}
        editingRule={editingRule}
        loading={loading}
        form={form}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      {/* Rule detail modal */}
      <RuleDetailModal
        visible={detailModalVisible}
        selectedRule={selectedRule}
        onCancel={handleDetailCancel}
      />
    </div>
  );
};

export { ThresholdRulesPage };
export default ThresholdRulesPage;
