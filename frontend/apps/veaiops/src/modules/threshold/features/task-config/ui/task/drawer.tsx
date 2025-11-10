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

import { Form } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import type { TaskOperateType } from '@task-config/lib';
import type {
  IntelligentThresholdTask,
  IntelligentThresholdTaskVersion,
  MetricThresholdResult,
} from 'api-generate';
import type React from 'react';
import { useEffect, useState } from 'react';
import { CleaningResultDrawer } from '../cleaning';
import { MainTaskDrawer, MetricConfigDrawer } from '../components/drawers';
import { MetricDetailConfig, RerunFormConfig } from '../components/forms';
import { useVersionHistory } from '../hooks';

/**
 * Task drawer component props interface
 */
interface TaskDrawerProps {
  visible: boolean;
  operationType: TaskOperateType;
  editingTask: IntelligentThresholdTask | null;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<boolean>;
  form: FormInstance;
  loading: boolean;
  onViewTimeSeries?: (
    record: MetricThresholdResult,
    task?: IntelligentThresholdTask,
  ) => void;
}

// Export detail configuration render function for use by other components
export const renderDetailConfig = ({
  form,
  readOnly = false,
}: {
  form: FormInstance;
  readOnly?: boolean;
}) => <MetricDetailConfig form={form} readOnly={readOnly} />;

// Export rerun form render function for use by other components
export const renderRerunForm = ({ form }: { form: FormInstance }) => (
  <RerunFormConfig form={form} />
);

/**
 * Task operation drawer component
 */
export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  visible,
  operationType,
  editingTask,
  onCancel,
  onSubmit,
  form,
  loading,
  onViewTimeSeries,
}) => {
  // State management
  const [detailConfigVisible, setDetailConfigVisible] = useState(false);
  const [detailConfigData, setDetailConfigData] = useState({});
  const [detailConfigForm] = Form.useForm();
  const [cleaningResultVisible, setCleaningResultVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<IntelligentThresholdTaskVersion | null>(null);

  // Version history management
  const { versions, loading: versionsLoading } = useVersionHistory(
    editingTask?._id,
    operationType === 'versions' && visible,
  );

  // Synchronize detail configuration data
  useEffect(() => {
    detailConfigForm.setFieldsValue(detailConfigData);
  }, [detailConfigData, detailConfigForm]);

  // Handle cleaning result view
  const handleViewCleaningResult = (
    version: IntelligentThresholdTaskVersion,
  ) => {
    setSelectedVersion(version);
    setCleaningResultVisible(true);
  };

  // Handle cleaning result drawer close
  const handleCleaningResultClose = () => {
    setCleaningResultVisible(false);
    setSelectedVersion(null);
  };

  return (
    <>
      {/* Main task drawer */}
      <MainTaskDrawer
        visible={visible}
        operationType={operationType}
        editingTask={editingTask}
        onCancel={onCancel}
        onSubmit={onSubmit}
        form={form}
        loading={loading}
        versions={versions}
        versionsLoading={versionsLoading}
        setDetailConfigData={setDetailConfigData}
        setDetailConfigVisible={setDetailConfigVisible}
        onViewCleaningResult={handleViewCleaningResult}
      />

      {/* Metric template configuration drawer */}
      <MetricConfigDrawer
        visible={detailConfigVisible}
        form={detailConfigForm}
        onCancel={() => setDetailConfigVisible(false)}
      />

      {/* Cleaning result drawer */}
      <CleaningResultDrawer
        visible={cleaningResultVisible}
        taskRecord={editingTask}
        versionRecord={selectedVersion}
        onClose={handleCleaningResultClose}
        onViewTimeSeries={onViewTimeSeries}
      />
    </>
  );
};

export default TaskDrawer;
