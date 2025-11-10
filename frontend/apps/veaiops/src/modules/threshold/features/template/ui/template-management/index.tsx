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

import { Card, Table } from '@arco-design/web-react';
import type { MetricTemplate } from 'api-generate';
import { useState } from 'react';
// TODO: TemplateDetailDrawer component needs to be created or imported from correct location
// import { TemplateDetailDrawer } from '../components/template-detail-drawer';
import { TemplatePageHeader, createTemplateColumns } from './components';
import { useTemplateActions, useTemplateData } from './hooks';

/**
 * Refactored threshold template management component
 * @description Uses generic DataTable component and auto-generated API types to reduce code duplication
 *
 * @date 2025-01-21
 */
export const ThresholdTemplateManagementRefactored = () => {
  // State management
  const [selectedTemplate, setSelectedTemplate] =
    useState<MetricTemplate | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  // Editor state (reserved feature, edit functionality pending implementation)
  // Note: These state variables are currently unused but reserved for future template editing functionality
  const [_editorVisible, setEditorVisible] = useState(false);
  const [_editMode, setEditMode] = useState(false);

  // Use API Hook to get template list
  const { templates, loading, fetchTemplates } = useTemplateData();

  // Table column configuration
  const columns = createTemplateColumns();

  // Template operation handlers
  const { handleCloneTemplate, handleDeleteTemplate } = useTemplateActions({
    fetchTemplates,
  });

  // Create template
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setEditMode(false);
    setEditorVisible(true);
  };

  // Transform template data to format required by detail drawer
  const getTemplateDetailData = (template: MetricTemplate | null) => {
    if (!template) {
      return null;
    }

    return {
      template_id: template._id || '',
      template_name: template.name || '',
      description: template.name || '',
      metric_type: template.metric_type,
      min_step: template.min_step || 0,
      max_value: template.max_value || 0,
      min_value: template.min_value || 0,
      min_violation: template.min_violation || 0,
      min_violation_ratio: template.min_violation_ratio || 0,
      normal_range_start: template.normal_range_start || 0,
      normal_range_end: template.normal_range_end || 0,
      missing_value: template.missing_value || null,
      failure_interval_expectation: template.failure_interval_expectation || 0,
      display_unit: template.display_unit || '',
      linear_scale: template.linear_scale || 1,
      max_time_gap: template.max_time_gap || 0,
      min_ts_length: template.min_ts_length || 0,
      status: template.is_active ? 'active' : 'inactive',
      usage_count: 0,
      created_at: undefined,
      updated_at: template.updated_at,
    };
  };

  return (
    <div className="p-6">
      <TemplatePageHeader
        onRefresh={fetchTemplates}
        onCreate={handleCreateTemplate}
        loading={loading}
      />

      {/* Use generic DataTable component */}
      <Card>
        {/* Use Arco Table component */}
        <Table
          data={templates || []}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: true,
            showJumper: true,
            sizeCanChange: true,
          }}
          rowKey="_id"
        />
      </Card>

      {/* Template detail drawer */}
      {/* TODO: TemplateDetailDrawer component needs to be created or imported from correct location */}
      {/* <TemplateDetailDrawer
        visible={detailVisible}
        selectedTemplate={getTemplateDetailData(selectedTemplate)}
        onClose={() => setDetailVisible(false)}
      /> */}
    </div>
  );
};

export default ThresholdTemplateManagementRefactored;
